# backend/models.py
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId


# ---- Mongo ObjectId support ----
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


# ---- Enums ----
class DiseaseKey(str, Enum):
    brown_spot = "brown_spot"
    blast = "blast"
    blight = "blight"
    healthy = "healthy"


# ---- Auth ----
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
    user: LoginUser


# ---- Scans ----
class ScanCreate(BaseModel):
    label: DiseaseKey
    confidence: Optional[float] = None
    modelVersion: str
    notes: Optional[str] = None

class ScanItem(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: PyObjectId
    label: DiseaseKey
    confidence: Optional[float] = None
    modelVersion: str
    notes: Optional[str] = None
    imageUrl: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

class ScanListOut(BaseModel):
    items: List[ScanItem]


# ---- Recommendation ----
class RecommendationOut(BaseModel):
    diseaseKey: DiseaseKey
    title: str
    steps: List[str]
    version: str
    updatedAt: datetime
