import pytest

from app.services.nutrition import (
    _build_warnings,
    _lookup_nutrition,
    estimate_nutrition,
)


SAMPLE_FOODS = [
    {"name": "Poulet grillé", "confidence": 0.87, "portion_estimate": "moyenne"},
    {"name": "Riz", "confidence": 0.75, "portion_estimate": "petite"},
    {"name": "Salade verte", "confidence": 0.62, "portion_estimate": "grande"},
]


def test_lookup_nutrition_returns_positive_macros():
    macros = _lookup_nutrition(SAMPLE_FOODS)
    assert macros["kcal"] > 0
    assert macros["prot"] >= 0
    assert macros["carbs"] >= 0


def test_warnings_allergen_gluten():
    profile = {"allergens": ["gluten"], "diet": "none"}
    warnings = _build_warnings(
        [{"name": "Pâtes", "confidence": 0.9, "portion_estimate": "moyenne"}],
        profile,
    )
    assert any("gluten" in w.lower() for w in warnings)


def test_warnings_diabetes_high_carbs():
    profile = {"diabetes": True}
    warnings = _build_warnings(
        [{"name": "Riz", "confidence": 0.9, "portion_estimate": "moyenne"}],
        profile,
    )
    assert any("diabète" in w.lower() or "glucides" in w.lower() for w in warnings)


def test_warnings_vegan_detects_meat():
    profile = {"diet": "vegan"}
    warnings = _build_warnings(
        [{"name": "Poulet grillé", "confidence": 0.9, "portion_estimate": "moyenne"}],
        profile,
    )
    assert len(warnings) > 0


def test_warnings_kosher_detects_pork():
    profile = {"diet": "kosher"}
    warnings = _build_warnings(
        [{"name": "Jambon", "confidence": 0.9, "portion_estimate": "moyenne"}],
        profile,
    )
    assert any("kosher" in w.lower() and "jambon" in w.lower() for w in warnings)


def test_warnings_kosher_detects_shellfish():
    profile = {"diet": "kosher"}
    warnings = _build_warnings(
        [{"name": "Crevettes", "confidence": 0.9, "portion_estimate": "moyenne"}],
        profile,
    )
    assert any("kosher" in w.lower() and "crevette" in w.lower() for w in warnings)


def test_warnings_kosher_meat_and_dairy_mix():
    profile = {"diet": "kosher"}
    warnings = _build_warnings(
        [
            {"name": "Poulet grillé", "confidence": 0.9, "portion_estimate": "moyenne"},
            {"name": "Fromage", "confidence": 0.8, "portion_estimate": "petite"},
        ],
        profile,
    )
    assert any("viande" in w.lower() and "lait" in w.lower() for w in warnings)


def test_estimate_nutrition_fallback_without_api_key(monkeypatch):
    monkeypatch.delenv("MISTRAL_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("LLM_PROVIDER", raising=False)

    result = estimate_nutrition(SAMPLE_FOODS, {"diabetes": False})

    assert "nutrition" in result
    assert result["nutrition"]["calories_kcal"] > 0
    assert isinstance(result["advice"], str)
    assert len(result["advice"]) > 0
    assert isinstance(result["warnings"], list)


def test_estimate_nutrition_empty_foods():
    result = estimate_nutrition([])
    assert result["warnings"]
    assert "Aucun aliment" in result["advice"]


def test_estimate_nutrition_response_shape():
    result = estimate_nutrition(SAMPLE_FOODS)
    nutrition = result["nutrition"]
    for key in ("calories_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g"):
        assert key in nutrition
        assert isinstance(nutrition[key], (int, float))
