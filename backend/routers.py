from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from pymongo import DESCENDING

from db import get_db, as_object_id
from models import (
    RegisterIn,
    RegisterOut,
    LoginIn,
    LoginOut,
    ScanCreate,
    ScanListOut,
    ScanItem,
    RecommendationOut,
    DiseaseKey,
)
from security import hash_password, verify_password, create_access_token, require_user
from storage import save_upload

router = APIRouter()

# =========================================================
#                         AUTH
# =========================================================

@router.post("/auth/register", response_model=RegisterOut, tags=["auth"])
def register_user(data: RegisterIn) -> RegisterOut:
    db = get_db()
    existing = db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed = hash_password(data.password)
    res = db.users.insert_one({
        "name": data.name,
        "email": data.email,
        "password": hashed,
        "createdAt": datetime.now(timezone.utc)
    })
    return RegisterOut(id=str(res.inserted_id), email=data.email)


@router.post("/auth/login", response_model=LoginOut, tags=["auth"])
def login_user(data: LoginIn) -> LoginOut:
    db = get_db()
    user = db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(user["_id"]))
    return LoginOut(
        accessToken=token,
        user={"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
    )


# =========================================================
#                         SCANS
# =========================================================

@router.post("/scans", response_model=ScanItem, tags=["scans"])
def create_scan(
    label: DiseaseKey = Form(...),
    confidence: float = Form(...),
    modelVersion: str = Form(...),
    notes: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    user_id: str = Depends(require_user),
):
    db = get_db()
    path = save_upload(file) if file else None
    scan_doc = {
        "userId": as_object_id(user_id),
        "label": label.value,
        "confidence": confidence,
        "modelVersion": modelVersion,
        "notes": notes,
        "imageUrl": path,
        "createdAt": datetime.now(timezone.utc),
    }
    res = db.scans.insert_one(scan_doc)
    return ScanItem(
        id=str(res.inserted_id),
        label=label,
        confidence=confidence,
        modelVersion=modelVersion,
        createdAt=scan_doc["createdAt"],
        imageUrl=path,
    )


@router.get("/scans", response_model=ScanListOut, tags=["scans"])
def list_scans(user_id: str = Depends(require_user)):
    db = get_db()
    cursor = db.scans.find({"userId": as_object_id(user_id)}).sort("createdAt", DESCENDING)
    items = []
    for doc in cursor:
        items.append(
            ScanItem(
                id=str(doc["_id"]),
                label=doc["label"],
                confidence=doc["confidence"],
                modelVersion=doc["modelVersion"],
                createdAt=doc["createdAt"],
                imageUrl=doc.get("imageUrl"),
            )
        )
    return ScanListOut(items=items, nextCursor=None)


# =========================================================
#                  RECOMMENDATIONS
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
