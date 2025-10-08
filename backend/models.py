from typing import Optional, List, Dict
from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class DiseaseKey(str, Enum):
    brown_spot = "brown_spot"
    blast = "blast"
    blight = "blight"
    healthy = "healthy"


# ---------- Auth DTOs ----------
class RegisterIn(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)


class RegisterOut(BaseModel):
    id: str
    email: EmailStr


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginOut(BaseModel):
    accessToken: str
    user: Dict[str, str]


# ---------- Scan DTOs ----------
class ScanCreate(BaseModel):
    label: DiseaseKey
    confidence: float = Field(..., ge=0, le=1)
    modelVersion: str = Field(..., min_length=1)
    notes: Optional[str] = Field(default=None, max_length=500)


class ScanItem(BaseModel):
    id: str
    label: DiseaseKey
    confidence: float
    modelVersion: str
    createdAt: datetime
    imageUrl: Optional[str] = None


class ScanListOut(BaseModel):
    items: List[ScanItem]
    nextCursor: Optional[str] = None


# ---------- Recommendation DTO ----------
class RecommendationOut(BaseModel):
    diseaseKey: DiseaseKey
    title: str
    steps: List[str]
    version: str
    updatedAt: datetime
