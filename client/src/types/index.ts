// Types — Nutritionniste IA (analyse de repas par photo)

export interface FoodItem {
  name: string;
  confidence: number;
  portion_estimate: string;
}

export interface NutritionInfo {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface ApiResponse {
  success: boolean;
  foods: FoodItem[];
  nutrition: NutritionInfo;
  advice: string;
  warnings: string[];
  imageUrl?: string | null;
  vision_mode?: string | null;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageUrl?: string;
  foods: FoodItem[];
  nutrition: NutritionInfo;
  advice: string;
  warnings: string[];
  vision_mode?: string | null;
}

export interface HealthProfile {
  id: string;
  name: string;
  diabetes: boolean;
  hypertension: boolean;
  obesity: boolean;
  allergens: string[];
  diet: "none" | "vegetarian" | "vegan" | "halal" | "kosher" | "gluten-free";
  avoidAdditives: boolean;
  avoidPalmOil: boolean;
  maxSugar: number;
  maxSalt: number;
}

export interface PersonalizedWarning {
  level: "critical" | "high" | "medium" | "info";
  icon: string;
  title: string;
  message: string;
  ingredient?: string;
}
