-- =============================================================================
-- Karghadhan — Weaver Credit Scoring Profiles
-- Migration: 002_weaver_scoring_profiles.sql
-- Database: Supabase (PostgreSQL 15+)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.weaver_scoring_profiles (
    weaver_id                 UUID PRIMARY KEY REFERENCES public.weaver_profiles(id) ON DELETE CASCADE,
    cibil_score               INTEGER CHECK (cibil_score BETWEEN 300 AND 900),
    total_allocated_quota     NUMERIC(12, 2) NOT NULL DEFAULT 0.0 CHECK (total_allocated_quota >= 0),
    total_utilized_quota      NUMERIC(12, 2) NOT NULL DEFAULT 0.0 CHECK (total_utilized_quota >= 0),
    order_frequency_variance  NUMERIC(12, 4) NOT NULL DEFAULT 0.0 CHECK (order_frequency_variance >= 0),
    avg_ticket_size_inr       NUMERIC(14, 2) NOT NULL DEFAULT 0.0 CHECK (avg_ticket_size_inr >= 0),
    past_due_instances        INTEGER NOT NULL DEFAULT 0 CHECK (past_due_instances >= 0),
    score                     INTEGER CHECK (score BETWEEN 300 AND 900),
    risk_tier                 TEXT CHECK (risk_tier IN ('Excellent', 'Good', 'Average', 'Risky')),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT quota_utilization_check CHECK (total_utilized_quota <= total_allocated_quota)
);

-- Trigger for auto-update updated_at
CREATE TRIGGER trg_weaver_scoring_profiles_updated_at
    BEFORE UPDATE ON public.weaver_scoring_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.weaver_scoring_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Weavers can view own scoring profile"
    ON public.weaver_scoring_profiles FOR SELECT
    USING (
        weaver_id IN (
            SELECT id FROM public.weaver_profiles WHERE user_id = auth.uid()
        )
    );
