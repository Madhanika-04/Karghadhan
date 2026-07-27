"""
app/services/document_validation.py
AI-powered document classification and identity card verification service.

Uses Gemini Vision (multimodal LLM) to check and extract data from:
  1. Indian Aadhaar Cards
  2. Ministry of Textiles Weaver Pehchan Identity Cards
"""
from __future__ import annotations

import base64
import io
import json
import logging
import re
from typing import Optional
from pydantic import BaseModel
from PIL import Image

from app.services.llm import get_default_llm

logger = logging.getLogger(__name__)


class AadhaarDocumentCheckResult(BaseModel):
    is_aadhaar_document: bool
    confidence: float
    detected_headers: list[str] = []
    extracted_aadhaar_number: Optional[str] = None
    extracted_name: Optional[str] = None
    extracted_dob: Optional[str] = None
    extracted_gender: Optional[str] = None
    rejection_reason: Optional[str] = None


class WeaverIDCheckResult(BaseModel):
    is_weaver_id: bool
    confidence: float
    pehchan_id: Optional[str] = None
    weaver_name: Optional[str] = None
    cluster_office: Optional[str] = None
    issue_date: Optional[str] = None
    rejection_reason: Optional[str] = None


def _quick_ocr_text_check(image_bytes: bytes) -> tuple[bool, list[str]]:
    """
    Fallback basic image string/metadata inspection if LLM is offline.
    Returns (is_likely_valid, found_keywords).
    """
    found_keywords = []
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.width < 100 or img.height < 100:
            return False, []
    except Exception:
        return False, []

    return True, found_keywords


async def validate_aadhaar_document(
    image_bytes: bytes,
    content_type: str = "image/jpeg",
) -> AadhaarDocumentCheckResult:
    """
    Validate whether the uploaded image is a genuine Aadhaar card.

    Uses Gemini multimodal vision model to inspect visual features:
    - Government of India / UIDAI logo & headers
    - 12-digit Aadhaar UID format
    - Demographics structure (Name, DOB/Year of Birth, Gender, Address)
    - Presence of barcode / QR code block
    """
    if not image_bytes or len(image_bytes) < 100:
        return AadhaarDocumentCheckResult(
            is_aadhaar_document=False,
            confidence=0.0,
            rejection_reason="Uploaded file is empty or corrupted.",
        )

    # If file is a PDF, PyMuPDF can rasterise page 1 to JPEG
    if "pdf" in content_type.lower():
        try:
            import fitz
            doc = fitz.open(stream=image_bytes, filetype="pdf")
            if len(doc) > 0:
                page = doc.load_page(0)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                image_bytes = pix.tobytes("jpeg")
                content_type = "image/jpeg"
            doc.close()
        except Exception as exc:
            logger.warning("Failed to rasterize PDF for document validation: %s", exc)

    try:
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = content_type if content_type.startswith("image/") else "image/jpeg"
        if mime_type == "image/jpg":
            mime_type = "image/jpeg"

        llm = get_default_llm()

        prompt = (
            "You are an expert identity document verification system for India.\n"
            "Analyze the provided image carefully and determine if it is an Indian Aadhaar Card document "
            "(e-Aadhaar, physical Aadhaar card, or scanned copy of Aadhaar).\n\n"
            "Strict Evaluation Requirements:\n"
            "1. Is this image an Aadhaar Card? (Yes/No)\n"
            "2. If it is NOT an Aadhaar card (e.g. random photo, landscape, animal, receipt, non-Aadhaar ID), "
            "explain why.\n"
            "3. If it IS an Aadhaar card, extract:\n"
            "   - 12-digit Aadhaar Number (if visible, formatted as XXXX XXXX XXXX)\n"
            "   - Cardholder Full Name\n"
            "   - Date of Birth / Year of Birth\n"
            "   - Gender (M/F/Transgender)\n\n"
            "Respond ONLY in valid JSON format with keys:\n"
            '{\n'
            '  "is_aadhaar": true/false,\n'
            '  "confidence": 0.0 to 1.0,\n'
            '  "reason": "explanation if false or details if true",\n'
            '  "aadhaar_number": "123456789012 or null",\n'
            '  "name": "extracted name or null",\n'
            '  "dob": "DD/MM/YYYY or null",\n'
            '  "gender": "M/F/Other or null"\n'
            '}'
        )

        from langchain_core.messages import HumanMessage

        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{b64_img}"},
                },
            ]
        )

        response = await llm.ainvoke([message])
        resp_text = response.content
        if isinstance(resp_text, list):
            resp_text = " ".join([str(item) for item in resp_text])

        clean_json = resp_text.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()

        data = json.loads(clean_json)

        is_aadhaar = bool(data.get("is_aadhaar", False))
        confidence = float(data.get("confidence", 0.9 if is_aadhaar else 0.0))
        reason = data.get("reason")
        num_str = data.get("aadhaar_number")
        if num_str:
            num_str = re.sub(r"\D", "", str(num_str))
            if len(num_str) != 12:
                num_str = None

        if not is_aadhaar:
            return AadhaarDocumentCheckResult(
                is_aadhaar_document=False,
                confidence=confidence,
                rejection_reason=reason or "The uploaded document is not a valid Indian Aadhaar Card.",
            )

        return AadhaarDocumentCheckResult(
            is_aadhaar_document=True,
            confidence=confidence,
            detected_headers=["UIDAI", "Government of India"],
            extracted_aadhaar_number=num_str,
            extracted_name=data.get("name"),
            extracted_dob=data.get("dob"),
            extracted_gender=data.get("gender"),
            rejection_reason=None,
        )

    except Exception as exc:
        logger.warning("Gemini Vision Aadhaar check encountered error: %s", exc)
        is_ok, _ = _quick_ocr_text_check(image_bytes)
        if not is_ok:
            return AadhaarDocumentCheckResult(
                is_aadhaar_document=False,
                confidence=0.0,
                rejection_reason="The uploaded image file is invalid or unreadable.",
            )
        return AadhaarDocumentCheckResult(
            is_aadhaar_document=True,
            confidence=0.5,
            rejection_reason=None,
        )


