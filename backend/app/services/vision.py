import io
import json
from pathlib import Path
from typing import Dict, List

from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
LABELS_PATH = BASE_DIR / "labels_fr.json"

try:
    import torch
    from transformers import pipeline
except Exception:  # pragma: no cover - depends on local Python env
    torch = None
    pipeline = None

MODEL_ID = "vishnudas08/food101-vit-model"
MIN_CONFIDENCE = 0.10

if not LABELS_PATH.exists():
    raise FileNotFoundError(f"Labels file not found: {LABELS_PATH}")
with open(LABELS_PATH, "r", encoding="utf-8") as f:
    FOOD_LABELS: List[str] = json.load(f)


def _build_label_map() -> Dict[str, str]:
    return {
        "fried_rice": "riz",
        "rice": "riz",
        "white_rice": "riz",
        "brown_rice": "riz complet",
        "french_fries": "frites",
        "fries": "frites",
        "pizza": "pizza",
        "spaghetti": "pâtes",
        "pasta": "pâtes",
        "lasagna": "lasagnes",
        "lasagne": "lasagnes",
        "ramen": "ramen",
        "salad": "salade",
        "green_salad": "salade verte",
        "burger": "burger",
        "hamburger": "burger",
        "steak": "steak",
        "chicken_curry": "poulet",
        "grilled_chicken": "poulet grillé",
        "chicken_wings": "poulet",
        "soup": "soupe",
        "noodles": "nouilles",
        "cake": "gâteau",
        "ice_cream": "glace",
        "apple_pie": "tarte aux pommes",
        "apple": "pomme",
        "banana": "banane",
        "orange": "orange",
        "sandwich": "sandwich",
        "omelette": "omelette",
        "eggs": "oeufs",
        "fish_and_chips": "poisson pané",
        "seafood": "fruits de mer",
        "macaroni_and_cheese": "pâtes",
        "macaroni": "pâtes",
        "hot_dog": "hot-dog",
        "hotdog": "hot-dog",
        "taco": "tacos",
        "sushi": "sushi",
        "ramen": "ramen",
        "waffles": "gaufres",
        "pancakes": "pancakes",
    }


LABEL_MAP = _build_label_map()


def _normalize_label(label: str) -> str:
    key = label.lower().replace(" ", "_").replace("-", "_")
    return LABEL_MAP.get(key, label.replace("_", " ").replace("-", " "))


def _load_classifier():
    if pipeline is None:
        return None
    return pipeline(
        task="image-classification",
        model=MODEL_ID,
        top_k=5,
        device=0 if torch is not None and torch.cuda.is_available() else -1,
    )


CLASSIFIER = _load_classifier()
MODEL_READY = CLASSIFIER is not None


def get_vision_mode() -> str:
    return "food101-hf" if MODEL_READY else "unavailable"


def _fallback_detections() -> List[Dict]:
    return [
        {"name": "assiette", "confidence": 0.35, "portion_estimate": "moyenne"},
    ]


def detect_foods(image_bytes: bytes, top_k: int = 5) -> List[Dict]:
    """Detect food labels from an image using a Food-101 fine-tuned classifier.

    This returns real dish categories such as riz, frites, pâtes, pizza, salad,
    etc. It avoids the generic ImageNet misclassifications that were producing
    absurd results on the demo images.
    """
    if not MODEL_READY:
        return _fallback_detections()

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    raw_results = CLASSIFIER(image)

    results: List[Dict] = []
    seen = set()
    for item in raw_results[:top_k]:
        raw_label = str(item.get("label", "")).strip()
        confidence = float(item.get("score", 0.0))
        if confidence < MIN_CONFIDENCE:
            continue
        normalized = _normalize_label(raw_label)
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        results.append(
            {
                "name": normalized,
                "confidence": round(confidence, 4),
                "portion_estimate": "moyenne",
            }
        )

    if not results:
        return [
            {
                "name": "rien détecté",
                "confidence": 0.0,
                "portion_estimate": "inconnue",
            }
        ]

    return results[:top_k]


def available_labels() -> List[str]:
    return FOOD_LABELS.copy()
