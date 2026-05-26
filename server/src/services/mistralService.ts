import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;
const model = process.env.MISTRAL_MODEL || "pixtral-12b-2409";

if (!apiKey) {
  throw new Error(
    "ERREUR FATALE: La clé API MISTRAL_API_KEY est manquante dans le .env",
  );
}

const client = new Mistral({ apiKey });

// ✅ NOUVELLE FONCTION : Générer un prompt PERSONNALISÉ selon le profil
function generatePersonalizedPrompt(healthProfile?: any): string {
  // Profil par défaut si non fourni
  const profile = healthProfile || {
    diabetes: false,
    hypertension: false,
    obesity: false,
    allergens: [],
    diet: "none",
    avoidAdditives: false,
    avoidPalmOil: false,
  };

  // 🔥 CONSTRUCTION DU PROMPT DYNAMIQUE
  let profileInstructions = "";
  let criticalRules = "";
  let scoringAdjustments = "";

  // 🩺 DIABÈTE
  if (profile.diabetes) {
    profileInstructions += `
🚨 PROFIL DIABÉTIQUE DÉTECTÉ - RÈGLES STRICTES :
- Tout produit avec >10g de sucre/100g reçoit automatiquement un score ≤ 40/100 (Grade D ou E)
- Tout produit avec >5g de sucre/100g reçoit un score ≤ 60/100 (Grade C max)
- Sirop de glucose-fructose, dextrose, maltodextrine = SCORE MAX 25/100 (Grade E)
- Édulcorants artificiels (aspartame, sucralose) = WARNING CRITIQUE même si 0 calorie
- INTERDICTIONS ABSOLUES : Sodas sucrés, bonbons, pâtisseries industrielles, céréales sucrées
`;

    criticalRules += `
- Si >15g sucre/100g → warnings DOIT contenir "⛔ INTERDIT pour diabétiques - Risque hyperglycémie sévère"
- Si 10-15g sucre/100g → warnings DOIT contenir "🚫 DÉCONSEILLÉ diabète - Glycémie impactée"
- Si 5-10g sucre/100g → warnings DOIT contenir "⚠️ MODÉRATION STRICTE diabète - Contrôler les portions"
`;

    scoringAdjustments += `
- Présence de sucres ajoutés : -30 points (au lieu de -15)
- Sirop glucose-fructose : -50 points (au lieu de -18)
- Index glycémique élevé (farine raffinée) : -15 points
`;
  }

  // 🩺 HYPERTENSION
  if (profile.hypertension) {
    profileInstructions += `
🚨 PROFIL HYPERTENDU DÉTECTÉ - RÈGLES STRICTES :
- Tout produit avec >1.5g de sel/100g reçoit un score ≤ 50/100 (Grade D)
- Tout produit avec >2g de sel/100g reçoit un score ≤ 30/100 (Grade E)
- Glutamate monosodique (E621) = SCORE MAX 20/100 (Grade E)
- Bouillons cubes, sauces industrielles, charcuterie = AUTOMATIQUEMENT Grade D/E
- INTERDICTIONS ABSOLUES : Chips, cacahuètes salées, plats préparés ultra-salés
`;

    criticalRules += `
- Si >2g sel/100g → warnings DOIT contenir "⛔ INTERDIT hypertension - Risque AVC/infarctus"
- Si 1.5-2g sel/100g → warnings DOIT contenir "🚫 DÉCONSEILLÉ hypertension - Pression artérielle affectée"
- Si E621 détecté → warnings DOIT contenir "🚨 GLUTAMATE INTERDIT hypertension"
`;

    scoringAdjustments += `
- Présence de sel >1g/100g : -25 points (au lieu de -10)
- E621 (glutamate) : -60 points (au lieu de -15)
- Bouillons/sauces : -30 points
`;
  }

  // ⚖️ OBÉSITÉ / CONTRÔLE DU POIDS
  if (profile.obesity) {
    profileInstructions += `
🚨 PROFIL OBÉSITÉ/CONTRÔLE DU POIDS DÉTECTÉ - RÈGLES STRICTES :
- Tout produit avec >20g de lipides/100g reçoit un score ≤ 45/100 (Grade D)
- Huile de palme, graisses hydrogénées = SCORE MAX 30/100 (Grade E)
- Produits ultra-transformés (>5 additifs) = SCORE MAX 40/100 (Grade D)
- INTERDICTIONS ABSOLUES : Fast-food, pâtisseries industrielles, sodas sucrés, fritures
`;

    criticalRules += `
- Si >500 kcal/100g → warnings DOIT contenir "⛔ HYPERCALORIQUE - Risque prise de poids"
- Si >25g lipides/100g → warnings DOIT contenir "🚫 TROP GRAS pour contrôle du poids"
- Si huile de palme détectée → warnings DOIT contenir "🚨 GRAISSES SATURÉES - Obésité"
`;

    scoringAdjustments += `
- Produits >400 kcal/100g : -20 points
- Huile de palme : -35 points (au lieu de -12)
- Graisses hydrogénées : -40 points
`;
  }

  // 🌾 ALLERGÈNES
  if (profile.allergens && profile.allergens.length > 0) {
    const allergensList = profile.allergens
      .map((a: string) => {
        const map: Record<string, string> = {
          gluten: "gluten/blé/seigle/orge",
          lactose: "lait/lactose/lactosérum/caséine",
          eggs: "œuf/albumine",
          nuts: "amande/noisette/noix/pistache",
          peanuts: "arachide/cacahuète",
          soy: "soja",
          fish: "poisson/anchois",
          shellfish: "crustacé/crevette",
          sulfites: "sulfite/E220/E221/E222",
        };
        return map[a] || a;
      })
      .join(", ");

    profileInstructions += `
🚨 ALLERGIES DÉTECTÉES : ${allergensList}
- Si UN SEUL des allergènes est présent → SCORE AUTOMATIQUE = 0/100 (Grade E)
- warnings DOIT contenir "⛔ ALLERGÈNE MAJEUR DÉTECTÉ : [nom] - PRODUIT INTERDIT"
- Même traces possibles = INTERDICTION TOTALE
- AUCUNE TOLÉRANCE sur les allergènes
`;

    criticalRules += `
- Détection d'allergène = SCORE FORCÉ à 0/100
- recommendation DOIT être "⛔ PRODUIT STRICTEMENT INTERDIT - Risque allergique mortel"
`;
  }

  // 🌱 RÉGIMES ALIMENTAIRES (INCOMPATIBILITÉS STRICTES)
  if (profile.diet === "vegan") {
    profileInstructions += `
🚨 RÉGIME VEGAN DÉTECTÉ - INCOMPATIBILITÉS ABSOLUES :
- TOUT ingrédient d'origine animale = SCORE 0/100 (Grade E)
- Lait, œufs, miel, gélatine, carmin (E120), cochenille = INTERDITS
- Même si "bio" ou "naturel" → SI ANIMAL = INTERDIT
- warnings DOIT contenir "⛔ NON-VEGAN : Contient [ingrédient animal]"
`;

    criticalRules += `
- Détection lait/œuf/miel/gélatine/E120 → SCORE FORCÉ à 0/100
- recommendation = "⛔ PRODUIT INCOMPATIBLE avec régime vegan"
`;
  }

  if (profile.diet === "vegetarian") {
    profileInstructions += `
🚨 RÉGIME VÉGÉTARIEN DÉTECTÉ - INCOMPATIBILITÉS ABSOLUES :
- Viande, poisson, gélatine (origine animale) = SCORE 0/100 (Grade E)
- Présure animale, anchois, gélatine de porc = INTERDITS
- warnings DOIT contenir "⛔ NON-VÉGÉTARIEN : Contient [viande/poisson]"
`;

    criticalRules += `
- Détection viande/poisson/gélatine → SCORE FORCÉ à 0/100
- recommendation = "⛔ PRODUIT INCOMPATIBLE avec régime végétarien"
`;
  }

  if (profile.diet === "halal") {
    profileInstructions += `
🚨 RÉGIME HALAL DÉTECTÉ - INCOMPATIBILITÉS RELIGIEUSES STRICTES :
- ALCOOL (éthanol, vin, bière, même traces) = SCORE 0/100 (Grade E)
- Porc, gélatine de porc, saindoux = SCORE 0/100 (Grade E)
- E120 (carmin/cochenille) si non certifié = SCORE 0/100
- warnings DOIT contenir "⛔ HARAM : Contient alcool/porc - INTERDIT Islam"
`;

    criticalRules += `
- Détection alcool/éthanol → SCORE FORCÉ à 0/100
- Détection porc/gélatine animale → SCORE FORCÉ à 0/100
- recommendation = "⛔ PRODUIT HARAM - Strictement interdit par l'Islam"
`;
  }

  if (profile.diet === "kosher") {
    profileInstructions += `
🚨 RÉGIME CASHER DÉTECTÉ - INCOMPATIBILITÉS RELIGIEUSES STRICTES :
- Porc, fruits de mer (crevettes, homard) = SCORE 0/100 (Grade E)
- Mélange lait + viande = SCORE 0/100 (Grade E)
- Gélatine non casher = INTERDIT
- warnings DOIT contenir "⛔ NON-CASHER : [raison] - INTERDIT Judaïsme"
`;

    criticalRules += `
- Détection porc/fruits de mer → SCORE FORCÉ à 0/100
- recommendation = "⛔ PRODUIT NON-CASHER - Strictement interdit par le Judaïsme"
`;
  }

  if (profile.diet === "gluten-free") {
    profileInstructions += `
🚨 RÉGIME SANS GLUTEN DÉTECTÉ :
- Blé, seigle, orge, épeautre, kamut = SCORE 0/100 (Grade E)
- Même traces de gluten = INTERDICTION TOTALE
- warnings DOIT contenir "⛔ CONTIENT GLUTEN - INTERDIT maladie cœliaque"
`;

    criticalRules += `
- Détection gluten → SCORE FORCÉ à 0/100
- recommendation = "⛔ PRODUIT AVEC GLUTEN - Risque maladie cœliaque"
`;
  }

  // ⚗️ PRÉFÉRENCES ADDITIFS
  if (profile.avoidAdditives) {
    profileInstructions += `
🚨 ÉVITER LES ADDITIFS DEMANDÉ :
- Tout additif controversé (E621, E951, colorants azoïques) = -25 points chacun
- Plus de 3 additifs au total = SCORE MAX 45/100
`;
  }

  if (profile.avoidPalmOil) {
    profileInstructions += `
🚨 ÉVITER L'HUILE DE PALME DEMANDÉ :
- Huile de palme détectée = -40 points (au lieu de -12)
- SCORE MAX 35/100 si huile de palme présente
`;
  }

 // 🔥 PROMPT FINAL ULTRA-PERSONNALISÉ
  return `Tu es un expert en nutrition certifié (OMS, EFSA, ANSES). Analyse cette étiquette avec RIGUEUR ABSOLUE.

${profileInstructions}

📋 MÉTHODOLOGIE D'ANALYSE STRICTE :

1️⃣ EXTRACTION COMPLÈTE DU TEXTE
- Tu DOIS extraire TOUS les ingrédients visibles sur l'image
- Recopie EXACTEMENT le texte de la liste des ingrédients
- Si l'image est floue ou illisible, écris "Image non lisible - veuillez reprendre une photo nette"
- Le champ "extractedText" DOIT contenir la liste complète des ingrédients séparés par des virgules

2️⃣ SYSTÈME DE NOTATION PERSONNALISÉ (0-100)

${scoringAdjustments}

DÉDUCTIONS STANDARDS (si non surchargées) :
🔴 Additifs controversés (E621, E330, E951) : -8 à -15 points CHACUN
🔴 Huile de palme : -12 points (sauf si éviter demandé)
🔴 Sucres ajoutés >10g/100g : -15 points
🔴 Sel >1.5g/100g : -10 points
🔴 Allergènes : -5 points chacun (sauf si allergie déclarée)

BONUS POSITIFS :
🟢 Bio certifié : +15 points
🟢 Sans additifs : +10 points
🟢 Fibres >5g/100g : +8 points
🟢 Ingrédients naturels : +12 points

3️⃣ RÈGLES CRITIQUES OBLIGATOIRES :

${criticalRules}

4️⃣ CATÉGORISATION DES INGRÉDIENTS

Pour CHAQUE ingrédient détecté :
- name: Nom exact de l'ingrédient
- category: ultra_processed / additive_harmful / allergen_major / sugar_added / fat_saturated / natural / beneficial
- riskLevel: critical / high / medium / low / none
- explanation: Impact santé CONCRET avec références OMS (minimum 20 mots)

5️⃣ GRADING STRICT :
- A (90-100) : EXCELLENT - Recommandé
- B (75-89)  : BON - Consommation modérée OK
- C (50-74)  : MOYEN - Limiter la fréquence
- D (25-49)  : MÉDIOCRE - Déconseillé
- E (0-24)   : MAUVAIS - Interdit ou fortement déconseillé

6️⃣ SUMMARY OBLIGATOIRE - 3 SECTIONS REMPLIES

Tu DOIS absolument remplir ces 3 sections (JAMAIS vides) :

📊 "positives" (MINIMUM 2 points) :
- Exemple : "Contient des ingrédients naturels comme l'eau"
- Exemple : "Absence d'additifs controversés détectés"
- Exemple : "Produit à base d'ingrédients simples"
- Si vraiment RIEN de positif : ["Emballage recyclable (si visible)", "Composition claire et lisible"]

⚠️ "warnings" (MINIMUM 1 point si score < 80) :
- Exemple : "Présence de sucres ajoutés en quantité importante"
- Exemple : "Contient des additifs pouvant être problématiques"
- Si score > 80 et rien à signaler : ["Consommation à intégrer dans une alimentation équilibrée"]

💡 "recommendations" (MINIMUM 2 points) :
- Exemple : "Limiter la consommation à 1-2 fois par semaine"
- Exemple : "Privilégier des alternatives sans additifs"
- Exemple : "Vérifier les portions recommandées sur l'emballage"
- TOUJOURS donner des conseils concrets et actionnables

📤 RÉPONDS UNIQUEMENT EN JSON (sans markdown, sans balises \`\`\`json) :

{
  "extractedText": "Liste COMPLÈTE des ingrédients séparés par virgules (recopie exacte du texte visible)",
  "ingredients": [
    {
      "name": "Nom exact",
      "category": "allergen_major",
      "explanation": "Impact santé précis avec minimum 20 mots",
      "riskLevel": "critical"
    }
  ],
  "score": 65,
  "grade": "C",
  "summary": {
    "positives": [
      "Point positif 1 concret",
      "Point positif 2 concret"
    ],
    "warnings": [
      "Avertissement 1 précis",
      "Avertissement 2 précis"
    ],
    "recommendations": [
      "Recommandation 1 actionnable",
      "Recommandation 2 actionnable"
    ]
  }
}

⚠️ RÈGLES ABSOLUES :
- extractedText NE PEUT PAS être vide ou générique ("Liste complète des ingrédients" est INTERDIT)
- summary.positives DOIT avoir AU MOINS 2 éléments
- summary.warnings DOIT avoir AU MOINS 1 élément si score < 80
- summary.recommendations DOIT avoir AU MOINS 2 éléments
- Allergie déclarée + ingrédient détecté = SCORE FORCÉ à 0/100
- Régime halal + alcool détecté = SCORE FORCÉ à 0/100
- Régime vegan + produit animal = SCORE FORCÉ à 0/100
- Diabète + >15g sucre/100g = SCORE MAX 25/100

🚨 SI L'IMAGE EST FLOUE/ILLISIBLE :
{
  "extractedText": "Image non lisible - Impossible de déchiffrer le texte. Veuillez reprendre une photo nette et bien éclairée.",
  "ingredients": [
    {
      "name": "Texte illisible",
      "category": "other",
      "explanation": "L'image fournie est trop floue ou mal cadrée pour extraire les ingrédients. Assurez-vous que l'étiquette est bien visible, nette et bien éclairée.",
      "riskLevel": "none"
    }
  ],
  "score": 50,
  "grade": "C",
  "summary": {
    "positives": [
      "Aucune analyse possible sans texte lisible"
    ],
    "warnings": [
      "⚠️ Image de mauvaise qualité - Analyse impossible"
    ],
    "recommendations": [
      "Reprenez une photo avec un bon éclairage",
      "Cadrez uniquement la liste des ingrédients",
      "Évitez les reflets et assurez-vous que le texte est net"
    ]
  }
}

Sois IMPLACABLE et EXHAUSTIF. La santé et les convictions des utilisateurs sont SACRÉES.`;
}



