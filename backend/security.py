"""
Handles all security utilities:
- Password hashing (bcrypt)
- JWT creation / verification
- FastAPI dependency for authentication
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from settings import JWT_SECRET, JWT_ALGORITHM, TOKEN_EXPIRE_HOURS

# ---------------- Password Hashing ----------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Create a secure bcrypt hash for a password."""
    if len(password) < 6:
        raise HTTPException(status_code=422, detail="Password too short (min 6 chars)")
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its stored bcrypt hash."""
    try:
        return pwd_context.verify(password, password_hash)
    except Exception:
        return False

# ---------------- JWT Helpers ----------------
http_bearer = HTTPBearer(auto_error=False)

def create_access_token(sub: str) -> str:
    """Create a signed JWT token for a given user id."""
    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": sub, "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    """Decode and verify JWT; raise 401 on failure."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer)) -> str:
    """FastAPI dependency: require a Bearer token, return user id (sub)."""
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    payload = decode_access_token(creds.credentials)
    return payload.get("sub")
