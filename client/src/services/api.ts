import type { ApiResponse } from "../types";
import { loadHealthProfile } from "./healthProfile";

// FastAPI tourne sur le port 8000 par défaut
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeImage(imageFile: File): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const healthProfile = loadHealthProfile();
  formData.append("healthProfile", JSON.stringify(healthProfile));

  try {
    console.log("📤 Envoi de l'image avec profil santé:", healthProfile.name);

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      body: formData,
    });
    console.log("📥 Réponse du serveur:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Erreur serveur:", errorData);
      throw new Error(
        `Erreur HTTP: ${response.status} - ${errorData.detail || errorData.error || "Erreur inconnue"}`,
      );
    }

    const data: ApiResponse = await response.json();
    console.log("✅ Données reçues:", data);

    if (!data.success) {
      throw new Error("Analyse échouée côté serveur");
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Impossible de se connecter au serveur. Vérifiez que le backend Python est démarré sur ${API_BASE_URL}`,
      );
    }
    throw error;
  }
}
  export async function analyzeTextIngredients(ingredientsText: string): Promise<
  {
    ingredients: Array<{
      name: string;
      category: string;
      explanation: string;
      riskLevel: string;
    }>;
    score: number;
    summary: string;
  
  }> {
    const response = await fetch(`${API_BASE_URL}/api/analyze-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: ingredientsText }),
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    return response.json();
  }
  



    // Créer un résultat avec un ID unique
    // const result: AnalysisResult = {
    //   id: Date.now().toString(),
    //   timestamp: Date.now(),
    //   extractedText: data.extractedText,
    //   ingredients: data.analysis.ingredients,
    //   score: data.analysis.score,
    //   grade: data.analysis.grade,
    //   summary: data.analysis.summary,
    // };
    // ⭐ PERSONNALISATION : Ajouter l'analyse du profil
//     if (hasActiveProfile()) {
//       const profile = loadHealthProfile();
//       const compatibility = analyzeProductCompatibility(
//         data.extractedText || "",
//         data.analysis.ingredients,
//         profile,
//       );

//       // Enrichir la réponse avec les données personnalisées
//       data.analysis.personalizedWarnings = compatibility.warnings;
//       data.analysis.suitabilityScore = compatibility.suitabilityScore;
//       data.analysis.profileRecommendation = compatibility.recommendation;
//     }
//     return data;
//   } catch (error) {
//     console.error("Erreur lors de l'analyse:", error);

//     if (error instanceof TypeError && error.message.includes("fetch")) {
//       throw new Error(
//         "Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur " +
//           API_BASE_URL,
//       );
//     }

//     throw error;
//   }
// };

// // Fonction pour générer une URL de prévisualisation d'image
// export const createImagePreview = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       if (e.target?.result) {
//         resolve(e.target.result as string);
//       } else {
//         reject(new Error("Impossible de lire le fichier"));
//       }
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// };