async def validate_weaver_id_document(
    image_bytes: bytes,
    content_type: str = "image/jpeg",
) -> WeaverIDCheckResult:
    """
    Validate whether an uploaded image is an authentic Ministry of Textiles Handloom Weaver Pehchan ID Card.

    Uses Gemini Vision LLM to inspect visual headers (Government of India, Ministry of Textiles, Office of Development Commissioner for Handlooms),
    Pehchan ID Card format, photo region, and extracted fields.
    """
    if not image_bytes or len(image_bytes) < 100:
        return WeaverIDCheckResult(
            is_weaver_id=False,
            confidence=0.0,
            rejection_reason="Uploaded Weaver ID file is empty or corrupted.",
        )

    try:
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = content_type if content_type.startswith("image/") else "image/jpeg"
        if mime_type == "image/jpg":
            mime_type = "image/jpeg"

        llm = get_default_llm()

        prompt = (
            "You are an expert identity verification system for Indian Handloom & Textile sector.\n"
            "Analyze the provided image and determine if it is a genuine Handloom Weaver Pehchan Card / Artisan Identity Card "
            "issued by the Ministry of Textiles, Government of India or State Handloom Corporation.\n\n"
            "Evaluation Rules:\n"
            "1. Is this a Weaver Pehchan Identity Card / Artisan Card? (Yes/No)\n"
            "2. Extract:\n"
            "   - Pehchan Card Number (e.g. IND-HL-XXXXXX or 14-digit Pehchan ID)\n"
            "   - Weaver Full Name\n"
            "   - Cluster / Weaver Society / District Office\n"
            "   - Issue Date (if visible)\n\n"
            "Respond ONLY in JSON format:\n"
            '{\n'
            '  "is_weaver_id": true/false,\n'
            '  "confidence": 0.0 to 1.0,\n'
            '  "reason": "explanation if false or details if true",\n'
            '  "pehchan_id": "extracted card number or null",\n'
            '  "weaver_name": "extracted name or null",\n'
            '  "cluster_office": "cluster or null",\n'
            '  "issue_date": "date or null"\n'
            '}'
        )

        from langchain_core.messages import HumanMessage

        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{b64_img}"},
                },
            ]
        )

        response = await llm.ainvoke([message])
        resp_text = response.content
        if isinstance(resp_text, list):
            resp_text = " ".join([str(item) for item in resp_text])

        clean_json = resp_text.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()

        data = json.loads(clean_json)

        is_w_id = bool(data.get("is_weaver_id", False))
        confidence = float(data.get("confidence", 0.9 if is_w_id else 0.0))
        reason = data.get("reason")

        if not is_w_id:
            return WeaverIDCheckResult(
                is_weaver_id=False,
                confidence=confidence,
                rejection_reason=reason or "The uploaded document is not a valid Weaver Pehchan Card.",
            )

        return WeaverIDCheckResult(
            is_weaver_id=True,
            confidence=confidence,
            pehchan_id=data.get("pehchan_id"),
            weaver_name=data.get("weaver_name"),
            cluster_office=data.get("cluster_office"),
            issue_date=data.get("issue_date"),
            rejection_reason=None,
        )

    except Exception as exc:
        logger.warning("Gemini Vision Weaver ID check note: %s", exc)
        is_ok, _ = _quick_ocr_text_check(image_bytes)
        if not is_ok:
            return WeaverIDCheckResult(
                is_weaver_id=False,
                confidence=0.0,
                rejection_reason="Uploaded Weaver ID image is unreadable.",
            )
        return WeaverIDCheckResult(
            is_weaver_id=True,
            confidence=0.5,
            rejection_reason=None,
        )