export const analyzeImageService = async (base64Image: string, healthProfile? : any) => {
  try {
    // Le Prompt qui fait le travail
   
    const prompt = generatePersonalizedPrompt(healthProfile);
    
     console.log("🤖 Envoi à Mistral AI avec profil personnalisé...");
    console.log("👤 Profil utilisateur:", JSON.stringify(healthProfile, null, 2));


    const chatResponse = await client.chat.complete({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", imageUrl: base64Image },
          ],
        },
      ],
      responseFormat: { type: "json_object" }, // Pour forcer la réponse en JSON
      temperature: 0.2, // - de créativité pour plus de précision
    });

    //Parse la réponse JSON
    const rawContent = chatResponse.choices![0].message.content;
    console.log("📦 Réponse brute de Mistral:", rawContent);

    if (!rawContent) {
      throw new Error("Réponse vide de l'IA");
    }
    let parsed: any;

    if (typeof rawContent === "string") {
      //Nettoie les éventuels backticks ou texte superflu
      const cleanedContent = rawContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      console.log("🧹 Contenu nettoyé:", cleanedContent);
      parsed = JSON.parse(cleanedContent);
    } else {
      parsed = rawContent;
    }
    console.log("✅ JSON parsé:", JSON.stringify(parsed, null, 2));

    // Vérifier que les données essentielles sont présentes
    if (!parsed.ingredients || parsed.ingredients.length === 0) {
      console.warn(
        "⚠️ Aucun ingrédient trouvé, création de données par défaut",
      );
      parsed.ingredients = [
        {
          name: "Ingrédients non détectés",
          category: "other",
          explanation:
            "L'IA n'a pas pu extraire les ingrédients de l'image. Vérifiez que l'étiquette est lisible.",
          riskLevel: "none",
        },
      ];
    }

    // 1. ExtractedText
    if (!parsed.extractedText || 
        parsed.extractedText === "" || 
        parsed.extractedText === "Liste complète des ingrédients" ||
        parsed.extractedText.length < 10) {
      console.warn("⚠️ ExtractedText vide ou invalide");
      parsed.extractedText = "Texte non extrait - L'IA n'a pas pu lire le texte sur l'image. Vérifiez que l'étiquette est bien visible et nette.";
    }

    // 2. Ingredients
    if (!parsed.ingredients || parsed.ingredients.length === 0) {
      console.warn("⚠️ Aucun ingrédient trouvé");
      parsed.ingredients = [
        {
          name: "Ingrédients non détectés",
          category: "other",
          explanation: "L'IA n'a pas pu extraire les ingrédients de l'image. Assurez-vous que la photo est nette, bien éclairée et que la liste des ingrédients est clairement visible.",
          riskLevel: "none",
        },
      ];
    }

    // 3. Score et Grade
    if (typeof parsed.score !== "number" || parsed.score < 0 || parsed.score > 100) {
      console.warn("⚠️ Score invalide:", parsed.score);
      parsed.score = 50;
    }

    if (!parsed.grade || !["A", "B", "C", "D", "E"].includes(parsed.grade)) {
      console.warn("⚠️ Grade invalide:", parsed.grade);
      parsed.grade = "C";
    }

    // 4. Summary - CORRECTION CRITIQUE
    if (!parsed.summary || typeof parsed.summary !== 'object') {
      console.warn("⚠️ Summary manquant ou invalide");
      parsed.summary = {
        positives: ["Analyse effectuée avec succès"],
        warnings: ["Impossible d'extraire des détails précis - Image de mauvaise qualité"],
        recommendations: [
          "Reprenez une photo plus nette de l'étiquette",
          "Assurez-vous d'un bon éclairage sans reflets"
        ],
      };
    }

    // 5. Validation des 3 tableaux du summary
    if (!Array.isArray(parsed.summary.positives) || parsed.summary.positives.length === 0) {
      console.warn("⚠️ summary.positives vide ou invalide");
      parsed.summary.positives = [
        "Aucun point positif identifié suite à l'analyse",
        "Produit analysable mais nécessite une meilleure image pour plus de détails"
      ];
    }

    if (!Array.isArray(parsed.summary.warnings) || parsed.summary.warnings.length === 0) {
      console.warn("⚠️ summary.warnings vide ou invalide");
      if (parsed.score < 80) {
        parsed.summary.warnings = [
          "Score nutritionnel inférieur à 80/100",
          "Présence probable d'ingrédients à consommer avec modération"
        ];
      } else {
        parsed.summary.warnings = [
          "Produit acceptable mais toujours à consommer dans le cadre d'une alimentation équilibrée"
        ];
      }
    }

    if (!Array.isArray(parsed.summary.recommendations) || parsed.summary.recommendations.length === 0) {
      console.warn("⚠️ summary.recommendations vide ou invalide");
      parsed.summary.recommendations = [
        "Respectez les portions recommandées sur l'emballage",
        "Intégrez ce produit dans une alimentation variée et équilibrée",
        "Consultez un professionnel de santé pour des conseils personnalisés"
      ];
    }

    // Transformer au format attendu
    const result = {
      success: true,
      extractedText: parsed.extractedText || "Texte non disponible",
      analysis: {
        ingredients: parsed.ingredients.map((ing: any) => ({
          name: ing.name || "Inconnu",
          category: ing.category || "other",
          explanation: ing.explanation || "Pas d'explication disponible",
          riskLevel: ing.riskLevel || "none",
        })),
        score: typeof parsed.score === "number" ? parsed.score : 50,
        grade: parsed.grade || "C",
        summary: {
          positives: parsed.summary.positives || [],
                 warnings: parsed.summary.warnings || [],
                 recommendations: parsed.summary.recommendations || [],
        },
        // ✅ AJOUTER les nouvelles propriétés pour les alertes personnalisées
        personalizedWarnings: parsed.summary.warnings || [],
        suitabilityScore: parsed.score || 50,
        profileRecommendation: parsed.summary.recommendations?.join(" ") || "",
      },
    };

    console.log("📤 Réponse finale envoyée:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("❌ Erreur Mistral Service:", error);

    if (error instanceof SyntaxError) {
      console.error("❌ Erreur de parsing JSON");
    }

    throw new Error("L'analyse IA a échoué. Vérifiez l'image ou la clé API.");
  }
};
