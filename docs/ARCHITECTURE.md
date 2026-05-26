# Architecture — Nutritionniste IA

## Objectif

La version livrable analyse une photo de repas, pas une etiquette produit. Le pipeline est volontairement separe en deux briques IA :

1. Vision : detection/classification d'aliments depuis l'image.
2. Nutrition : estimation calories/macros et conseils adaptes au profil sante.

Cette separation permet d'expliquer clairement le role de chaque composant pendant la soutenance.

## Vue systeme

```mermaid
flowchart TB
  subgraph Browser["Navigateur"]
    UI["React / Vite\nImageUpload, profil sante, resultats"]
    STORE["localStorage\nprofil + historique"]
  end

  subgraph Backend["FastAPI backend"]
    API["POST /api/analyze\nvalidation image + profil"]
    VISION["services/vision.py\nFood-101 ViT"]
    LABELS["labels_fr.json\nnormalisation labels"]
    NUTRI["services/nutrition.py\ntable locale + LLM optionnel"]
    SCHEMAS["models/schemas.py\ncontrat Pydantic"]
  end

  subgraph External["Services externes optionnels"]
    HF["Hugging Face\ntelechargement modele"]
    LLM["Mistral ou OpenAI\nconseils JSON"]
  end

  UI --> STORE
  UI -->|"multipart/form-data\nimage + healthProfile"| API
  API --> VISION
  VISION --> LABELS
  VISION -. premier lancement .-> HF
  API --> NUTRI
  NUTRI -. si cle configuree .-> LLM
  NUTRI --> SCHEMAS
  SCHEMAS --> API
  API -->|"foods, nutrition, advice, warnings"| UI
```

## Sequence d'analyse

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant C as Client React
  participant A as FastAPI
  participant V as Vision
  participant N as Nutrition
  participant L as LLM optionnel

  U->>C: Selectionne ou prend une photo
  C->>C: Charge le profil sante local
  C->>A: POST /api/analyze
  A->>A: Verifie MIME, taille, JSON profil
  A->>V: detect_foods(image_bytes)
  V-->>A: Liste aliments + confiance
  A->>N: estimate_nutrition(foods, profile)
  alt Cle LLM disponible
    N->>L: Prompt JSON structure
    L-->>N: Nutrition + conseils
  else Pas de cle ou erreur provider
    N-->>N: Fallback table nutritionnelle
  end
  N-->>A: Nutrition + conseils + alertes
  A-->>C: JSON conforme au contrat
  C-->>U: Affiche aliments, macros, conseils
```

## Ports

| Contexte | Frontend | Backend | Notes |
|---|---:|---:|---|
| Docker Compose | `localhost:5173` | `localhost:8000` | Nginx proxifie `/api` vers `backend:8000` |
| Local Vite | `localhost:5173` | `localhost:8000` | Vite proxifie `/api` et `/health` |
| HTTPS local | `https://localhost:5173` | `localhost:8000` | utile pour camera mobile |

## Contrat API

### Requete

```http
POST /api/analyze
Content-Type: multipart/form-data
```

| Champ | Format | Validation |
|---|---|---|
| `image` | JPEG, PNG ou WebP | obligatoire, max 5 Mo |
| `healthProfile` | JSON string | optionnel, `{}` si absent ou invalide |

### Reponse

```json
{
  "success": true,
  "foods": [
    {
      "name": "riz",
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
  "advice": "Conseils personnalises...",
  "warnings": [],
  "imageUrl": null,
  "vision_mode": "food101-hf"
}
```

## Backend

### `app/main.py`

- Initialise FastAPI.
- Configure CORS via `ALLOWED_ORIGINS`.
- Expose `/health`.
- Monte les routes sous `/api`.

### `app/routes/analyze.py`

- Recoit l'image en `multipart/form-data`.
- Refuse les formats non image.
- Limite la taille a 5 Mo.
- Parse le profil sante.
- Orchestre vision puis nutrition.

### `app/services/vision.py`

- Utilise `vishnudas08/food101-vit-model`.
- Retourne un top-k d'aliments avec score de confiance.
- Normalise certains labels anglais vers des labels francais.
- Retourne un fallback `assiette` si le modele n'est pas charge.

### `app/services/nutrition.py`

- Calcule un fallback par table nutritionnelle locale.
- Genere des alertes deterministes selon allergies, diabete, regimes.
- Peut appeler Mistral ou OpenAI si les variables d'environnement sont presentes.
- Force une sortie structuree et revient au fallback en cas d'erreur provider.

## Frontend

Le frontend conserve les briques utiles de l'ancien projet :

- `ImageUpload` pour camera/import.
- `HealthProfileSetup` pour le profil sante.
- `AnalysisResults` pour aliments, macros, conseils et alertes.
- `History` pour l'historique local.

`client/src/services/api.ts` envoie l'image et le profil a `/api/analyze`. En local et en Docker, l'URL reste relative pour passer par le proxy Vite/Nginx.

## Docker

```mermaid
flowchart LR
  subgraph Compose["docker compose"]
    C["client\nNginx + build Vite\nport 5173"]
    B["backend\nUvicorn + FastAPI\nport 8000"]
    M["model-cache\nHF/Torch"]
  end

  C -->|/api, /health| B
  B --> M
```

Fichiers :

- `docker-compose.yml`
- `backend/Dockerfile`
- `client/Dockerfile`
- `client/nginx.conf`
- `.env.example`

## Securite

- Les cles API ne sont jamais envoyees au frontend.
- `.env`, `.env.local` et variantes sont ignores.
- Les images ne sont pas persistees par l'API.
- CORS est limite aux origines locales utiles pour le developpement et Docker.

## Limites techniques

- Food-101 contient 101 classes : les plats hors vocabulaire peuvent etre approximes.
- Le projet ne fait pas de segmentation d'assiette ni d'estimation volumetrique precise.
- Les portions sont simplifiees avec `portion_estimate`.
- Les conseils ne constituent pas un diagnostic medical.
- Le premier lancement avec modele HF peut etre lent car il telecharge les poids.

## Verification locale

```bash
docker compose up --build
```

Puis ouvrir :

- http://localhost:5173
- http://localhost:8000/docs

Sans Docker :

```bash
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

cd client
npm run dev
```

Tests backend :

```bash
cd backend
pytest tests -v
```
