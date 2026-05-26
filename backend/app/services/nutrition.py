"""
Service nutrition — estime les macronutriments et génère des conseils.

Phase actuelle : mock (données simulées + conseils génériques).
À implémenter : appel LLM (Mistral / OpenAI / autre) avec prompt structuré.
"""

import json
import os
from typing import Optional

# ── Imports LLM (décommentez selon le provider choisi) ───────────────────────
# from mistralai import Mistral          # Option A – Mistral
# import openai                          # Option B – OpenAI / GPT-4o
# from anthropic import Anthropic        # Option C – Claude


# ── Table nutritionnelle de référence (kcal, prot, carbs, fat, fiber / 100 g) ─
NUTRITION_TABLE: dict[str, dict] = {
    "poulet grillé": {"kcal": 165, "prot": 31, "carbs": 0,  "fat": 3.6, "fiber": 0},
    "riz":           {"kcal": 130, "prot": 2.7,"carbs": 28, "fat": 0.3, "fiber": 0.4},
    "salade verte":  {"kcal": 15,  "prot": 1.3,"carbs": 2.9,"fat": 0.2, "fiber": 1.8},
    "pasta":         {"kcal": 220, "prot": 8,  "carbs": 43, "fat": 1.3, "fiber": 1.8},
    "pizza":         {"kcal": 266, "prot": 11, "carbs": 33, "fat": 10,  "fiber": 2.3},
}


def _lookup_nutrition(foods: list[dict]) -> dict:
    """Estimation via table — fallback si pas de LLM."""
    totals = {"kcal": 0.0, "prot": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0}
    for food in foods:
        key = food["name"].lower()
        ref = NUTRITION_TABLE.get(key, {"kcal": 150, "prot": 8, "carbs": 20, "fat": 5, "fiber": 2})
        # Portion grossière : petite=0.7 / moyenne=1.0 / grande=1.3
        mult = {"petite": 0.7, "grande": 1.3}.get(food.get("portion_estimate", "moyenne"), 1.0)
        totals["kcal"]  += ref["kcal"]  * mult
        totals["prot"]  += ref["prot"]  * mult
        totals["carbs"] += ref["carbs"] * mult
        totals["fat"]   += ref["fat"]   * mult
        totals["fiber"] += ref["fiber"] * mult
    return {k: round(v, 1) for k, v in totals.items()}


def _build_warnings(foods: list[dict], profile: Optional[dict]) -> list[str]:
    """Génère des alertes basées sur le profil santé."""
    warnings: list[str] = []
    if not profile:
        return warnings
    allergens: list[str] = [a.lower() for a in profile.get("allergens", [])]
    food_names = [f["name"].lower() for f in foods]
    for food in food_names:
        for allergen in allergens:
            if allergen in food:
                warnings.append(f"Allergie possible : {food} contient {allergen}")
    if profile.get("diabetes") and any("riz" in f or "pasta" in f for f in food_names):
        warnings.append("Attention : glucides élevés — surveillance glycémique recommandée")
    return warnings


def estimate_nutrition(foods: list[dict], health_profile: Optional[dict] = None) -> dict:
    """
    Estime calories + macros et génère des conseils personnalisés.

    Args:
        foods: Sortie de detect_foods().
        health_profile: Profil santé du client (optionnel).

    Returns:
        { nutrition: NutritionInfo, advice: str, warnings: list[str] }
    """
    macros = _lookup_nutrition(foods)
    warnings = _build_warnings(foods, health_profile)

    # ── Conseils mock ─────────────────────────────────────────────────────────
    advice = (
        f"Votre repas apporte environ {macros['kcal']:.0f} kcal avec "
        f"{macros['prot']:.0f} g de protéines. "
        "Bonne source de protéines maigres ! Pensez à bien vous hydrater."
    )

    # ── Conseils via LLM (à décommenter et adapter) ───────────────────────────
    # foods_str = ", ".join(f["name"] for f in foods)
    # profile_str = json.dumps(health_profile or {}, ensure_ascii=False)
    # prompt = f"""
    # Aliments détectés : {foods_str}
    # Macros estimés : {json.dumps(macros)}
    # Profil santé : {profile_str}
    #
    # Génère en français des conseils nutritionnels personnalisés en 2-3 phrases.
    # Réponds uniquement avec le texte des conseils, sans introduction.
    # """
    # # Mistral :
    # client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))
    # resp = client.chat.complete(
    #     model=os.getenv("MISTRAL_MODEL", "mistral-small-latest"),
    #     messages=[{"role": "user", "content": prompt}],
    # )
    # advice = resp.choices[0].message.content.strip()

    return {
        "nutrition": {
            "calories_kcal": macros["kcal"],
            "protein_g":     macros["prot"],
            "carbs_g":       macros["carbs"],
            "fat_g":         macros["fat"],
            "fiber_g":       macros["fiber"],
        },
        "advice": advice,
        "warnings": warnings,
    }
