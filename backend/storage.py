# storage.py
import os
import uuid
from datetime import datetime
from fastapi import UploadFile
from settings import UPLOAD_DIR

def ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload(file: UploadFile) -> str:
    ensure_upload_dir()
    # Put uploads under /uploads/YYYY/MM/<uuid>.<ext>
    now = datetime.now()
    subdir = os.path.join(UPLOAD_DIR, f"{now.year}", f"{now.month:02d}")
    os.makedirs(subdir, exist_ok=True)
    ext = (file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin")
    fname = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(subdir, fname)

    with open(path, "wb") as f:
        f.write(file.file.read())

    # Return web path (mounted under /uploads)
    web_path = path.replace("\\", "/")
    return web_path
