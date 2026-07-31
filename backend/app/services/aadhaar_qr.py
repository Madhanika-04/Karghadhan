"""
app/services/aadhaar_qr.py
Aadhaar QR code decoding and UIDAI format validation service.

Supports:
  - Image files (JPEG, PNG, etc.) via pyzbar + PIL
  - PDF files via PyMuPDF (fitz) rasterisation → pyzbar
  - UIDAI Secure QR (XML) and legacy text format parsing
"""
from __future__ import annotations

import io
import logging
import re
import xml.etree.ElementTree as ET
from typing import Optional

from app.schemas.verification import AadhaarQRResult, AadhaarQRParsedFields

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# QR Decoding — Image
# ---------------------------------------------------------------------------

def decode_qr_from_image(image_bytes: bytes) -> list[str]:
    """
    Locate and decode all QR codes in a raster image.

    Returns a list of decoded UTF-8 strings.
    """
    from pyzbar.pyzbar import decode as pyzbar_decode
    from PIL import Image

    img = Image.open(io.BytesIO(image_bytes))
    # Convert to greyscale for better QR detection
    img = img.convert("L")

    decoded_objects = pyzbar_decode(img)
    results: list[str] = []
    for obj in decoded_objects:
        try:
            results.append(obj.data.decode("utf-8"))
        except UnicodeDecodeError:
            # Secure QR may be binary — try latin-1 fallback
            results.append(obj.data.decode("latin-1"))

    logger.info("QR decode from image: found %d code(s)", len(results))
    return results


# ---------------------------------------------------------------------------
# QR Decoding — PDF
# ---------------------------------------------------------------------------

def decode_qr_from_pdf(pdf_bytes: bytes) -> list[str]:
    """
    Rasterise each page of a PDF and scan for QR codes.

    Uses PyMuPDF (fitz) for page-to-image conversion.
    """
    import fitz  # PyMuPDF

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    all_decoded: list[str] = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        # Render at 2× zoom for better QR readability
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img_bytes = pix.tobytes("png")
        decoded = decode_qr_from_image(img_bytes)
        all_decoded.extend(decoded)

    doc.close()
    logger.info("QR decode from PDF: scanned %d page(s), found %d code(s)",
                len(doc) if not doc.is_closed else 0, len(all_decoded))
    return all_decoded


# ---------------------------------------------------------------------------
# UIDAI Secure QR Format Parsing
# ---------------------------------------------------------------------------

# UIDAI Secure QR XML root tags (v1 and v2)
_UIDAI_XML_TAGS = {"PrintLetterBitmapImage", "QRCodeData"}

# Legacy text fields pattern: uid|name|dob|gender|co|...
_LEGACY_FIELD_PATTERN = re.compile(
    r"(?P<uid>\d{12}).*?(?P<name>[A-Za-z\s]+)",
    re.DOTALL,
)


def _parse_secure_xml(raw: str) -> Optional[AadhaarQRParsedFields]:
    """
    Parse UIDAI Secure QR XML format.

    Expected structure (simplified):
      <PrintLetterBitmapImage uid="..." name="..." gender="M" .../>
    or
      <QRCodeData><uid>...</uid><name>...</name>...</QRCodeData>
    """
    try:
        root = ET.fromstring(raw)
    except ET.ParseError:
        return None

    tag_base = root.tag.split("}")[-1] if "}" in root.tag else root.tag

    if tag_base not in _UIDAI_XML_TAGS:
        return None

    # Attribute-based format (most common for Aadhaar e-KYC QR)
    attrs = root.attrib
    if attrs:
        uid_full = attrs.get("uid", "")
        return AadhaarQRParsedFields(
            uid_last_four=uid_full[-4:] if len(uid_full) >= 4 else None,
            name=attrs.get("name"),
            date_of_birth=attrs.get("dob"),
            gender=attrs.get("gender"),
            care_of=attrs.get("co"),
            address=_build_address_from_attrs(attrs),
            pincode=attrs.get("pc"),
        )

    # Element-based format
    uid_el = root.find("uid") or root.find(".//uid")
    uid_text = uid_el.text if uid_el is not None and uid_el.text else ""
    return AadhaarQRParsedFields(
        uid_last_four=uid_text[-4:] if len(uid_text) >= 4 else None,
        name=_get_text(root, "name"),
        date_of_birth=_get_text(root, "dob"),
        gender=_get_text(root, "gender"),
        care_of=_get_text(root, "co"),
        pincode=_get_text(root, "pc"),
    )


def _get_text(root: ET.Element, tag: str) -> Optional[str]:
    """Safely extract text from an XML child element."""
    el = root.find(tag) or root.find(f".//{tag}")
    return el.text.strip() if el is not None and el.text else None


