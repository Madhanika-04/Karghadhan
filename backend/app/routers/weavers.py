"""
app/routers/weavers.py
CRUD endpoints for Weaver profiles and Loom Assets.
"""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.db.supabase import supabase_admin
from app.schemas.weaver import WeaverCreate, WeaverRead, WeaverUpdate, LoomAssetCreate, LoomAssetRead

router = APIRouter(prefix="/weavers", tags=["Weavers"])


@router.get("/{weaver_id}", response_model=WeaverRead, summary="Get weaver profile by ID")
async def get_weaver(weaver_id: UUID):
    """Fetch a single weaver profile including loom asset metadata."""
    response = (
        supabase_admin
        .table("weaver_profiles")
        .select("*, loom_assets(*)")
        .eq("id", str(weaver_id))
        .maybe_single()
        .execute()
    )
    if response.data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weaver {weaver_id} not found.",
        )
    return response.data


@router.post("/", response_model=WeaverRead, status_code=status.HTTP_201_CREATED,
             summary="Create a new weaver profile")
async def create_weaver(body: WeaverCreate):
    """
    Insert a new weaver profile row.
    Note: user_id must come from the authenticated JWT in production;
    here it is supplied in the request body.
    """
    profile_data = body.model_dump(exclude={"loom_assets"})
    profile_data["user_id"] = str(profile_data["user_id"])

    try:
        response = supabase_admin.table("weaver_profiles").insert(profile_data).execute()
        weaver = response.data[0]

        # Insert loom assets if provided
        assets_inserted = []
        if body.loom_assets:
            assets = [
                {**asset.model_dump(), "weaver_id": weaver["id"]}
                for asset in body.loom_assets
            ]
            asset_response = supabase_admin.table("loom_assets").insert(assets).execute()
            assets_inserted = asset_response.data

        weaver["loom_assets"] = assets_inserted
        return weaver
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.put("/{weaver_id}", response_model=WeaverRead, summary="Update weaver profile")
async def update_weaver(weaver_id: UUID, body: WeaverUpdate):
    """Partial update a weaver profile."""
    update_data = body.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )
    try:
        response = (
            supabase_admin
            .table("weaver_profiles")
            .update(update_data)
            .eq("id", str(weaver_id))
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Weaver not found.")
        
        # Fetch fully updated record with loom assets
        updated_resp = (
            supabase_admin
            .table("weaver_profiles")
            .select("*, loom_assets(*)")
            .eq("id", str(weaver_id))
            .maybe_single()
            .execute()
        )
        return updated_resp.data
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
    """Add a new loom asset record linked to the given weaver."""
    asset_data = {**body.model_dump(), "weaver_id": str(weaver_id)}
    try:
        response = supabase_admin.table("loom_assets").insert(asset_data).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to add loom asset."
            )
        return response.data[0]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/{weaver_id}/looms", response_model=list[LoomAssetRead],
             summary="Get all loom assets for a weaver")
async def get_looms(weaver_id: UUID):
    """List all loom assets owned by the given weaver."""
    try:
        response = supabase_admin.table("loom_assets").select("*").eq("weaver_id", str(weaver_id)).execute()
        return response.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.delete("/looms/{loom_id}", status_code=status.HTTP_204_NO_CONTENT,
                summary="Delete a loom asset")
async def delete_loom(loom_id: UUID):
    """Remove a loom asset by its ID."""
    try:
        response = supabase_admin.table("loom_assets").delete().eq("id", str(loom_id)).execute()
        if not response.data:
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
