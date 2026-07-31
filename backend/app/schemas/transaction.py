from __future__ import annotations

from typing import Optional
from uuid import UUID
from datetime import date, datetime

from pydantic import BaseModel, Field, ConfigDict
from app.schemas.credit import TransactionType

class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    transaction_type: TransactionType
    category: str = Field(..., examples=["YARN_PURCHASE", "SAREE_SALE"])
    transacted_at: date
    description: Optional[str] = None
    proof_document_url: Optional[str] = None

class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    weaver_id: UUID
    amount: float
    transaction_type: TransactionType
    category: str
    transacted_at: date
    description: Optional[str]
    proof_document_url: Optional[str]
    created_at: datetime
