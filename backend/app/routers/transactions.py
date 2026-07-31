"""
app/routers/transactions.py
CRUD endpoints for the Transaction Ledger using Firebase Firestore.
Collection: `transaction_ledger`
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.db.firebase import db
from app.schemas.transaction import TransactionCreate, TransactionRead

router = APIRouter(prefix="/transactions", tags=["Transaction Ledger"])

TRANSACTIONS_COLLECTION = "transaction_ledger"


@router.post("/weaver/{weaver_id}", response_model=TransactionRead, status_code=status.HTTP_201_CREATED,
             summary="Add a new transaction to the weaver's ledger")
async def add_transaction(weaver_id: UUID, body: TransactionCreate):
    """Log a new transaction (income/expense) for a weaver in Firestore."""
    transaction_id_str = str(uuid.uuid4())
    transaction_data = body.model_dump(mode="json")
    transaction_data["id"] = transaction_id_str
    transaction_data["weaver_id"] = str(weaver_id)
    if not transaction_data.get("transacted_at"):
        transaction_data["transacted_at"] = datetime.now(timezone.utc).isoformat()

    try:
        db.collection(TRANSACTIONS_COLLECTION).document(transaction_id_str).set(transaction_data)
        return transaction_data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/weaver/{weaver_id}", response_model=list[TransactionRead],
             summary="Get all ledger transactions for a weaver")
async def get_transactions(weaver_id: UUID):
    """Retrieve the full transaction ledger for the given weaver from Firestore."""
    try:
        query = db.collection(TRANSACTIONS_COLLECTION).where("weaver_id", "==", str(weaver_id)).stream()
        results = []
        for doc in query:
            data = doc.to_dict()
            data["id"] = data.get("id", doc.id)
            results.append(data)

        # Sort by transacted_at descending
        results.sort(key=lambda x: x.get("transacted_at", ""), reverse=True)
        return results
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT,
                summary="Delete a transaction from the ledger")
async def delete_transaction(transaction_id: UUID):
    """Delete a ledger transaction by its ID from Firestore."""
    doc_id = str(transaction_id)
    doc_ref = db.collection(TRANSACTIONS_COLLECTION).document(doc_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction {transaction_id} not found."
        )

    try:
        doc_ref.delete()
        return
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
