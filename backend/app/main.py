import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.analyze import router as analyze_router

app = FastAPI(
    title="Nutritionniste IA — Backend",
    description="Analyseur de repas par photo : vision + estimation nutritionnelle.",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(analyze_router, prefix="/api")


@app.get("/health", tags=["infra"])
def health_check():
    return {"status": "ok", "service": "nutritionniste-ia-backend"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Erreur interne du serveur."},
    )
