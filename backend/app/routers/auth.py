"""
app/routers/auth.py
Authentication endpoints — thin wrapper around Supabase Auth.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.db.supabase import supabase_client

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Register a new weaver account")
async def register(body: RegisterRequest):
    """
    Create a new Supabase Auth user.
    Returns the user object and session tokens.
    """
    try:
        response = supabase_client.auth.sign_up(
            {"email": body.email, "password": body.password}
        )
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed — user already exists or invalid email.",
            )
        return {
            "user_id": str(response.user.id),
            "email": response.user.email,
            "message": "Registration successful. Please verify your email.",
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc


@router.post("/login", summary="Log in and obtain JWT tokens")
async def login(body: LoginRequest):
    """Authenticate with email/password and return Supabase session tokens."""
    try:
        response = supabase_client.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
        if response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials.",
            )
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user_id": str(response.user.id),
        }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc
