// ── Nouveaux types — Analyseur de repas par photo ────────────────────────────

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
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageUrl?: string;
  foods: FoodItem[];
  nutrition: NutritionInfo;
  advice: string;
  warnings: string[];
}

// ── Types legacy (conservés pour compatibilité historique) ───────────────────

export interface IngredientAnalysis {
  name: string;
  category: string;
  explanation: string;
  riskLevel: "low" | "medium" | "high" | "none";
}
  


export interface HealthProfile {
  id: string;
  name: string;
  // Conditions médicales
  diabetes: boolean;
  hypertension: boolean;
  obesity: boolean;
  // Allergènes à éviter
  allergens: string[];
  // Régimes alimentaires
  diet: "none" | "vegetarian" | "vegan" | "halal" | "kosher" | "gluten-free";
  // Préférences
  avoidAdditives: boolean;
  avoidPalmOil: boolean;
  maxSugar: number; // g/100g
  maxSalt: number; // g/100g
}

export interface PersonalizedWarning {
  level: "critical" | "high" | "medium" | "info";
  icon: string;
  title: string;
  message: string;
  ingredient?: string;
}

// Étendre l'interface existante
export interface Analysis {
  // ...propriétés existantes...
  personalizedWarnings?: PersonalizedWarning[];
  suitabilityScore?: number; // Score adapté au profil (0-100)
  profileRecommendation?: string;
}
