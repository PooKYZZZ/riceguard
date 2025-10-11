# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import router as api_router
from db import ensure_indexes
from seed import seed_recommendations
from settings import ALLOWED_ORIGINS, UPLOAD_DIR
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_indexes()
    seed_recommendations()
    print("🚀 RiceGuard backend ready (Web + Mobile).")
    yield
    print("🛑 RiceGuard backend shutting down...")

app = FastAPI(
    title="RiceGuard Unified Backend",
    version="1.1",
    description="Single API backend for RiceGuard Web and Mobile applications.",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static uploads
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Health
@app.get("/health")
def health():
    return {"status": "ok", "message": "RiceGuard backend (Web + Mobile) is running."}

# API
app.include_router(api_router, prefix="/api/v1")
