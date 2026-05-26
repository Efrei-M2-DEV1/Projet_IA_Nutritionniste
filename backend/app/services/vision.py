"""
Service de vision — détection des aliments dans une image.

Phase actuelle : mock (retourne des données simulées).
À implémenter : detect_foods() avec un modèle HF food-classification
(ex. nateraw/food ou wesleyacheng/food-classification).
"""

import io
from typing import Optional

# ── Imports réels (décommentez quand vous intégrez le modèle) ─────────────────
# from transformers import pipeline
# from PIL import Image
# import torch

# FOOD_CLASSIFIER = pipeline(
#     "image-classification",
#     model="nateraw/food",
#     top_k=5,
# )

# Labels FR (compléter selon le modèle choisi)
LABELS_FR: dict[str, str] = {
    "pizza": "Pizza",
    "sushi": "Sushi",
    "hamburger": "Hamburger",
    "salad": "Salade",
    "pasta": "Pâtes",
    "steak": "Steak",
    "chicken": "Poulet",
    "rice": "Riz",
    "soup": "Soupe",
    "sandwich": "Sandwich",
}


def translate_label(label: str) -> str:
    return LABELS_FR.get(label.lower(), label.replace("_", " ").title())


def detect_foods(image_bytes: bytes) -> list[dict]:
    """
    Détecte les aliments dans une image.

    Args:
        image_bytes: Contenu brut du fichier image.

    Returns:
        Liste de dicts { name, confidence, portion_estimate }.
    """
    # ── Mock ──────────────────────────────────────────────────────────────────
    # Remplacer par l'inférence réelle quand le modèle est intégré.
    return [
        {"name": "Poulet grillé", "confidence": 0.87, "portion_estimate": "moyenne"},
        {"name": "Riz", "confidence": 0.75, "portion_estimate": "petite"},
        {"name": "Salade verte", "confidence": 0.62, "portion_estimate": "grande"},
    ]

    # ── Inférence réelle (à décommenter) ──────────────────────────────────────
    # image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # results = FOOD_CLASSIFIER(image)
    # foods = []
    # for r in results:
    #     foods.append({
    #         "name": translate_label(r["label"]),
    #         "confidence": round(r["score"], 2),
    #         "portion_estimate": "moyenne",
    #     })
    # return foods
