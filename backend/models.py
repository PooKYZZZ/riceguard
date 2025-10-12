from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


DISEASE_KEY_ALIASES: Dict[str, str] = {
    "blast": "leaf_blast",
    "blight": "bacterial_leaf_blight",
}


class DiseaseKey(str, Enum):
    """Canonical disease keys shared between API, seed data, and ML output."""

    BACTERIAL_LEAF_BLIGHT = "bacterial_leaf_blight"
    BROWN_SPOT = "brown_spot"
    HEALTHY = "healthy"
    LEAF_BLAST = "leaf_blast"
    LEAF_SCALD = "leaf_scald"
    NARROW_BROWN_SPOT = "narrow_brown_spot"
    UNCERTAIN = "uncertain"

    @classmethod
    def parse(cls, value: str) -> "DiseaseKey":
        """
        Convert raw model output to a canonical disease key.
        Accepts legacy aliases to stay compatible with older models.
        """
        normalized = str(value).strip()
        try:
            return cls(normalized)
        except ValueError:
            alias = DISEASE_KEY_ALIASES.get(normalized)
            if alias:
                return cls(alias)
            raise


class RegisterIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class RegisterOut(BaseModel):
    id: str
    name: str
    email: EmailStr


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class LoginUser(BaseModel):
    id: str
    name: str
    email: EmailStr


class LoginOut(BaseModel):
    accessToken: str
    expiresAt: datetime
    user: LoginUser


class ScanItem(BaseModel):
    id: str
    label: DiseaseKey
    confidence: Optional[float] = None
    modelVersion: str
    notes: Optional[str] = None
    imageUrl: str
    createdAt: datetime

    @classmethod
    def from_dict(cls, data: Dict[str, object]) -> "ScanItem":
        """Convenience helper for constructing from MongoDB documents."""
        return cls(
            id=str(data["_id"]),
            label=DiseaseKey.parse(str(data["label"])),
            confidence=data.get("confidence"),
            modelVersion=str(data["modelVersion"]),
            notes=data.get("notes"),
            imageUrl=str(data["imageUrl"]),
            createdAt=data["createdAt"],
        )


class ScanListOut(BaseModel):
    items: List[ScanItem] = Field(default_factory=list)


class RecommendationOut(BaseModel):
    diseaseKey: DiseaseKey
    title: str
    steps: List[str]
    version: str
    updatedAt: datetime
