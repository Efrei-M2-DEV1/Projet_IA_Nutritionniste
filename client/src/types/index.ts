export interface IngredientAnalysis {
  name: string;
  category: string;
  explanation: string;
  riskLevel: "low" | "medium" | "high" | "none";
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageUrl?: string;
  extractedText: string;
  ingredients: IngredientAnalysis[];
  score: number;
  grade: "A" | "B" | "C" | "D" | "E";
  summary: {
    positives: string[];
    warnings: string[];
    recommendations: string[];
  };
  // Ajout des nouvelles propriétés
  personalizedWarnings?: PersonalizedWarning[];
  suitabilityScore?: number;
  profileRecommendation?: string;
}

export interface ApiResponse {
  success: boolean;
  extractedText: string;
  analysis: {
    ingredients: IngredientAnalysis[];
    score: number;
    grade: "A" | "B" | "C" | "D" | "E";
    summary: {
      positives: string[];
      warnings: string[];
      recommendations: string[];
    };
    // Nouvelles propriétés
    };
    personalizedWarnings?: PersonalizedWarning[];
    suitabilityScore?: number;
    profileRecommendation?: string;
  };
  


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
