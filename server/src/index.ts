import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import path from "path/win32";
import apiRoutes from "./routes/api";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Creation du dossier 'uploads' s'il n'existe pas
// if (!fs.existsSync("uploads")) {
//   fs.mkdirSync("uploads");
// }
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

// Creation du dossier 'uploads' s'il n'existe pas
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

//Routes API
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("Bienvenue sur l'Appli Ingre-Scan!");
});
// Fonction pour démarrer le serveur (utilisable en prod ou en tests)
export function startServer(port: number | string = PORT) {
  const server = app.listen(port, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${port}`);
    console.log(`🔑 Modèle IA actif : ${process.env.MISTRAL_MODEL}`);
  });
  return server;
}

// Démarre le serveur uniquement si ce fichier est exécuté directement
if (require.main === module) {
  startServer();
}

export default app;

// app.listen(PORT, () => {
//   console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
//   console.log(`🔑 Modele IA actif : ${process.env.MISTRAL_MODEL}`);
// });
