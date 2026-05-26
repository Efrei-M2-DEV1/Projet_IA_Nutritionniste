# Nutritionniste IA — Plan projet (Sujet 1)

**Module IA & Deep Learning · Groupe de 5 · EFREI**

| | |
|---|---|
| **Dépôt de base** | https://github.com/Efrei-M2-DEV1/Projet_IA_Nutritionniste |
| **Accord encadrant** | Réutilisation du projet existant autorisée |
| **Durée indicative** | 4 à 5 semaines |

---

## 1. Contexte

### Projet d’origine (à ne plus livrer tel quel)

- Analyse d’**étiquettes** produits (OCR ingrédients)
- Stack : Node.js / Express + Mistral Pixtral
- Logique type Yuka / Nutri-Score

### Projet cible (sujet 1 — rendu final)

**Analyseur de repas par photo**

1. L’utilisateur photographie ou importe une **assiette**
2. Un modèle de **vision** identifie les aliments
3. Un **LLM ou service dédié** estime calories / macros et produit des **conseils personnalisés**
4. L’interface affiche photo, aliments, tableau nutritionnel et recommandations

---

## 2. Contraintes du module

| Exigence | Détail |
|----------|--------|
| Backend | **Python + FastAPI** (obligatoire) |
| Frontend | **React** dans `client/` (réutilisation + adaptation) |
| IA | **2 étapes** : vision puis nutrition / conseils |
| Provider IA | **Libre** — Mistral non obligatoire |
| Livrables | Code GitHub, README, slides, Docker (bonus) |

### Ce qu’on conserve du repo existant

- Capture photo : `ImageUpload`
- Profil santé : `HealthProfileSetup`
- Historique, gestion loading / erreurs, Tailwind

### Ce qu’on remplace

- Dossier `server/` (Node.js)
- Logique étiquettes / ingrédients / Nutri-Score
- Dépendance exclusive à Mistral

---

## 3. Objectif fonctionnel

- [ ] Upload ou prise de photo d’une assiette
- [ ] Détection des aliments (vision)
- [ ] Estimation : calories, protéines, glucides, lipides
- [ ] Conseils adaptés au profil santé (allergies, diabète, etc.)
- [ ] Affichage : photo + aliments + tableau + conseils
- [ ] *(Bonus)* Journal du jour, curseur de portion ou objectifs kcal

---

## 4. Architecture

```
┌─────────────┐     POST /api/analyze      ┌──────────────────┐
│   Client    │  (image + healthProfile)   │  FastAPI         │
│   React     │ ─────────────────────────► │  backend/        │
└─────────────┘                            └────────┬─────────┘
                                                    │
                         ┌──────────────────────────┼──────────────────────────┐
                         ▼                          ▼                          │
                  vision.py                  nutrition.py                       │
            (classification)            (macros + conseils)                     │
                         └──────────────────────────┬──────────────────────────┘
                                                    ▼
                                            JSON → Client
```

### Structure du dépôt (cible)

```
Projet_IA_Nutritionniste/
├── client/                    # Frontend React (adapté)
├── backend/                   # NOUVEAU — remplace server/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/analyze.py
│   │   ├── services/vision.py
│   │   ├── services/nutrition.py
│   │   └── models/schemas.py
│   ├── requirements.txt
│   └── .env.example
├── docker-compose.yml
├── README.md
└── docs/
    ├── PLAN_PROJET_EQUIPE.md   # Ce document
    └── ARCHITECTURE.md         # Schémas soutenance
```

> `server/` (Node) : supprimer ou archiver sur une branche `legacy-node`.

---

## 5. Contrat API (à valider en Semaine 1)

**Responsables : Personne 1 (Backend) + Personne 4 (Frontend)**

### Requête

```
POST /api/analyze
Content-Type: multipart/form-data

• image          (fichier, obligatoire)
• healthProfile  (JSON string, optionnel)
```

### Réponse (200)

```json
{
  "success": true,
  "foods": [
    {
      "name": "poulet grillé",
      "confidence": 0.87,
      "portion_estimate": "moyenne"
    }
  ],
  "nutrition": {
    "calories_kcal": 520,
    "protein_g": 35,
    "carbs_g": 40,
    "fat_g": 18,
    "fiber_g": 5
  },
  "advice": "Texte de conseils personnalisés...",
  "warnings": ["Allergie gluten détectée"],
  "imageUrl": null
}
```

