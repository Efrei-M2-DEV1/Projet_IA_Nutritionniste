"""
Service nutrition — estime les macronutriments et génère des conseils personnalisés.

Pipeline :
  1. Estimation des macros (LLM structuré ou table nutritionnelle en fallback)
  2. Alertes déterministes selon le profil santé (allergies, diabète, régimes…)
  3. Conseils personnalisés via LLM (fallback texte template si indisponible)
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any, Optional

import httpx

logger = logging.getLogger(__name__)


# ── Table nutritionnelle de référence (kcal, prot, carbs, fat, fiber / 100 g) ─
NUTRITION_TABLE: dict[str, dict] = {
    "poulet grillé": {"kcal": 165, "prot": 31, "carbs": 0,  "fat": 3.6, "fiber": 0},
    "riz":           {"kcal": 130, "prot": 2.7,"carbs": 28, "fat": 0.3, "fiber": 0.4},
    "salade verte":  {"kcal": 15,  "prot": 1.3,"carbs": 2.9,"fat": 0.2, "fiber": 1.8},
    "salade":        {"kcal": 15,  "prot": 1.3,"carbs": 2.9,"fat": 0.2, "fiber": 1.8},
    "pâtes":         {"kcal": 220, "prot": 8,  "carbs": 43, "fat": 1.3, "fiber": 1.8},
    "pasta":         {"kcal": 220, "prot": 8,  "carbs": 43, "fat": 1.3, "fiber": 1.8},
    "lasagnes":      {"kcal": 150, "prot": 8,  "carbs": 20, "fat": 6,   "fiber": 1.8},
    "lasagne":       {"kcal": 150, "prot": 8,  "carbs": 20, "fat": 6,   "fiber": 1.8},
    "pizza":         {"kcal": 266, "prot": 11, "carbs": 33, "fat": 10,  "fiber": 2.3},
    "burger":        {"kcal": 295, "prot": 17, "carbs": 30, "fat": 13,  "fiber": 2.0},
    "brocoli":       {"kcal": 34,  "prot": 2.8,"carbs": 7,  "fat": 0.4, "fiber": 2.6},
    "banane":        {"kcal": 89,  "prot": 1.1,"carbs": 23, "fat": 0.3, "fiber": 2.6},
    "pomme":         {"kcal": 52,  "prot": 0.3,"carbs": 14, "fat": 0.2, "fiber": 2.4},
    "orange":        {"kcal": 47,  "prot": 0.9,"carbs": 12, "fat": 0.1, "fiber": 2.4},
    "salade":        {"kcal": 15,  "prot": 1.3,"carbs": 2.9,"fat": 0.2, "fiber": 1.8},
    "glace":         {"kcal": 207, "prot": 3.5,"carbs": 24, "fat": 11,  "fiber": 0.7},
    "soupe":         {"kcal": 40,  "prot": 2,  "carbs": 6,  "fat": 1.2, "fiber": 1.0},
}

ANIMAL_KEYWORDS = [
    "viande", "poulet", "bœuf", "boeuf", "porc", "agneau", "steak", "jambon",
    "poisson", "thon", "saumon", "crevette", "crabe", "charcuterie",
]

VEGAN_EXTRA_KEYWORDS = ["lait", "fromage", "beurre", "crème", "œuf", "oeuf", "miel", "yaourt"]

HIGH_CARB_KEYWORDS = ["riz", "pâtes", "pasta", "pain", "pizza", "pomme de terre", "patate", "semoule"]

HIGH_SODIUM_KEYWORDS = ["pizza", "charcuterie", "jambon", "soupe", "fromage", "sauce soja"]

GLUTEN_KEYWORDS = ["gluten", "pâtes", "pasta", "pain", "pizza", "lasagne", "lasagnes", "semoule"]

PORK_KEYWORDS = ["porc", "jambon", "lard", "bacon", "saucisse"]

KOSHER_SHELLFISH_KEYWORDS = ["crevette", "crabe", "homard", "crustacé", "moule", "calmar", "poulpe"]

KOSHER_MEAT_KEYWORDS = [
    "viande", "poulet", "bœuf", "boeuf", "porc", "agneau", "steak", "jambon", "charcuterie",
]

KOSHER_DAIRY_KEYWORDS = ["lait", "fromage", "beurre", "crème", "yaourt", "mozzarella", "parmesan"]

DEFAULT_NUTRITION: dict[str, float] = {
    "kcal": 100.0,
    "prot": 5.0,
    "carbs": 12.0,
    "fat": 4.0,
    "fiber": 1.0,
}

PORTION_MULTIPLIERS: dict[str, float] = {
    "petite": 0.5,
    "demi": 0.5,
    "demi-assiette": 0.5,
    "moyenne": 1.0,
    "assiette": 1.0,
    "grande": 1.5,
    "grande portion": 1.5,
    "inconnue": 1.0,
}


def _normalize(text: str) -> str:
    return text.lower().strip()


def _find_nutrition_ref(food_name: str) -> dict[str, float]:
    """Recherche la valeur nutritionnelle la plus proche dans la table."""
    name = _normalize(food_name)
    if name in NUTRITION_TABLE:
        return NUTRITION_TABLE[name]

    for key, values in NUTRITION_TABLE.items():
        if key in name or name in key:
            return values

    return DEFAULT_NUTRITION.copy()


def _lookup_nutrition(foods: list[dict]) -> dict[str, float]:
    """Estimation via table — fallback fiable si le LLM est indisponible."""
    totals = {"kcal": 0.0, "prot": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0}

    for food in foods:
        ref = _find_nutrition_ref(food["name"])
        portion = _normalize(food.get("portion_estimate", "moyenne"))
        mult = PORTION_MULTIPLIERS.get(portion, 1.0)

        for key in totals:
            totals[key] += ref[key] * mult

    return {key: round(value, 1) for key, value in totals.items()}


def _food_names_lower(foods: list[dict]) -> list[str]:
    return [_normalize(f["name"]) for f in foods]


def _contains_keyword(texts: list[str], keywords: list[str]) -> Optional[str]:
    for text in texts:
        for keyword in keywords:
            if keyword in text:
                return keyword
    return None


def _build_warnings(foods: list[dict], profile: Optional[dict]) -> list[str]:
    """Alertes basées sur des règles explicites (plus fiables que le LLM seul)."""
    warnings: list[str] = []
    if not profile:
        return warnings

    allergens: list[str] = [_normalize(a) for a in profile.get("allergens", [])]
    diet = _normalize(str(profile.get("diet", "")))
    food_names = _food_names_lower(foods)

    for allergen in allergens:
        keywords = GLUTEN_KEYWORDS if allergen == "gluten" else [allergen]
        matched = _contains_keyword(food_names, keywords)
        if matched:
            warnings.append(f"Allergie possible : {matched} peut contenir {allergen}")

    if profile.get("diabetes") and _contains_keyword(food_names, HIGH_CARB_KEYWORDS):
        warnings.append("Attention diabète : glucides élevés — surveillance glycémique recommandée")

    if profile.get("hypertension") and _contains_keyword(food_names, HIGH_SODIUM_KEYWORDS):
        warnings.append("Attention hypertension : ce repas peut être riche en sel.")

    if diet == "vegan":
        matched = _contains_keyword(food_names, ANIMAL_KEYWORDS + VEGAN_EXTRA_KEYWORDS)
        if matched:
            warnings.append(f"Régime vegan : {matched} n'est probablement pas compatible.")

    if diet == "vegetarian":
        matched = _contains_keyword(food_names, ANIMAL_KEYWORDS)
        if matched:
            warnings.append(f"Régime végétarien : {matched} n'est probablement pas compatible.")

    if diet == "halal":
        matched = _contains_keyword(food_names, PORK_KEYWORDS)
        if matched:
            warnings.append(f"Régime halal : {matched} n'est probablement pas compatible.")

    if diet == "kosher":
        pork = _contains_keyword(food_names, PORK_KEYWORDS)
        if pork:
            warnings.append(f"Régime kosher : {pork} n'est pas compatible.")

        shellfish = _contains_keyword(food_names, KOSHER_SHELLFISH_KEYWORDS)
        if shellfish:
            warnings.append(f"Régime kosher : {shellfish} n'est pas compatible.")

        has_meat = _contains_keyword(food_names, KOSHER_MEAT_KEYWORDS)
        has_dairy = _contains_keyword(food_names, KOSHER_DAIRY_KEYWORDS)
        if has_meat and has_dairy:
            warnings.append("Régime kosher : mélange viande et lait détecté.")

    if diet == "gluten-free":
        for allergen in allergens:
            if allergen == "gluten":
                break
        else:
            matched = _contains_keyword(food_names, GLUTEN_KEYWORDS)
            if matched:
                warnings.append(f"Régime sans gluten : {matched} peut contenir du gluten.")

    return warnings


def _macros_to_response(macros: dict[str, float]) -> dict[str, float]:
    return {
        "calories_kcal": macros["kcal"],
        "protein_g": macros["prot"],
        "carbs_g": macros["carbs"],
        "fat_g": macros["fat"],
        "fiber_g": macros["fiber"],
    }


def _build_fallback_advice(macros: dict[str, float], profile: Optional[dict], warnings: list[str]) -> str:
    """Conseils template utilisés quand le LLM n'est pas disponible."""
    parts = [
        f"Votre repas apporte environ {macros['kcal']:.0f} kcal "
        f"({macros['prot']:.0f} g protéines, {macros['carbs']:.0f} g glucides, "
        f"{macros['fat']:.0f} g lipides)."
    ]

    if macros["prot"] >= 25:
        parts.append("Bonne contribution protéique pour la satiété.")
    if macros["fiber"] < 5:
        parts.append("Pensez à ajouter des légumes ou une source de fibres.")
    if profile and profile.get("diabetes") and macros["carbs"] > 40:
        parts.append("Privilégiez une portion modérée de féculents et marchez après le repas si possible.")

    if warnings:
        parts.append("Consultez les alertes affichées ci-dessus avant de consommer ce repas.")

    parts.append("Ces estimations sont indicatives et ne remplacent pas un avis médical.")
    return " ".join(parts)


