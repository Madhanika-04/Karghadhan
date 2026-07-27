"""
app/routers/transactions.py
CRUD endpoints for the Transaction Ledger.
"""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.db.supabase import supabase_admin
from app.schemas.transaction import TransactionCreate, TransactionRead

# We use the prefix "/transactions" or we can attach to the weavers prefix.
# To keep routes clean, we will mount at "/transactions".
router = APIRouter(prefix="/transactions", tags=["Transaction Ledger"])


@router.post("/weaver/{weaver_id}", response_model=TransactionRead, status_code=status.HTTP_201_CREATED,
             summary="Add a new transaction to the weaver's ledger")
async def add_transaction(weaver_id: UUID, body: TransactionCreate):
    """Log a new transaction (income/expense) for a weaver."""
    transaction_data = body.model_dump(mode="json")
    transaction_data["weaver_id"] = str(weaver_id)

    try:
        response = supabase_admin.table("transaction_ledger").insert(transaction_data).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to record transaction."
            )
        return response.data[0]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/weaver/{weaver_id}", response_model=list[TransactionRead],
             summary="Get all ledger transactions for a weaver")
async def get_transactions(weaver_id: UUID):
    """Retrieve the full transaction ledger for the given weaver, ordered by transaction date descending."""
    try:
        response = (
            supabase_admin
            .table("transaction_ledger")
            .select("*")
            .eq("weaver_id", str(weaver_id))
            .order("transacted_at", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT,
                summary="Delete a transaction from the ledger")
async def delete_transaction(transaction_id: UUID):
    """Delete a ledger transaction by its ID."""
    try:
        response = supabase_admin.table("transaction_ledger").delete().eq("id", str(transaction_id)).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction {transaction_id} not found."
            )
        return
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