---

## 6. Choix de la stack IA (décision groupe)

| Option | Vision | Nutrition & conseils | Clés API |
|:------:|--------|----------------------|----------|
| **A** *(recommandée)* | Hugging Face / PyTorch | LLM au choix | 0 à 1 clé LLM |
| **B** | GPT-4o / Gemini Vision | Même ou 2ᵉ appel LLM | 1 clé |
| **C** | HF local | Tables + templates | Token HF optionnel |

**À préparer pour la soutenance :** pourquoi ce choix, limites (estimation ≠ diagnostic médical).

---

## 7. Répartition des rôles

### Vue d’ensemble — qui touche quels fichiers

| Rôle | Dossier / fichiers | Conflits Git |
|------|-------------------|--------------|
| P1 Backend | `backend/app/main.py`, `routes/` | Faible |
| P2 Vision | `backend/app/services/vision.py` | Faible |
| P3 Nutrition | `backend/app/services/nutrition.py` | Faible |
| P4 Frontend | `client/src/` | Faible |
| P5 DevOps | Racine, `docs/`, Docker | Faible |

---

### Personne 1 — Lead Backend (FastAPI)

**Mission :** Créer `backend/` et remplacer `server/`.

| Tâche | Statut |
|-------|--------|
| Initialiser FastAPI, CORS, upload fichier | ☐ |
| Route `POST /api/analyze` + validations | ☐ |
| Orchestrer vision → nutrition | ☐ |
| Erreurs HTTP (400, 413, 500) + logs | ☐ |
| `requirements.txt`, `.env.example` | ☐ |
| Réception du `healthProfile` client | ☐ |

**Livrable :** API avec mock JSON, puis services réels branchés.

**À éviter :** Porter `mistralService.ts` tel quel (logique étiquettes).

---

### Personne 2 — Vision / Deep Learning

**Mission :** `backend/app/services/vision.py`

| Tâche | Statut |
|-------|--------|
| Choisir un modèle (ex. food classification HF) | ☐ |
| Pipeline : image → inférence → top-k aliments | ☐ |
| Labels en français (`labels_fr.json`) | ☐ |
| Cas limites : rien détecté, faible confiance | ☐ |
| Documentation dataset / métriques / limites | ☐ |
| *(Optionnel)* `scripts/test_vision.py` | ☐ |

**Livrable :** `detect_foods(image_bytes) → list[FoodItem]`

**Soutenance :** transfer learning, choix du modèle.

---

### Personne 3 — Nutrition & LLM

**Mission :** `backend/app/services/nutrition.py`

| Tâche | Statut |
|-------|--------|
| Aliments + profil → JSON macros + conseils | ☐ |
| Prompt structuré (sortie JSON) si LLM | ☐ |
| Règles : allergies, diabète, régimes | ☐ |
| Clés API uniquement côté serveur | ☐ |
| Fallback si service indisponible | ☐ |

**Livrable :** `estimate_nutrition(foods, profile) → NutritionResult`

**Soutenance :** rôle du LLM, fiabilité, biais.

---

### Personne 4 — Frontend React

**Mission :** Adapter `client/` au flux « repas »

| Tâche | Statut |
|-------|--------|
| Textes : « Photographiez votre assiette » | ☐ |
| `api.ts` → FastAPI (`VITE_API_URL=8000`) | ☐ |
| `AnalysisResults.tsx` : macros, aliments, conseils | ☐ |
| `types/index.ts` aligné sur le contrat API | ☐ |
| Loading, erreurs réseau | ☐ |
| Conserver upload, profil, historique | ☐ |
| Captures d’écran pour la soutenance | ☐ |

**Livrable :** Parcours complet upload → résultat.

---

### Personne 5 — DevOps & Documentation

**Mission :** Industrialisation et soutenance

| Tâche | Statut |
|-------|--------|
| `docker-compose.yml` (backend + client) | ☑ |
| Dockerfiles | ☑ |
| README complet (install, archi, limites) | ☑ |
| `docs/ARCHITECTURE.md` + schéma Mermaid | ☑ |
| `.gitignore` (`.env`, cache Python, modèles) | ☑ |
| Plan slides (5 × ~3 min) | ☑ |
| FAQ technique pour les questions | ☑ |

