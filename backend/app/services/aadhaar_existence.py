"""
app/services/aadhaar_existence.py
Aadhaar existence verification via third-party KYC gateway.

In development mode (or when no gateway URL is configured), this service
returns a realistic mock response matching the Setu / Cashfree sandbox
JSON structure.

In production, set KYC_GATEWAY_URL and KYC_GATEWAY_API_KEY in the
environment to hit a real KYC API.
"""
from __future__ import annotations

import logging
import uuid
from typing import Optional

import httpx

from app.config import get_settings
from app.schemas.verification import AadhaarExistenceResult

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Verhoeff Checksum (UIDAI uses this for Aadhaar validation)
# ---------------------------------------------------------------------------

_VERHOEFF_TABLE_D = (
    (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
    (1, 2, 3, 4, 0, 6, 7, 8, 9, 5),
    (2, 3, 4, 0, 1, 7, 8, 9, 5, 6),
    (3, 4, 0, 1, 2, 8, 9, 5, 6, 7),
    (4, 0, 1, 2, 3, 9, 5, 6, 7, 8),
    (5, 9, 8, 7, 6, 0, 4, 3, 2, 1),
    (6, 5, 9, 8, 7, 1, 0, 4, 3, 2),
    (7, 6, 5, 9, 8, 2, 1, 0, 4, 3),
    (8, 7, 6, 5, 9, 3, 2, 1, 0, 4),
    (9, 8, 7, 6, 5, 4, 3, 2, 1, 0),
)

_VERHOEFF_TABLE_P = (
    (0, 1, 2, 3, 4, 5, 6, 7, 8, 9),
    (1, 5, 7, 6, 2, 8, 3, 0, 9, 4),
    (5, 8, 0, 3, 7, 9, 6, 1, 4, 2),
    (8, 9, 1, 6, 0, 4, 3, 5, 2, 7),
    (9, 4, 5, 3, 1, 2, 6, 8, 7, 0),
    (4, 2, 8, 6, 5, 7, 3, 9, 0, 1),
    (2, 7, 9, 3, 8, 0, 6, 4, 1, 5),
    (7, 0, 4, 6, 9, 1, 3, 2, 5, 8),
)

_VERHOEFF_TABLE_INV = (0, 4, 3, 2, 1, 5, 6, 7, 8, 9)


def _verhoeff_checksum(number: str) -> bool:
    """Validate a number string using the Verhoeff checksum algorithm."""
    c = 0
    for i, digit in enumerate(reversed(number)):
        c = _VERHOEFF_TABLE_D[c][_VERHOEFF_TABLE_P[i % 8][int(digit)]]
    return c == 0


# ---------------------------------------------------------------------------
# Format Validation
# ---------------------------------------------------------------------------

def validate_aadhaar_format(aadhaar_number: str) -> tuple[bool, Optional[str]]:
    """
    Validate Aadhaar number format and checksum.

    Returns:
        (is_valid, error_message)
    """
    cleaned = aadhaar_number.strip().replace(" ", "").replace("-", "")

    if len(cleaned) != 12:
        return False, f"Aadhaar number must be exactly 12 digits, got {len(cleaned)}"

    if not cleaned.isdigit():
        return False, "Aadhaar number must contain only digits"

    # First digit cannot be 0 or 1
    if cleaned[0] in ("0", "1"):
        return False, "Aadhaar number cannot start with 0 or 1"

    # Verhoeff checksum validation
    if not _verhoeff_checksum(cleaned):
        return False, "Aadhaar number failed Verhoeff checksum validation"

    return True, None


def _mask_aadhaar(aadhaar_number: str) -> str:
    """Mask an Aadhaar number for safe display: XXXX-XXXX-1234."""
    cleaned = aadhaar_number.strip().replace(" ", "").replace("-", "")
    return f"XXXX-XXXX-{cleaned[-4:]}"


# ---------------------------------------------------------------------------
# Mock KYC Gateway Response
# ---------------------------------------------------------------------------

def _mock_kyc_response(aadhaar_number: str) -> dict:
    """
    Generate a mock KYC gateway response matching Setu/Cashfree sandbox format.

    Rules for mock:
      - Numbers ending in '0000' → treated as non-existent
      - Numbers failing Verhoeff → treated as invalid
      - All others → VALID and existing
    """
    cleaned = aadhaar_number.strip().replace(" ", "").replace("-", "")

    if cleaned.endswith("0000"):
        return {
            "status": "VALID",
            "exists": False,
            "message": "Aadhaar number format is valid but not found in UIDAI records",
            "transaction_id": f"mock-{uuid.uuid4().hex[:12]}",
        }

    return {
        "status": "VALID",
        "exists": True,
        "message": "Aadhaar number verified successfully",
        "transaction_id": f"mock-{uuid.uuid4().hex[:12]}",
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def check_aadhaar_existence(aadhaar_number: str) -> AadhaarExistenceResult:
    """
    Check if an Aadhaar number exists in UIDAI records via a KYC gateway.

    When KYC_GATEWAY_URL is configured, makes a real API call.
    Otherwise, returns a mock response suitable for development/demo.

    Args:
        aadhaar_number: 12-digit Aadhaar number string.

    Returns:
        AadhaarExistenceResult with verification outcome.
    """
    # Step 1: Format validation
    is_valid_format, format_error = validate_aadhaar_format(aadhaar_number)
    if not is_valid_format:
        logger.warning("Aadhaar format validation failed: %s", format_error)
        return AadhaarExistenceResult(
            aadhaar_masked=_mask_aadhaar(aadhaar_number),
            status="INVALID",
            exists=False,
            gateway_ref=None,
            is_mock=True,
            error=format_error,
        )

    settings = get_settings()
    gateway_url = getattr(settings, "KYC_GATEWAY_URL", "")
    gateway_key = getattr(settings, "KYC_GATEWAY_API_KEY", "")

    # Step 2: Real API call (production) or mock (development)
    if gateway_url and gateway_key:
        return await _call_live_gateway(aadhaar_number, gateway_url, gateway_key)
    else:
        return _handle_mock(aadhaar_number)


async def _call_live_gateway(
    aadhaar_number: str,
    gateway_url: str,
    api_key: str,
) -> AadhaarExistenceResult:
    """
    Make a real HTTP call to the configured KYC gateway.

    The request/response structure follows the Setu DigiLocker / Cashfree
    verification API conventions.
    """
    masked = _mask_aadhaar(aadhaar_number)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{gateway_url}/api/v1/aadhaar/verify",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={"aadhaar_number": aadhaar_number},
            )
            response.raise_for_status()
            data = response.json()

            logger.info("KYC gateway response for %s: status=%s", masked, data.get("status"))
            return AadhaarExistenceResult(
                aadhaar_masked=masked,
                status=data.get("status", "UNKNOWN"),
                exists=data.get("exists", False),
                gateway_ref=data.get("transaction_id"),
                is_mock=False,
                error=None,
            )

    except httpx.HTTPStatusError as exc:
        logger.error("KYC gateway HTTP error: %s", exc.response.status_code)
        return AadhaarExistenceResult(
            aadhaar_masked=masked,
            status="ERROR",
            exists=False,
            gateway_ref=None,
            is_mock=False,
            error=f"KYC gateway returned HTTP {exc.response.status_code}",
        )
    except httpx.RequestError as exc:
        logger.exception("KYC gateway connection error")
        return AadhaarExistenceResult(
            aadhaar_masked=masked,
            status="ERROR",
            exists=False,
            gateway_ref=None,
            is_mock=False,
            error=f"KYC gateway connection failed: {exc}",
        )


def _handle_mock(aadhaar_number: str) -> AadhaarExistenceResult:
    """Process mock KYC response for development mode."""
    masked = _mask_aadhaar(aadhaar_number)
    mock_data = _mock_kyc_response(aadhaar_number)

    logger.info(
        "Mock KYC check for %s: status=%s, exists=%s",
        masked, mock_data["status"], mock_data["exists"],
    )

    return AadhaarExistenceResult(
        aadhaar_masked=masked,
        status=mock_data["status"],
        exists=mock_data["exists"],
        gateway_ref=mock_data["transaction_id"],
        is_mock=True,
        error=None,
    )
