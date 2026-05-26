import { Request, RequestHandler, Response } from "express";
import fs from "fs";
import { analyzeImageService } from "../services/mistralService";

export const analyzeFoodImage: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("📥 Requête d'analyse reçue");
    console.log("📎 Fichiers joints:", req.file ? "Oui" : "Non");
    //1. Validation : Fichier reçu ?
    if (!req.file) {
      console.error("❌ Aucun fichier image fourni");
      res.status(400).json({
        success: false,
        error: "Aucune image fournie",
      });
      return;
    }

    // ✅ Récupérer le profil santé depuis le body (envoyé par le client)
    const healthProfile = req.body.healthProfile
      ? JSON.parse(req.body.healthProfile)
      : null;

    console.log("📸 Image reçue:", req.file.originalname);
    console.log("👤 Profil santé reçu:", healthProfile);

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    //3.Appel du service d'analyse
    console.log("🔍 Analyse en cours pour :", req.file.originalname);
    const analyzeResult = await analyzeImageService(base64Image, healthProfile);
    console.log("✅ Analyse terminée");
    console.log("📊 Résultat:", {
      textLength: analyzeResult.extractedText.length,
      ingredientsCount: analyzeResult.analysis.ingredients.length,
      score: analyzeResult.analysis.score,
      grade: analyzeResult.analysis.grade,
    });
 
    //5. Réponse au client
    console.log("📤 Envoi de la réponse au client");
    res.status(200).json(analyzeResult);
  } catch (error) {
    console.error("Erreur dans analyzeController:", error);
    // Si le fichier temporaire existe, le supprimer
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};

export const analyzeTextIngredients: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({
        success: false,
        error: "Texte d'ingrédients requis",
      });
      return;
    }

    console.log("Analyse de texte:", text.substring(0, 100));

    // Pour le texte, on pourrait aussi personnaliser mais on garde simple ici
    const analysis = {
      ingredients: [],
      score: 50,
      summary:"Analyse de texte non implémentée"
      };
    

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Erreur analyse texte:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    });
  }
};
