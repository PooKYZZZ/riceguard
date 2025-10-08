from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from bson import ObjectId


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