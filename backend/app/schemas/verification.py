"""
app/schemas/verification.py
Pydantic v2 models for identity verification endpoints.

Covers:
  - Aadhaar QR realness check
  - Aadhaar existence (KYC gateway) check
  - Face matching (Yarn Passbook vs Aadhaar photo)
  - Aggregated full-verification response
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


# ---------------------------------------------------------------------------
# Aadhaar QR Realness Check
# ---------------------------------------------------------------------------

class AadhaarQRParsedFields(BaseModel):
    """Demographic fields extracted from a UIDAI Secure QR code."""
    uid_last_four: Optional[str] = Field(None, description="Last 4 digits of Aadhaar UID")
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    care_of: Optional[str] = Field(None, description="c/o (father/husband name)")
    address: Optional[str] = None
    pincode: Optional[str] = None


class AadhaarQRResult(BaseModel):
    """Result of decoding and validating the Aadhaar QR code."""
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "is_valid": True,
            "qr_format": "SECURE_XML",
            "qr_raw_data": "<PrintLetterBitmapImage ...>",
            "parsed_fields": {
                "uid_last_four": "1234",
                "name": "Rajesh Kumar",
                "date_of_birth": "15-06-1985",
                "gender": "M",
            },
            "error": None,
        }
    })

    is_valid: bool = Field(..., description="Whether a valid Aadhaar QR code was found and parsed")
    qr_format: Optional[str] = Field(
        None,
        description="Detected format: SECURE_XML | LEGACY_TEXT | UNKNOWN",
    )
    qr_raw_data: Optional[str] = Field(None, description="Raw decoded QR string (truncated for safety)")
    parsed_fields: Optional[AadhaarQRParsedFields] = None
    error: Optional[str] = Field(None, description="Error message if QR decoding failed")


# ---------------------------------------------------------------------------
# Aadhaar Existence Check (KYC Gateway)
# ---------------------------------------------------------------------------

class AadhaarExistenceRequest(BaseModel):
    """Request body for Aadhaar existence verification."""
    aadhaar_number: str = Field(
        ...,
        min_length=12,
        max_length=12,
        pattern=r"^\d{12}$",
        description="12-digit Aadhaar number",
        examples=["123456789012"],
    )


class AadhaarExistenceResult(BaseModel):
    """Result of the Aadhaar existence check against a KYC gateway."""
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "aadhaar_masked": "XXXX-XXXX-9012",
            "status": "VALID",
            "exists": True,
            "gateway_ref": "mock-ref-abc123",
            "is_mock": True,
            "error": None,
        }
    })

    aadhaar_masked: str = Field(..., description="Masked Aadhaar number (XXXX-XXXX-NNNN)")
    status: str = Field(..., description="VALID | INVALID | ERROR")
    exists: bool = Field(..., description="Whether the Aadhaar number exists in UIDAI records")
    gateway_ref: Optional[str] = Field(None, description="Transaction reference from the KYC gateway")
    is_mock: bool = Field(True, description="True if the response is from mock mode")
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Face Matching (Yarn Passbook vs Aadhaar)
# ---------------------------------------------------------------------------

class FaceMatchResult(BaseModel):
    """Result of facial verification between two document photos."""
    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "verified": True,
                "confidence_pct": 94.2,
                "distance": 0.23,
                "threshold": 0.40,
                "model_used": "VGG-Face",
                "flagged_for_review": False,
                "error": None,
            }
        }
    )

    verified: bool = Field(..., description="Whether the faces match above the confidence threshold")
    confidence_pct: float = Field(..., ge=0, le=100, description="Confidence percentage (0-100)")
    distance: float = Field(..., description="Raw distance metric from the model")
    threshold: float = Field(..., description="Distance threshold used for comparison")
    model_used: str = Field(..., description="DeepFace model name used")
    flagged_for_review: bool = Field(
        False,
        description="True if confidence is below 90% — requires manual admin review",
    )
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Full Verification (Aggregated)
# ---------------------------------------------------------------------------

class FullVerificationResponse(BaseModel):
    """Aggregated result of all three identity verification checks."""
    overall_verified: bool = Field(
        ...,
        description="True only if ALL checks pass without errors or flags",
    )
    aadhaar_qr: Optional[AadhaarQRResult] = None
    aadhaar_existence: Optional[AadhaarExistenceResult] = None
    face_match: Optional[FaceMatchResult] = None
    summary: str = Field("", description="Human-readable summary of verification outcome")
