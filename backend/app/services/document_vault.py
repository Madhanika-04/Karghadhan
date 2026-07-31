"""
app/services/document_vault.py
Personal User Document Vault Service for KarghaDhan.

Maintains an isolated, secure document vault for each individual weaver in Firestore:
Path: `weavers/{weaver_id}/documents/{doc_type}`

Supported Document Types:
- pehchan_card: Ministry of Textiles Pehchan Identity Card
- yarn_passbook: NHDP / e-Dhaga Yarn Passbook Document
- aadhaar_card: Aadhaar Identity Document
- bank_passbook: Bank Passbook / Cancelled Cheque
- loom_photo: Photograph of Active Loom Setup
- passport_photo: Artisan Passport Photograph
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional, Dict

from fastapi import HTTPException, status
from app.db.firebase import db as default_db

logger = logging.getLogger(__name__)

WEAVERS_COLLECTION = "weavers"
DOCUMENTS_SUBCOLLECTION = "documents"

DEFAULT_DOCUMENT_CATALOG = {
    "pehchan_card": {"title": "Weaver Pehchan Card", "category": "IDENTITY"},
    "yarn_passbook": {"title": "NHDP Yarn Passbook", "category": "YARN_TELEMETRY"},
    "aadhaar_card": {"title": "Aadhaar Identity Card", "category": "IDENTITY"},
    "bank_passbook": {"title": "Bank Passbook / Cancelled Cheque", "category": "BANKING"},
    "loom_photo": {"title": "Active Loom Photograph", "category": "LOOM_ASSET"},
    "passport_photo": {"title": "Artisan Passport Photo", "category": "BIOMETRIC"},
}


def get_user_document_vault(weaver_id: str, db_client: Any = None) -> Dict[str, Any]:
    """
    Retrieves all stored, verified document records for a specific weaver from their personal vault.
    Path: `weavers/{weaver_id}/documents`
    """
    if db_client is None:
        db_client = default_db

    weaver_id_str = str(weaver_id)
    doc_vault: Dict[str, Any] = {}

    try:
        # 1. Fetch from subcollection weavers/{weaver_id}/documents
        docs_stream = db_client.collection(WEAVERS_COLLECTION).document(weaver_id_str).collection(DOCUMENTS_SUBCOLLECTION).stream()
        for d in docs_stream:
            data = d.to_dict() or {}
            doc_type = d.id or data.get("doc_type")
            if doc_type:
                doc_vault[doc_type] = data

        # 2. Check fallback fields on main weaver document for backward compatibility
        weaver_doc = db_client.collection(WEAVERS_COLLECTION).document(weaver_id_str).get()
        if weaver_doc.exists:
            w_data = weaver_doc.to_dict() or {}
            
            # Map legacy avatar or photo URLs if present
            if "avatar_url" in w_data and w_data["avatar_url"] and "passport_photo" not in doc_vault:
                doc_vault["passport_photo"] = {
                    "doc_type": "passport_photo",
                    "doc_name": "Artisan Passport Photo",
                    "doc_url": w_data["avatar_url"],
                    "is_verified": True,
                    "updated_at": w_data.get("updated_at"),
                }
            if "pehchan_id" in w_data and w_data["pehchan_id"] and "pehchan_card" not in doc_vault:
                doc_vault["pehchan_card"] = {
                    "doc_type": "pehchan_card",
                    "doc_name": "Weaver Pehchan Card",
                    "pehchan_id_number": w_data["pehchan_id"],
                    "doc_url": f"https://karghadhan.gov.in/vault/pehchan/{w_data['pehchan_id']}.pdf",
                    "is_verified": True,
                    "updated_at": w_data.get("updated_at"),
                }
            if "yarn_passbook_id" in w_data and w_data["yarn_passbook_id"] and "yarn_passbook" not in doc_vault:
                doc_vault["yarn_passbook"] = {
                    "doc_type": "yarn_passbook",
                    "doc_name": "NHDP Yarn Passbook",
                    "yarn_passbook_number": w_data["yarn_passbook_id"],
                    "doc_url": f"https://karghadhan.gov.in/vault/passbook/{w_data['yarn_passbook_id']}.pdf",
                    "is_verified": True,
                    "updated_at": w_data.get("updated_at"),
                }

    except Exception as exc:
        logger.warning("Error fetching user document vault for %s: %s", weaver_id_str, exc)

    return doc_vault


def save_user_document(
    weaver_id: str,
    doc_type: str,
    doc_url: str,
    doc_name: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    db_client: Any = None,
) -> Dict[str, Any]:
    """
    Saves a verified document into the weaver's personal document vault.
    Path: `weavers/{weaver_id}/documents/{doc_type}`
    """
    if db_client is None:
        db_client = default_db

    weaver_id_str = str(weaver_id)
    doc_type_clean = doc_type.lower().strip()
    now_iso = datetime.now(timezone.utc).isoformat()

    catalog_entry = DEFAULT_DOCUMENT_CATALOG.get(doc_type_clean, {"title": doc_type.replace("_", " ").title(), "category": "GENERAL"})

    doc_record = {
        "doc_id": str(uuid.uuid4()),
        "weaver_id": weaver_id_str,
        "doc_type": doc_type_clean,
        "doc_name": doc_name or catalog_entry["title"],
        "category": catalog_entry["category"],
        "doc_url": doc_url,
        "is_verified": True,
        "metadata": metadata or {},
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    try:
        # 1. Write to weavers/{weaver_id}/documents/{doc_type}
        db_client.collection(WEAVERS_COLLECTION).document(weaver_id_str).collection(DOCUMENTS_SUBCOLLECTION).document(doc_type_clean).set(doc_record, merge=True)
        
        # 2. Update main weaver profile document references
        weaver_ref = db_client.collection(WEAVERS_COLLECTION).document(weaver_id_str)
        update_fields: Dict[str, Any] = {"updated_at": now_iso}
        if doc_type_clean == "passport_photo":
            update_fields["avatar_url"] = doc_url
        weaver_ref.set(update_fields, merge=True)

        logger.info("Saved document '%s' to personal vault of weaver %s", doc_type_clean, weaver_id_str)
        return doc_record
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save document to user vault: {str(exc)}",
        ) from exc
