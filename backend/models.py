# backend/models.py
from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, EmailStr

# -------------------------- Enums -------------------------- #
class DiseaseKey(str, Enum):
    brown_spot = "brown_spot"
    blast = "blast"
    blight = "blight"
    healthy = "healthy"

# --------------------------- Auth -------------------------- #
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str

class RegisterOut(BaseModel):
    id: str
    name: str
    email: EmailStr

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class LoginUser(BaseModel):
    id: str
    name: str
    email: EmailStr

class LoginOut(BaseModel):
    accessToken: str
    expiresAt: datetime
    user: LoginUser

# --------------------------- Scans ------------------------- #
class ScanItem(BaseModel):
    id: str
    label: DiseaseKey
    confidence: Optional[float] = None
    modelVersion: str
    notes: Optional[str] = None
    imageUrl: Optional[str] = None
    createdAt: datetime

class ScanListOut(BaseModel):
    items: List[ScanItem]

# ---------------------- Recommendation --------------------- #
class RecommendationOut(BaseModel):
    diseaseKey: DiseaseKey
    title: str
    steps: List[str]
    version: str
    updatedAt: datetime