**Livrable :** `docker compose up` fonctionnel + README noté.

---

## 8. Planning (4–5 semaines)

| Semaine | Objectif | Critère de fin |
|:-------:|----------|----------------|
| **S1** | Setup, contrat API, backend mock | `curl` / Postman → JSON mock |
| **S2** | Vision + front branchés | Aliments affichés à l’écran |
| **S3** | Nutrition + profil santé | Macros et conseils réels |
| **S4** | Docker, README, polish | Démo locale complète |
| **S5** | Slides + répétition | Chacun maîtrise sa partie |

### Ordre d’intégration

1. **P1** — FastAPI + mock  
2. **P4** — Front sur le mock  
3. **P2** — Vision (remplace mock `foods`)  
4. **P3** — Nutrition (remplace mock `nutrition` / `advice`)  
5. **P5** — Docker + README  
6. **Tous** — Tests bout en bout  

**Rituel :** point quotidien 15 min (blocages, changements API).

---

## 9. Git — règles d’équipe

```
main     → stable (démo uniquement)
dev      → intégration
feat/*   → une branche par fonctionnalité
```

| Règle | |
|-------|---|
| Pas de push direct sur `main` | |
| PR vers `dev` + 1 relecture | |
| `git pull origin dev` avant de coder | |
| Pas de clés API dans le repo | |
| 1 PR significative minimum par personne | |

**Exemple de commit :** `feat(backend): add analyze route`

---

## 10. Soutenance (15–20 min)

| Intervenant | Contenu (~3 min) |
|-------------|------------------|
| **P1** | Problématique, architecture, flux de données |
| **P2** | Modèle vision : choix, données, performances, limites |
| **P3** | Nutrition / LLM : prompt, profil santé, fiabilité |
| **P4** | Démo interface, points UX |
| **P5** | Docker, README, évolutions, cas d’usage |

### Questions à anticiper

- Pourquoi deux modèles (vision + LLM) ?
- Pourquoi pas Mistral / pourquoi ce provider ?
- Que se passe-t-il si la photo est floue ?
- Où sont stockées les images ? Sécurité des clés API ?

---

## 11. Phase 0 — Jour 1 (tout le monde)

```bash
git clone https://github.com/Efrei-M2-DEV1/Projet_IA_Nutritionniste.git
cd Projet_IA_Nutritionniste
```

**Remote groupe (recommandé) :**

```bash
git remote rename origin upstream
git remote add origin https://github.com/VOTRE_ORG/VOTRE_REPO.git
git push -u origin main
```

**Installation (exploration de l’existant) :**

```bash
npm install
cd client && npm install && cd ..
```

> `server/.env` : uniquement pour tester l’ancienne version — **non requis** pour le rendu final.

**Réunion de lancement (30 min) :**

- [ ] Valider le contrat API (section 5)
- [ ] Choisir l’option IA (section 6)
- [ ] Attribuer P1 à P5
- [ ] Fixer date de démo et répartition orale

---

## 12. Checklist finale

- [ ] Front + back Python lancés (`docker compose up` ou équivalent)
- [ ] Analyse d’une **photo de repas** (pas d’étiquette) de bout en bout
- [ ] README : installation, configuration, architecture, limites
- [ ] Deux briques IA identifiables en présentation
- [ ] Slides + captures de secours
- [ ] Les 5 membres peuvent expliquer **leur** code

---

## 13. Prompt Cursor (par membre)

Copier-coller en adaptant le rôle :

```
Tu travailles sur le projet Nutritionniste IA — Sujet 1 (analyse de repas par photo).

• Repo : fork de Efrei-M2-DEV1/Projet_IA_Nutritionniste
• Réutiliser client/ (React), remplacer server/ par backend/ (FastAPI)
• Pipeline : vision (aliments) → nutrition + conseils (LLM ou service)
• Mistral non obligatoire
• Uniquement des assiettes / repas — pas d’OCR d’étiquettes
• Contrat API : POST /api/analyze → { foods, nutrition, advice, warnings }

Mon rôle : [P1 Backend / P2 Vision / P3 Nutrition / P4 Frontend / P5 DevOps]

Code propre, gestion d’erreurs, pas de secrets dans le dépôt. Documentation en français.
```

---

*Document généré pour le groupe — à mettre à jour au fil du projet.*
