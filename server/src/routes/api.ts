import { Router } from "express";
import multer from "multer";
import { analyzeFoodImage, analyzeTextIngredients } from "../controllers/analyzeController";

const router = Router();

// Config de multer (upload de fichiers temporaire dans le dossier 'uploads/')
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5MB
}); 
 

// L'utilisateur envoie une image sur 'http://.../api/analyze'
// 'image' est le nom du champ dans le formulaire
router.post("/analyze", upload.single("image"), analyzeFoodImage);
router.post("/analyze-text", analyzeTextIngredients); // Placeholder for text analysis

export default router;
