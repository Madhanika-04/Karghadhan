-- =============================================================================
-- Karghadhan — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Database: Supabase (PostgreSQL 15+)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ---------------------------------------------------------------------------
-- 1. WEAVER PROFILES
--    One row per registered handloom weaver (linked to Supabase auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weaver_profiles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name           TEXT NOT NULL,
    phone_number        TEXT NOT NULL UNIQUE,
    cluster_location    TEXT NOT NULL,          -- village / district / state
    primary_language    TEXT NOT NULL DEFAULT 'hi',
    experience_years    SMALLINT NOT NULL CHECK (experience_years >= 0),
    upi_id              TEXT,                   -- e.g. weaver@upi
    avatar_url          TEXT,
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT weaver_profiles_user_id_unique UNIQUE (user_id)
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_weaver_profiles_cluster
    ON public.weaver_profiles (cluster_location);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_weaver_profiles_updated_at
    BEFORE UPDATE ON public.weaver_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. LOOM ASSETS
--    Equipment owned / operated by the weaver
-- ---------------------------------------------------------------------------
CREATE TYPE public.loom_type_enum AS ENUM (
    'HANDLOOM', 'POWER_LOOM', 'JACQUARD', 'DOBBY', 'FLY_SHUTTLE', 'OTHER'
);

CREATE TABLE IF NOT EXISTS public.loom_assets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weaver_id       UUID NOT NULL REFERENCES public.weaver_profiles(id) ON DELETE CASCADE,
    loom_type       public.loom_type_enum NOT NULL DEFAULT 'HANDLOOM',
    capacity        NUMERIC(10, 2) NOT NULL CHECK (capacity > 0),  -- metres/day
    active_orders   INTEGER NOT NULL DEFAULT 0 CHECK (active_orders >= 0),
    photo_url       TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loom_assets_weaver
    ON public.loom_assets (weaver_id);

-- ---------------------------------------------------------------------------
-- 3. TRANSACTION LEDGER
--    All income/expense records (alternative credit data source)
-- ---------------------------------------------------------------------------
CREATE TYPE public.transaction_type_enum AS ENUM ('CREDIT', 'DEBIT');

CREATE TABLE IF NOT EXISTS public.transaction_ledger (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weaver_id            UUID NOT NULL REFERENCES public.weaver_profiles(id) ON DELETE CASCADE,
    amount               NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    transaction_type     public.transaction_type_enum NOT NULL,
    category             TEXT NOT NULL,            -- e.g. 'YARN_PURCHASE', 'SAREE_SALE'
    proof_document_url   TEXT,                     -- receipt / photo upload
    description          TEXT,
    transacted_at        DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_ledger_weaver
    ON public.transaction_ledger (weaver_id, transacted_at DESC);

-- ---------------------------------------------------------------------------
-- 4. CREDIT ASSESSMENTS
--    Output of the AI credit-evaluation agent
-- ---------------------------------------------------------------------------
CREATE TYPE public.risk_category_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE IF NOT EXISTS public.credit_assessments (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weaver_id                UUID NOT NULL REFERENCES public.weaver_profiles(id) ON DELETE CASCADE,
    alternative_credit_score SMALLINT NOT NULL
                                CHECK (alternative_credit_score BETWEEN 300 AND 900),
    risk_category            public.risk_category_enum NOT NULL,
    max_eligible_loan        NUMERIC(14, 2) NOT NULL CHECK (max_eligible_loan >= 0),
    score_breakdown          JSONB NOT NULL DEFAULT '{}'::JSONB,
    agent_reasoning          TEXT,
    model_version            TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    assessed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Keep a history; latest row = most recent assessment
    CONSTRAINT credit_score_range CHECK (alternative_credit_score BETWEEN 300 AND 900)
);

-- Vector column for semantic search on agent reasoning (optional RAG)
ALTER TABLE public.credit_assessments
    ADD COLUMN IF NOT EXISTS reasoning_embedding vector(768);

CREATE INDEX IF NOT EXISTS idx_credit_assessments_weaver
    ON public.credit_assessments (weaver_id, assessed_at DESC);

-- ---------------------------------------------------------------------------
-- 5. LOAN APPLICATIONS
-- ---------------------------------------------------------------------------
CREATE TYPE public.loan_status_enum AS ENUM (
    'PENDING', 'UNDER_REVIEW', 'APPROVED', 'DISBURSED', 'REJECTED', 'CLOSED'
);

CREATE TABLE IF NOT EXISTS public.loan_applications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weaver_id           UUID NOT NULL REFERENCES public.weaver_profiles(id) ON DELETE CASCADE,
    assessment_id       UUID REFERENCES public.credit_assessments(id),
    requested_amount    NUMERIC(14, 2) NOT NULL CHECK (requested_amount > 0),
    purpose             TEXT NOT NULL,
    tenure_months       SMALLINT NOT NULL CHECK (tenure_months BETWEEN 1 AND 60),
    status              public.loan_status_enum NOT NULL DEFAULT 'PENDING',
    approved_amount     NUMERIC(14, 2) CHECK (approved_amount >= 0),
    interest_rate       NUMERIC(5, 2),             -- annual %
    rejection_reason    TEXT,
    applied_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_loan_applications_updated_at
    BEFORE UPDATE ON public.loan_applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_loan_applications_weaver
    ON public.loan_applications (weaver_id, applied_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.weaver_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loom_assets         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_ledger  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_assessments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications   ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- weaver_profiles policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Weavers can view own profile"
    ON public.weaver_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Weavers can update own profile"
    ON public.weaver_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Weavers can insert own profile"
    ON public.weaver_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service role (backend) bypasses RLS automatically (uses service_role key)

-- ---------------------------------------------------------------------------
-- loom_assets policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Weavers can manage own loom assets"
    ON public.loom_assets FOR ALL
    USING (
        weaver_id IN (
            SELECT id FROM public.weaver_profiles WHERE user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- transaction_ledger policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Weavers can manage own transactions"
    ON public.transaction_ledger FOR ALL
    USING (
        weaver_id IN (
            SELECT id FROM public.weaver_profiles WHERE user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- credit_assessments policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Weavers can view own assessments"
    ON public.credit_assessments FOR SELECT
    USING (
        weaver_id IN (
            SELECT id FROM public.weaver_profiles WHERE user_id = auth.uid()
        )
    );

-- Only service role (backend AI agent) can INSERT/UPDATE assessments

-- ---------------------------------------------------------------------------
-- loan_applications policies
-- ---------------------------------------------------------------------------
CREATE POLICY "Weavers can view own loan applications"
    ON public.loan_applications FOR SELECT
    USING (
        weaver_id IN (
            SELECT id FROM public.weaver_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Weavers can insert own loan applications"
    ON public.loan_applications FOR INSERT
    WITH CHECK (
        weaver_id IN (
            SELECT id FROM public.weaver_profiles WHERE user_id = auth.uid()
        )
    );

-- =============================================================================
-- SEED: Reference data (optional — comment out if not needed)
-- =============================================================================
-- INSERT INTO public.weaver_profiles (user_id, full_name, phone_number, cluster_location, experience_years)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test Weaver', '9999999999', 'Varanasi, UP', 10);