def _build_llm_prompt(foods: list[dict], profile: Optional[dict]) -> str:
    foods_json = json.dumps(foods, ensure_ascii=False)
    profile_json = json.dumps(profile or {}, ensure_ascii=False)

    return f"""Tu es un assistant nutritionnel. Analyse ce repas et réponds UNIQUEMENT en JSON valide.

Aliments détectés (avec portion estimée) :
{foods_json}

Profil santé de l'utilisateur :
{profile_json}

Réponds avec exactement ce schéma JSON (nombres en float, advice en français, 2-4 phrases) :
{{
  "nutrition": {{
    "calories_kcal": <nombre>,
    "protein_g": <nombre>,
    "carbs_g": <nombre>,
    "fat_g": <nombre>,
    "fiber_g": <nombre>
  }},
  "advice": "<conseils personnalisés en français, tenant compte du profil santé>"
}}

Règles :
- Estime les macros pour l'ensemble du repas (pas pour 100 g seuls).
- Adapte les conseils au profil (allergies, diabète, hypertension, régime alimentaire).
- Ne pose pas de diagnostic médical ; reste prudent et pédagogique.
- Réponds uniquement avec le JSON, sans markdown ni texte autour."""


def _extract_json(text: str) -> dict[str, Any]:
    """Extrait un objet JSON même si le modèle ajoute du texte autour."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group())


def _validate_nutrition_payload(data: dict[str, Any]) -> dict[str, float]:
    nutrition = data.get("nutrition")
    if not isinstance(nutrition, dict):
        raise ValueError("Champ 'nutrition' manquant ou invalide")

    required = ("calories_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g")
    result: dict[str, float] = {}
    for key in required:
        if key not in nutrition:
            raise ValueError(f"Clé nutrition manquante : {key}")
        result[key] = round(float(nutrition[key]), 1)

    return result


def _get_llm_provider() -> Optional[str]:
    provider = os.getenv("LLM_PROVIDER", "").lower().strip()
    if provider in ("mistral", "openai"):
        return provider
    if os.getenv("MISTRAL_API_KEY"):
        return "mistral"
    if os.getenv("OPENAI_API_KEY"):
        return "openai"
    return None


def _call_mistral(prompt: str) -> str:
    api_key = os.getenv("MISTRAL_API_KEY")
    if not api_key:
        raise RuntimeError("MISTRAL_API_KEY non configurée")

    model = os.getenv("MISTRAL_MODEL", "mistral-small-latest")
    response = httpx.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": 0.3,
        },
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def _call_openai(prompt: str) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY non configurée")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    response = httpx.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
            "temperature": 0.3,
        },
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def _call_llm(foods: list[dict], profile: Optional[dict]) -> dict[str, Any]:
    """Appelle le LLM configuré et retourne nutrition + advice parsés."""
    provider = _get_llm_provider()
    if not provider:
        raise RuntimeError("Aucun provider LLM configuré")

    prompt = _build_llm_prompt(foods, profile)
    raw = _call_mistral(prompt) if provider == "mistral" else _call_openai(prompt)
    parsed = _extract_json(raw)

    nutrition = _validate_nutrition_payload(parsed)
    advice = parsed.get("advice", "").strip()
    if not advice:
        raise ValueError("Le LLM n'a pas renvoyé de conseils")

    return {"nutrition": nutrition, "advice": advice}


def estimate_nutrition(foods: list[dict], health_profile: Optional[dict] = None) -> dict:
    """
    Estime calories + macros et génère des conseils personnalisés.

    Args:
        foods: Sortie de detect_foods() — [{ name, confidence, portion_estimate }].
        health_profile: Profil santé du client (optionnel).

    Returns:
        { nutrition: NutritionInfo, advice: str, warnings: list[str] }
    """
    if not foods:
        return {
            "nutrition": _macros_to_response(DEFAULT_NUTRITION),
            "advice": (
                "Aucun aliment n'a été détecté sur la photo. "
                "Essayez une image plus nette, de face, avec un bon éclairage."
            ),
            "warnings": ["Aucun aliment détecté — estimation nutritionnelle impossible."],
        }

    fallback_macros = _lookup_nutrition(foods)
    warnings = _build_warnings(foods, health_profile)

    try:
        llm_result = _call_llm(foods, health_profile)
        return {
            "nutrition": llm_result["nutrition"],
            "advice": llm_result["advice"],
            "warnings": warnings,
        }
    except Exception as exc:
        logger.warning("LLM indisponible, fallback table nutritionnelle : %s", exc)
        return {
            "nutrition": _macros_to_response(fallback_macros),
            "advice": _build_fallback_advice(fallback_macros, health_profile, warnings),
            "warnings": warnings,
        }