def _build_address_from_attrs(attrs: dict) -> Optional[str]:
    """Concatenate address fields from UIDAI QR attributes."""
    parts = []
    for key in ("house", "street", "lm", "loc", "vtc", "subdist", "dist", "state"):
        val = attrs.get(key, "").strip()
        if val:
            parts.append(val)
    return ", ".join(parts) if parts else None


def _parse_legacy_text(raw: str) -> Optional[AadhaarQRParsedFields]:
    """
    Attempt to parse legacy plain-text Aadhaar QR format.

    These older QR codes encode demographic data as delimited text.
    """
    lines = [line.strip() for line in raw.strip().splitlines() if line.strip()]
    if len(lines) < 3:
        return None

    # Heuristic: first 12-digit number is the UID
    uid = None
    for line in lines:
        match = re.search(r"\b(\d{12})\b", line)
        if match:
            uid = match.group(1)
            break

    if uid is None:
        return None

    return AadhaarQRParsedFields(
        uid_last_four=uid[-4:],
        name=lines[0] if not lines[0].isdigit() else lines[1] if len(lines) > 1 else None,
        date_of_birth=_find_date(lines),
        gender=_find_gender(lines),
    )


def _find_date(lines: list[str]) -> Optional[str]:
    """Search for a date-like pattern in QR text lines."""
    for line in lines:
        match = re.search(r"\b(\d{2}[/-]\d{2}[/-]\d{4})\b", line)
        if match:
            return match.group(1)
    return None


def _find_gender(lines: list[str]) -> Optional[str]:
    """Search for gender indicator in QR text lines."""
    for line in lines:
        upper = line.upper().strip()
        if upper in ("M", "F", "MALE", "FEMALE", "T", "TRANSGENDER"):
            return upper[0]
    return None


# ---------------------------------------------------------------------------
# Parse Dispatcher
# ---------------------------------------------------------------------------

def parse_aadhaar_qr_data(raw: str) -> tuple[str, Optional[AadhaarQRParsedFields]]:
    """
    Attempt to parse a decoded QR string as Aadhaar data.

    Returns:
        (format_name, parsed_fields) where format_name is one of:
        SECURE_XML | LEGACY_TEXT | UNKNOWN
    """
    # Try XML first (most modern Aadhaar cards)
    fields = _parse_secure_xml(raw)
    if fields is not None:
        return "SECURE_XML", fields

    # Try legacy text
    fields = _parse_legacy_text(raw)
    if fields is not None:
        return "LEGACY_TEXT", fields

    return "UNKNOWN", None


# ---------------------------------------------------------------------------
# Public Orchestrator
# ---------------------------------------------------------------------------

def validate_aadhaar_qr(file_bytes: bytes, content_type: str) -> AadhaarQRResult:
    """
    End-to-end Aadhaar QR validation.

    1. Decode QR code(s) from the uploaded file (image or PDF).
    2. Parse the decoded data against known UIDAI formats.
    3. Return structured result.

    Args:
        file_bytes: Raw bytes of the uploaded file.
        content_type: MIME type (e.g., "image/jpeg", "application/pdf").

    Returns:
        AadhaarQRResult with validation outcome.
    """
    try:
        # Step 1: Decode QR codes
        if "pdf" in content_type.lower():
            decoded_strings = decode_qr_from_pdf(file_bytes)
        else:
            decoded_strings = decode_qr_from_image(file_bytes)

        if not decoded_strings:
            logger.warning("No QR code found in uploaded Aadhaar document")
            return AadhaarQRResult(
                is_valid=False,
                qr_format=None,
                qr_raw_data=None,
                parsed_fields=None,
                error="No QR code detected in the uploaded document. "
                      "Please upload a clear image of the Aadhaar card with the QR code visible.",
            )

        # Step 2: Try parsing each decoded string (first valid match wins)
        for raw in decoded_strings:
            qr_format, parsed = parse_aadhaar_qr_data(raw)
            if parsed is not None:
                logger.info("Aadhaar QR validated: format=%s", qr_format)
                return AadhaarQRResult(
                    is_valid=True,
                    qr_format=qr_format,
                    qr_raw_data=raw[:200] + ("..." if len(raw) > 200 else ""),
                    parsed_fields=parsed,
                    error=None,
                )

        # QR found but not in Aadhaar format
        logger.warning("QR code(s) found but none match UIDAI format")
        return AadhaarQRResult(
            is_valid=False,
            qr_format="UNKNOWN",
            qr_raw_data=decoded_strings[0][:200],
            parsed_fields=None,
            error="QR code found but does not match expected UIDAI Aadhaar format. "
                  "The document may not be a genuine Aadhaar card.",
        )

    except Exception as exc:
        logger.exception("Aadhaar QR validation failed with exception")
        return AadhaarQRResult(
            is_valid=False,
            error=f"QR processing error: {exc}",
        )
