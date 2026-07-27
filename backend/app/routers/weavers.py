"""
app/routers/weavers.py
CRUD endpoints for Weaver profiles and Loom Assets using Firebase Firestore.
"""
from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.db.firebase import db
from app.schemas.weaver import WeaverCreate, WeaverRead, WeaverUpdate, LoomAssetCreate, LoomAssetRead

router = APIRouter(prefix="/weavers", tags=["Weavers"])

WEAVERS_COLLECTION = "weavers"


@router.get("/{weaver_id}", response_model=WeaverRead, summary="Get weaver profile by ID")
async def get_weaver(weaver_id: UUID):
    """Fetch a single weaver profile including loom asset metadata from Firestore."""
    doc_ref = db.collection(WEAVERS_COLLECTION).document(str(weaver_id))
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weaver {weaver_id} not found.",
        )
    
    data = doc.to_dict()
    data["id"] = data.get("id", str(weaver_id))
    return data


@router.post("/", response_model=WeaverRead, status_code=status.HTTP_201_CREATED,
             summary="Create a new weaver profile")
async def create_weaver(body: WeaverCreate):
    """
    Create a new weaver profile document in Firestore collection 'weavers'.
    """
    profile_data = body.model_dump(mode="json", exclude={"loom_assets"})
    weaver_id_str = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Generate default Pehchan ID and Yarn Passbook ID if not provided
    if not profile_data.get("pehchan_id"):
        profile_data["pehchan_id"] = f"IND-HL-{hashlib.md5(weaver_id_str.encode()).hexdigest()[:10].upper()}"
    if not profile_data.get("yarn_passbook_id"):
        profile_data["yarn_passbook_id"] = f"YP-2024-UP-{hashlib.md5(weaver_id_str.encode()).hexdigest()[:5].upper()}"

    profile_data["id"] = weaver_id_str
    profile_data["user_id"] = str(profile_data["user_id"])
    profile_data["is_verified"] = False
    profile_data["created_at"] = now
    profile_data["updated_at"] = now

    # Convert loom assets if provided
    assets_list = []
    if body.loom_assets:
        for asset in body.loom_assets:
            asset_dict = asset.model_dump(mode="json")
            asset_dict["id"] = str(uuid.uuid4())
            asset_dict["weaver_id"] = weaver_id_str
            asset_dict["created_at"] = now
            assets_list.append(asset_dict)

    profile_data["loom_assets"] = assets_list

    try:
        db.collection(WEAVERS_COLLECTION).document(weaver_id_str).set(profile_data)
        return profile_data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.put("/{weaver_id}", response_model=WeaverRead, summary="Update weaver profile")
async def update_weaver(weaver_id: UUID, body: WeaverUpdate):
    """Partial update of a weaver profile in Firestore."""
    update_data = body.model_dump(mode="json", exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )
    
    doc_ref = db.collection(WEAVERS_COLLECTION).document(str(weaver_id))
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weaver not found.")

    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        doc_ref.update(update_data)
        updated_doc = doc_ref.get().to_dict()
        updated_doc["id"] = updated_doc.get("id", str(weaver_id))
        return updated_doc
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.post("/{weaver_id}/looms", response_model=LoomAssetRead, status_code=status.HTTP_201_CREATED,
             summary="Add a new loom asset for a weaver")
async def add_loom(weaver_id: UUID, body: LoomAssetCreate):
    """Add a new loom asset record to the weaver's document in Firestore."""
    doc_ref = db.collection(WEAVERS_COLLECTION).document(str(weaver_id))
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weaver not found.")

    weaver_data = doc.to_dict()
    now = datetime.now(timezone.utc).isoformat()
    
    asset_data = body.model_dump(mode="json")
    asset_data["id"] = str(uuid.uuid4())
    asset_data["weaver_id"] = str(weaver_id)
    asset_data["created_at"] = now

    existing_looms = weaver_data.get("loom_assets", [])
    existing_looms.append(asset_data)

    try:
        doc_ref.update({"loom_assets": existing_looms, "updated_at": now})
        return asset_data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/{weaver_id}/looms", response_model=list[LoomAssetRead],
             summary="Get all loom assets for a weaver")
async def get_looms(weaver_id: UUID):
    """List all loom assets owned by the given weaver."""
    doc_ref = db.collection(WEAVERS_COLLECTION).document(str(weaver_id))
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weaver not found.")

    return doc.to_dict().get("loom_assets", [])


@router.delete("/looms/{loom_id}", status_code=status.HTTP_204_NO_CONTENT,
                summary="Delete a loom asset")
async def delete_loom(loom_id: UUID):
    """Remove a loom asset by its ID across weavers."""
    loom_id_str = str(loom_id)
    try:
        docs = db.collection(WEAVERS_COLLECTION).stream()
        found = False

        for doc in docs:
            weaver_data = doc.to_dict()
            loom_assets = weaver_data.get("loom_assets", [])
            updated_looms = [l for l in loom_assets if l.get("id") != loom_id_str]

            if len(updated_looms) != len(loom_assets):
                doc.reference.update({
                    "loom_assets": updated_looms,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                })
                found = True
                break

        if not found:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Loom asset {loom_id} not found."
            )
        return
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
