import json
import io
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from app.models.schemas import AnalyzeResponse, ErrorResponse
from app.services.vision import detect_foods, available_labels, get_vision_mode
from app.services.nutrition import estimate_nutrition

router = APIRouter()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 Mo


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Image manquante ou invalide"},
        413: {"model": ErrorResponse, "description": "Fichier trop volumineux"},
        500: {"model": ErrorResponse, "description": "Erreur serveur"},
    },
    summary="Analyse une photo de repas",
)
async def analyze(
    image: UploadFile = File(..., description="Photo du repas (JPEG/PNG/WebP, max 5 Mo)"),
    healthProfile: str = Form(default="{}", description="Profil santé (JSON string, optionnel)"),
):
    # ── Validation MIME ───────────────────────────────────────────────────────
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non supporté : {image.content_type}. "
                   f"Formats acceptés : JPEG, PNG, WebP.",
        )

    # ── Lecture + validation taille ───────────────────────────────────────────
    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Fichier trop volumineux ({len(image_bytes) // 1024} Ko). Maximum : 5 Mo.",
        )
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Le fichier image est vide.")

    # ── Parsing du profil santé ───────────────────────────────────────────────
    try:
        profile = json.loads(healthProfile) if healthProfile else {}
    except json.JSONDecodeError:
        profile = {}

    # ── Pipeline vision → nutrition ───────────────────────────────────────────
    try:
        foods = detect_foods(image_bytes)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erreur détection aliments : {exc}")

    try:
        result = estimate_nutrition(foods, profile)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erreur estimation nutrition : {exc}")

    return AnalyzeResponse(
        success=True,
        foods=foods,
        nutrition=result["nutrition"],
        advice=result["advice"],
        warnings=result["warnings"],
        imageUrl=None,
        vision_mode=get_vision_mode(),
    )


@router.get("/vision/labels", summary="Liste des labels d'aliments disponibles")
def get_labels():
    """Retourne la liste des labels francais utilisés par la détection (utile pour le frontend)."""
    try:
        labels = available_labels()
    except Exception:
        labels = []
    return JSONResponse(content={"labels": labels, "count": len(labels)})
