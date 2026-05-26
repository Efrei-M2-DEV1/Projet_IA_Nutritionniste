import type { HealthProfile, PersonalizedWarning } from "../types";

const STORAGE_KEY = "health_profile";

// Liste des allergènes courants avec leurs mots-clés de détection
export const COMMON_ALLERGENS = [
  {
    id: "gluten",
    label: "Gluten",
    keywords: ["gluten", "blé", "seigle", "orge", "épeautre"],
  },
  {
    id: "lactose",
    label: "Lactose/Lait",
    keywords: ["lait", "lactose", "lactosérum", "caséine", "crème"],
  },
  {
    id: "eggs",
    label: "Œufs",
    keywords: ["œuf", "oeuf", "albumine", "lécithine"],
  },
  {
    id: "nuts",
    label: "Fruits à coque",
    keywords: ["amande", "noisette", "noix", "pistache", "cajou"],
  },
  { id: "peanuts", label: "Arachides", keywords: ["arachide", "cacahuète"] },
  { id: "soy", label: "Soja", keywords: ["soja", "lécithine de soja"] },
  { id: "fish", label: "Poisson", keywords: ["poisson", "anchois", "thon"] },
  {
    id: "shellfish",
    label: "Crustacés",
    keywords: ["crevette", "crabe", "homard", "crustacé"],
  },
  {
    id: "sulfites",
    label: "Sulfites",
    keywords: ["sulfite", "E220", "E221", "E222", "E223", "E224"],
  },
];

//Profil par défaut (aucune restriction)
export const DEFAULT_PROFILE: HealthProfile = {
  id: "default",
  name: "Profil par défaut",
  diabetes: false,
  hypertension: false,
  obesity: false,
  allergens: [],
  diet: "none",
  avoidAdditives: false,
  avoidPalmOil: false,
  maxSugar: 100,
  maxSalt: 100,
};

// 💾 Sauvegarder le profil dans le navigateur (localStorage)
export function saveHealthProfile(profile: HealthProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  console.log("✅ Profil santé sauvegardé:", profile);
}
// 📂 Charger le profil depuis le navigateur
export function loadHealthProfile(): HealthProfile {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_PROFILE;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error("❌ Erreur chargement profil:", error);
    return DEFAULT_PROFILE;
  }
}
// 🗑️ Réinitialiser le profil
export function resetHealthProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log("🔄 Profil santé réinitialisé");
}

// ✅ Vérifier si un profil est actif
export function hasActiveProfile(): boolean {
  const profile = loadHealthProfile();
  return (
    profile.id !== "default" ||
    profile.diabetes ||
    profile.hypertension ||
    profile.allergens.length > 0 ||
    profile.diet !== "none"
  );
}

// 🔍 Analyser la compatibilité du produit avec le profil
export function analyzeProductCompatibility(
  extractedText: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ingredients: any[],
  profile: HealthProfile,
): {
  warnings: PersonalizedWarning[];
  suitabilityScore: number;
  recommendation: string;
} {
  const warnings: PersonalizedWarning[] = [];
  let compatibilityScore = 100;

  const textLower = extractedText.toLowerCase();

  // 1️⃣ DIABÈTE : Vérifier les sucres
  if (profile.diabetes) {
    const sugarIngredients = ingredients.filter(
      (ing) =>
        ing.category === "sugar_added" ||
        ing.name.toLowerCase().includes("sucre") ||
        ing.name.toLowerCase().includes("glucose") ||
        ing.name.toLowerCase().includes("fructose"),
    );

    if (sugarIngredients.length > 0) {
      const sugarLevel =
        sugarIngredients.length >= 3
          ? "critical"
          : sugarIngredients.length >= 2
            ? "high"
            : "medium";

      warnings.push({
        level: sugarLevel,
        icon: "🚨",
        title: "Attention Diabète",
        message: `${sugarIngredients.length} type(s) de sucres détecté(s). Risque d'hyperglycémie.`,
        ingredient: sugarIngredients.map((s) => s.name).join(", "),
      });

      compatibilityScore -= sugarIngredients.length * 15;
    }
  }

  // 2️⃣ HYPERTENSION : Vérifier le sel
  if (profile.hypertension) {
    const hasSalt =
      textLower.includes("sel") ||
      textLower.includes("sodium") ||
      textLower.includes("nacl");

    const highSaltAdditives = ["E621", "glutamate", "bouillon"];
    const saltAdditives = ingredients.filter((ing) =>
      highSaltAdditives.some((additive) =>
        ing.name.toLowerCase().includes(additive.toLowerCase()),
      ),
    );

    if (hasSalt || saltAdditives.length > 0) {
      warnings.push({
        level: saltAdditives.length > 0 ? "critical" : "high",
        icon: "⚠️",
        title: "Attention Hypertension",
        message:
          saltAdditives.length > 0
            ? `Contient des additifs riches en sodium (${saltAdditives.map((s) => s.name).join(", ")})`
            : "Contient du sel. Vérifiez la teneur en sodium.",
      });

      compatibilityScore -= saltAdditives.length > 0 ? 25 : 15;
    }
  }

  // 3️⃣ ALLERGÈNES : Détection ultra-précise
  if (profile.allergens.length > 0) {
    profile.allergens.forEach((allergenId) => {
      const allergenData = COMMON_ALLERGENS.find((a) => a.id === allergenId);
      if (!allergenData) return;

      const detected = allergenData.keywords.some((keyword) =>
        textLower.includes(keyword.toLowerCase()),
      );

      if (detected) {
        warnings.push({
          level: "critical",
          icon: "🛑",
          title: `ALLERGÈNE: ${allergenData.label}`,
          message: `Produit DÉCONSEILLÉ ! Contient ou peut contenir des traces de ${allergenData.label}.`,
          ingredient: allergenData.label,
        });

        compatibilityScore -= 40;
      }
    });
  }

  // 4️⃣ RÉGIMES SPÉCIAUX
  if (profile.diet === "vegetarian" || profile.diet === "vegan") {
    const animalIngredients = [
      "viande",
      "poisson",
      "gélatine",
      "carmin",
      "cochenille",
      ...(profile.diet === "vegan" ? ["lait", "œuf", "miel", "lactose"] : []),
    ];

    const detected = animalIngredients.filter((ing) => textLower.includes(ing));

    if (detected.length > 0) {
      warnings.push({
        level: "critical",
        icon: "🌱",
        title: `Non ${profile.diet === "vegan" ? "Vegan" : "Végétarien"}`,
        message: `Contient des ingrédients d'origine animale: ${detected.join(", ")}`,
      });

      compatibilityScore -= 30;
    }
  }

  // Score final (minimum 0)
  const finalScore = Math.max(0, compatibilityScore);

  // Recommandation globale
  let recommendation = "";
  if (finalScore >= 80) {
    recommendation = "✅ Compatible avec votre profil santé !";
  } else if (finalScore >= 60) {
    recommendation = "⚠️ Consommation modérée recommandée.";
  } else if (finalScore >= 40) {
    recommendation = "🚫 Déconseillé pour votre profil santé.";
  } else {
    recommendation = "🛑 FORTEMENT DÉCONSEILLÉ ! Risques pour votre santé.";
  }

  return {
    warnings: warnings.sort((a, b) => {
      const levelOrder = { critical: 0, high: 1, medium: 2, info: 3 };
      return levelOrder[a.level] - levelOrder[b.level];
    }),
    suitabilityScore: finalScore,
    recommendation,
  };
}
