"""
app/schemas/weaver.py
Pydantic v2 models for Weaver profile and Loom Asset CRUD operations.
"""
from __future__ import annotations

import re
from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field, field_validator, ConfigDict


# ---------------------------------------------------------------------------
# Loom Asset
# ---------------------------------------------------------------------------

class LoomAssetCreate(BaseModel):
    loom_type: str = Field(
        default="HANDLOOM",
        pattern=r"^(HANDLOOM|POWER_LOOM|JACQUARD|DOBBY|FLY_SHUTTLE|OTHER)$",
        examples=["HANDLOOM"],
    )
    capacity: float = Field(..., gt=0, description="Daily production capacity in metres")
    active_orders: int = Field(default=0, ge=0)
    photo_url: Optional[str] = None
    notes: Optional[str] = None


class LoomAssetRead(LoomAssetCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    weaver_id: UUID
    created_at: datetime


# ---------------------------------------------------------------------------
# Weaver Profile
# ---------------------------------------------------------------------------

_PHONE_RE = re.compile(r"^\+?[1-9]\d{9,14}$")


class WeaverCreate(BaseModel):
    user_id: UUID
    full_name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., description="E.164 or 10-digit mobile number")
    cluster_location: str = Field(..., min_length=2, max_length=200)
    primary_language: str = Field(default="hi", min_length=2, max_length=10)
    experience_years: int = Field(..., ge=0, le=80)
    upi_id: Optional[str] = Field(default=None, max_length=50)
    avatar_url: Optional[str] = None
    loom_assets: list[LoomAssetCreate] = Field(default_factory=list)


    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip().replace(" ", "").replace("-", "")
        if not _PHONE_RE.match(cleaned):
            raise ValueError("Invalid phone number format")
        return cleaned


class WeaverUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    cluster_location: Optional[str] = None
    primary_language: Optional[str] = None
    experience_years: Optional[int] = Field(default=None, ge=0, le=80)
    upi_id: Optional[str] = None
    avatar_url: Optional[str] = None


class WeaverRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    full_name: str
    phone_number: str
    cluster_location: str
    primary_language: str
    experience_years: int
    upi_id: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool
    loom_assets: list[LoomAssetRead] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

