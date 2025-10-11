# backend/routers.py
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import DESCENDING

from db import get_db, as_object_id
from security import hash_password, verify_password, create_access_token, decode_token
from storage import save_upload, ensure_upload_dir
from ml_service import predict_image  # ✅ NEW — ML integration

from models import (
    RegisterIn, RegisterOut,
    LoginIn, LoginOut, LoginUser,
    ScanCreate, ScanListOut, ScanItem,
    RecommendationOut, DiseaseKey,
)

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


# =========================================================
#                    AUTH HELPERS
# =========================================================
def require_user(creds: Optional[HTTPAuthorizationCredentials]) -> dict:
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    try:
        payload = decode_token(creds.credentials)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return payload  # contains sub (user id), email, iat, exp


# =========================================================
#                         AUTH
# =========================================================
@router.post("/auth/register", response_model=RegisterOut, tags=["auth"])
def register(body: RegisterIn):
    db = get_db()
    if db.users.find_one({"email": body.email}):
        raise HTTPException(status_code=409, detail="Email already registered")

    doc = {
        "name": body.name,
        "email": body.email,
        "passwordHash": hash_password(body.password),
        "createdAt": datetime.now(timezone.utc),
    }
    res = db.users.insert_one(doc)
    return RegisterOut(id=str(res.inserted_id), name=body.name, email=body.email)


@router.post("/auth/login", response_model=LoginOut, tags=["auth"])
def login(body: LoginIn):
    db = get_db()
    user = db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token, _ = create_access_token(
        subject=str(user["_id"]),
        extra_claims={"email": user["email"], "name": user["name"]},
    )
    return LoginOut(
        accessToken=token,
        user=LoginUser(id=str(user["_id"]), name=user["name"], email=user["email"]),
    )


# =========================================================
#                         SCANS
# =========================================================
@router.post("/scans", response_model=ScanItem, tags=["scans"])
def create_scan(
    file: UploadFile = File(...),              # ✅ Now image required
    notes: Optional[str] = Form(None),
    modelVersion: str = Form("1.0"),
    creds: HTTPAuthorizationCredentials = Depends(bearer),
):
    """Upload a rice leaf image -> classify -> save scan in DB."""
    user_claims = require_user(creds)
    user_id = user_claims["sub"]

    db = get_db()
    ensure_upload_dir()

    # ✅ Save the uploaded image
    image_path = save_upload(file)  # e.g., uploads/2025/10/<uuid>.jpg

    # ✅ Run ML prediction
    try:
        label_str, confidence = predict_image(image_path)
        label = DiseaseKey(label_str)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference error: {e}")

    # ✅ Save record to MongoDB
    doc = {
        "userId": as_object_id(user_id),
        "label": label.value,
        "confidence": float(confidence),
        "modelVersion": modelVersion,
        "notes": notes,
        "imageUrl": image_path,
        "createdAt": datetime.now(timezone.utc),
    }
    res = db.scans.insert_one(doc)
    inserted = db.scans.find_one({"_id": res.inserted_id})
    inserted["label"] = DiseaseKey(inserted["label"])

    return ScanItem(**inserted)


@router.get("/scans", response_model=ScanListOut, tags=["scans"])
def list_scans(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
):
    user_claims = require_user(creds)
    user_id = user_claims["sub"]

    db = get_db()
    cursor = db.scans.find({"userId": as_object_id(user_id)}).sort("createdAt", DESCENDING)
    items = []
    for d in cursor:
        d["label"] = DiseaseKey(d["label"])
        items.append(ScanItem(**d))
    return ScanListOut(items=items)


# =========================================================
#                    RECOMMENDATIONS
# =========================================================
@router.get("/recommendations/{diseaseKey}", response_model=RecommendationOut, tags=["recommendations"])
def get_recommendation(diseaseKey: DiseaseKey):
    db = get_db()
    doc = db.recommendations.find_one({"diseaseKey": diseaseKey.value})
    if not doc:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    return RecommendationOut(
        diseaseKey=diseaseKey,
        title=doc["title"],
        steps=doc["steps"],
        version=doc["version"],
        updatedAt=doc["updatedAt"],
    )
# backend/models.py