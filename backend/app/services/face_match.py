"""
app/services/face_match.py
Facial verification service for comparing Yarn Passbook photo against Aadhaar photo.

Uses the DeepFace library to perform face verification.
If confidence falls below the configured threshold (default 90%),
the result is flagged for manual admin review.
"""
from __future__ import annotations

import logging
import os
import tempfile
import uuid
from typing import Optional

from app.config import get_settings
from app.schemas.verification import FaceMatchResult

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Configuration Defaults
# ---------------------------------------------------------------------------

_DEFAULT_MODEL = "VGG-Face"
_DEFAULT_THRESHOLD = 0.40       # Cosine distance threshold for VGG-Face
_CONFIDENCE_REVIEW_PCT = 90.0   # Flag for review if confidence < 90%


# ---------------------------------------------------------------------------
# Distance → Confidence Conversion
# ---------------------------------------------------------------------------

def _distance_to_confidence(distance: float, threshold: float) -> float:
    """
    Convert a cosine distance to a confidence percentage.

    Mapping:
      distance = 0.0  → 100% confidence
      distance = threshold → ~(1 - threshold/max_distance)*100
      distance ≥ 1.0  → 0% confidence

    We use a linear mapping clamped to [0, 100].
    """
    # For cosine distance, 0 = identical, 1 = orthogonal
    confidence = max(0.0, min(100.0, (1.0 - distance) * 100.0))
    return round(confidence, 2)


# ---------------------------------------------------------------------------
# Core Face Comparison
# ---------------------------------------------------------------------------

def compare_faces(
    image1_bytes: bytes,
    image2_bytes: bytes,
    model_name: Optional[str] = None,
    distance_threshold: Optional[float] = None,
) -> FaceMatchResult:
    """
    Compare two face images and return a verification result.

    This function:
      1. Writes both images to secure temporary files.
      2. Runs DeepFace.verify() with the configured model.
      3. Converts the distance metric to a confidence percentage.
      4. Flags the result for manual review if confidence < 90%.
      5. Cleans up temporary files.

    Args:
        image1_bytes: Raw bytes of the first image (e.g., Yarn Passbook photo).
        image2_bytes: Raw bytes of the second image (e.g., Aadhaar photo).
        model_name: DeepFace model to use (default: VGG-Face).
        distance_threshold: Custom distance threshold (default: 0.40).

    Returns:
        FaceMatchResult with verification outcome.
    """
    settings = get_settings()

    model = model_name or getattr(settings, "FACE_MATCH_MODEL", _DEFAULT_MODEL)
    threshold = distance_threshold or getattr(settings, "FACE_MATCH_THRESHOLD", _DEFAULT_THRESHOLD)

    tmp_dir = None
    path1 = None
    path2 = None

    try:
        # Create secure temporary directory for image files
        tmp_dir = tempfile.mkdtemp(prefix="kargha_face_")
        path1 = os.path.join(tmp_dir, f"{uuid.uuid4().hex}_passbook.jpg")
        path2 = os.path.join(tmp_dir, f"{uuid.uuid4().hex}_aadhaar.jpg")

        with open(path1, "wb") as f:
            f.write(image1_bytes)
        with open(path2, "wb") as f:
            f.write(image2_bytes)

        logger.info(
            "Starting face verification: model=%s, threshold=%.3f",
            model, threshold,
        )

        # Run DeepFace verification
        from deepface import DeepFace

        result = DeepFace.verify(
            img1_path=path1,
            img2_path=path2,
            model_name=model,
            distance_metric="cosine",
            enforce_detection=True,
        )

        distance = result.get("distance", 1.0)
        verified = result.get("verified", False)
        used_threshold = result.get("threshold", threshold)

        confidence_pct = _distance_to_confidence(distance, used_threshold)
        flagged = confidence_pct < _CONFIDENCE_REVIEW_PCT

        logger.info(
            "Face match result: verified=%s, distance=%.4f, confidence=%.2f%%, flagged=%s",
            verified, distance, confidence_pct, flagged,
        )

        return FaceMatchResult(
            verified=verified,
            confidence_pct=confidence_pct,
            distance=round(distance, 6),
            threshold=round(used_threshold, 4),
            model_used=model,
            flagged_for_review=flagged,
            error=None,
        )

    except ValueError as exc:
        # DeepFace raises ValueError when no face is detected
        error_msg = str(exc)
        logger.warning("Face detection failed: %s", error_msg)
        return FaceMatchResult(
            verified=False,
            confidence_pct=0.0,
            distance=1.0,
            threshold=threshold,
            model_used=model,
            flagged_for_review=True,
            error=f"Face detection failed: {error_msg}. "
                  "Ensure both images contain a clearly visible face.",
        )

    except Exception as exc:
        logger.exception("Unexpected error during face verification")
        return FaceMatchResult(
            verified=False,
            confidence_pct=0.0,
            distance=1.0,
            threshold=threshold,
            model_used=model,
            flagged_for_review=True,
            error=f"Face verification error: {exc}",
        )

    finally:
        # Clean up temporary files
        for path in (path1, path2):
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass
        if tmp_dir and os.path.exists(tmp_dir):
            try:
                os.rmdir(tmp_dir)
            except OSError:
                pass
