"""
app/db/supabase.py
Initialises two Supabase client instances:
  - `supabase_client`  — uses the anon key  (respects RLS, for user-scoped ops)
  - `supabase_admin`   — uses the service-role key (bypasses RLS, for AI agents)

Clients are module-level singletons; import them wherever needed.
"""
from supabase import create_client, Client
from app.config import get_settings

_settings = get_settings()

# Anon client — use for user-authenticated requests
supabase_client: Client = create_client(
    supabase_url=_settings.SUPABASE_URL,
    supabase_key=_settings.SUPABASE_KEY,
)

# Admin / service-role client — use in AI agents and server-side mutations
supabase_admin: Client = create_client(
    supabase_url=_settings.SUPABASE_URL,
    supabase_key=_settings.SUPABASE_SERVICE_ROLE_KEY,
)


def get_supabase() -> Client:
    """FastAPI dependency that returns the anon Supabase client."""
    return supabase_client


def get_supabase_admin() -> Client:
    """FastAPI dependency that returns the admin Supabase client."""
    return supabase_admin
