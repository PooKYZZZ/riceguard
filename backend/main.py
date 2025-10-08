from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import router as api_router
from db import ensure_indexes
from seed import seed_recommendations
from settings import ALLOWED_ORIGINS


# ✅ New-style lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when app starts
    ensure_indexes()
    seed_recommendations()
    print("🚀 RiceGuard backend is ready to serve requests.")
    yield
    # (Optional) Runs once when app shuts down
    print("🛑 RiceGuard backend shutting down...")


app = FastAPI(
    title="RiceGuard Backend",
    version="1.0",
    description="API backend for RiceGuard mobile/web app.",
    lifespan=lifespan,
)


# ---------------------- CORS --------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- HEALTH ------------------------
@app.get("/health")
def health():
    return {"status": "ok", "message": "RiceGuard backend is running."}

# ---------------------- ROUTERS -----------------------
app.include_router(api_router, prefix="/api/v1")
