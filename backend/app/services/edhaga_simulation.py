"""
app/services/edhaga_simulation.py
e-Dhaga Yarn Passbook & Pehchan Card Simulation Service.

Simulates the National Handloom Development Corporation (NHDC) e-Dhaga portal API.
Provides deterministic, person-specific yarn passbook ledgers, yarn allocations,
and transactional history for any given Yarn Passbook ID or Pehchan Card ID.
"""
from __future__ import annotations

import hashlib
import random
from datetime import datetime, timedelta, timezone
from typing import Optional
from pydantic import BaseModel, Field


class EDhagaTransaction(BaseModel):
    id: str
    transacted_at: str
    category: str = "YARN_PURCHASE"
    yarn_type: str
    quantity_kg: float
    unit_price_inr: float
    amount_inr: float
    supplier_name: str
    passbook_number: str
    status: str = "COMPLETED"
    description: str


class EDhagaPassbookData(BaseModel):
    pehchan_id: str
    yarn_passbook_id: str
    weaver_name: str
    cluster_office: str
    yarn_type: str
    total_allocated_quota_kg: float
    total_utilized_quota_kg: float
    quota_balance_kg: float
    quota_utilization_pct: float
    order_frequency_variance: float
    avg_ticket_size_inr: float
    past_due_instances: int
    transactions: list[EDhagaTransaction] = Field(default_factory=list)


# Standard Handloom Clusters for Simulation
_CLUSTERS = [
    "Varanasi Handloom Cluster, Uttar Pradesh",
    "Kanchipuram Silk Co-operative, Tamil Nadu",
    "Pochampally Ikat Handloom Society, Telangana",
    "Maheshwar Weaver Association, Madhya Pradesh",
    "Shantipur Cotton Weavers Society, West Bengal",
    "Bhagalpur Tussar Silk Cluster, Bihar",
    "Mangalagiri Cotton Handlooms, Andhra Pradesh",
    "Chanderi Handloom Development Society, Madhya Pradesh",
]

_YARN_TYPES = [
    "Mulberry Silk 20/22 Denier",
    "Combed Cotton Yarn 80s Ne",
    "Organic Carded Cotton 60s",
    "Pure Zari Silver-Coated Thread",
    "Tussar Raw Silk Yarn",
    "Pashmina Wool Blend 2/40s",
    "Mercerized Cotton Yarn 2/120s",
]

_SUPPLIERS = [
    "NHDC Regional Yarn Depot",
    "State Handloom Development Corporation",
    "Apex Weavers Co-operative Federation",
    "Primary Weavers Co-operative Society",
    "National Yarn Supply Depot",
]


def generate_edhaga_passbook(
    yarn_passbook_id: Optional[str] = None,
    pehchan_id: Optional[str] = None,
    weaver_name: Optional[str] = None,
) -> EDhagaPassbookData:
    """
    Generate or lookup deterministic e-Dhaga Yarn Passbook data for a weaver.

    The generated transaction ledger, quota allocation, ticket size, and payment
    compliance are deterministically derived from the ID seed so that each weaver
    has a consistent, person-specific history.
    """
    # Standardize input IDs
    passbook_id = (yarn_passbook_id or "").strip().upper()
    card_id = (pehchan_id or "").strip().upper()

    if not passbook_id and not card_id:
        passbook_id = "YP-2024-UP-04821"
        card_id = "IND-HL-9876543210"
    elif not passbook_id:
        passbook_id = f"YP-2024-HL-{hashlib.md5(card_id.encode()).hexdigest()[:5].upper()}"
    elif not card_id:
        card_id = f"IND-HL-{hashlib.md5(passbook_id.encode()).hexdigest()[:10].upper()}"

    # Use hash as random seed for deterministic generation
    seed_str = f"{passbook_id}:{card_id}"
    seed_int = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed_int)

    cluster = rng.choice(_CLUSTERS)
    primary_yarn = rng.choice(_YARN_TYPES)
    name = weaver_name or f"Weaver {card_id[-4:]}"

    # Quota allocation (e.g. 200 - 800 kg per annum)
    total_allocated = round(rng.uniform(250.0, 750.0), 1)
    # Utilization ratio (e.g. 45% - 95%)
    util_pct = rng.uniform(0.55, 0.95)
    total_utilized = round(total_allocated * util_pct, 1)
    quota_balance = round(total_allocated - total_utilized, 1)

    # Order variance (in days)
    order_var = round(rng.uniform(3.5, 22.0), 2)
    # Past due instances (0 to 3)
    past_dues = rng.choices([0, 1, 2, 3], weights=[0.60, 0.25, 0.10, 0.05])[0]

    # Generate 6 to 12 realistic yarn purchase transactions over the past year
    num_txs = rng.randint(6, 12)
    tx_list: list[EDhagaTransaction] = []
    total_tx_amount = 0.0

    now = datetime.now(timezone.utc)
    base_date = now - timedelta(days=365)

    for i in range(num_txs):
        # Spaced out dates with variance
        days_offset = int((365 / num_txs) * i + rng.uniform(-10, 10))
        days_offset = max(1, min(360, days_offset))
        tx_date = base_date + timedelta(days=days_offset)

        qty_kg = round(rng.uniform(15.0, 60.0), 1)
        rate_per_kg = round(rng.uniform(400.0, 1800.0), 2)
        amount = round(qty_kg * rate_per_kg, 2)
        total_tx_amount += amount

        supplier = rng.choice(_SUPPLIERS)
        tx_id = f"EDH-TX-{hashlib.md5(f'{passbook_id}-{i}'.encode()).hexdigest()[:8].upper()}"

        tx_list.append(
            EDhagaTransaction(
                id=tx_id,
                transacted_at=tx_date.isoformat(),
                category="YARN_PURCHASE",
                yarn_type=primary_yarn,
                quantity_kg=qty_kg,
                unit_price_inr=rate_per_kg,
                amount_inr=amount,
                supplier_name=supplier,
                passbook_number=passbook_id,
                status="COMPLETED",
                description=f"Yarn purchase under NHDC Hank Yarn Subsidy Scheme ({qty_kg} kg {primary_yarn})",
            )
        )

    # Sort transactions descending by date
    tx_list.sort(key=lambda x: x.transacted_at, reverse=True)
    avg_ticket = round(total_tx_amount / len(tx_list), 2) if tx_list else 15000.0

    return EDhagaPassbookData(
        pehchan_id=card_id,
        yarn_passbook_id=passbook_id,
        weaver_name=name,
        cluster_office=cluster,
        yarn_type=primary_yarn,
        total_allocated_quota_kg=total_allocated,
        total_utilized_quota_kg=total_utilized,
        quota_balance_kg=quota_balance,
        quota_utilization_pct=round(util_pct * 100.0, 1),
        order_frequency_variance=order_var,
        avg_ticket_size_inr=avg_ticket,
        past_due_instances=past_dues,
        transactions=tx_list,
    )
