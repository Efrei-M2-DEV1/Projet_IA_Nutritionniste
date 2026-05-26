from pydantic import BaseModel
from typing import Optional


class FoodItem(BaseModel):
    name: str
    confidence: float
    portion_estimate: str


class NutritionInfo(BaseModel):
    calories_kcal: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float


class AnalyzeResponse(BaseModel):
    success: bool
    foods: list[FoodItem]
    nutrition: NutritionInfo
    advice: str
    warnings: list[str]
    imageUrl: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
