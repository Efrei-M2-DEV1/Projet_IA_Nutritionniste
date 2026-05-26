# Client React — Nutritionniste IA

Interface web pour analyser une photo de repas.

## Role

- Import ou capture d'une photo d'assiette.
- Envoi de l'image et du profil sante a `POST /api/analyze`.
- Affichage des aliments detectes, calories, macros, conseils et alertes.
- Historique local dans le navigateur.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS

## Installation locale

```bash
npm install
npm run dev
```

Le serveur Vite ecoute sur `http://localhost:5173` et proxifie :

- `/api` vers `http://localhost:8000`
- `/health` vers `http://localhost:8000`

Le backend FastAPI doit donc etre lance sur le port `8000`.

## HTTPS local pour camera mobile

```bash
npm run dev:https
```

Cette commande utilise `vite.config.https.ts` et conserve le proxy vers le backend.

## Build

```bash
npm run build
```

En Docker, le build est servi par Nginx. Le fichier `client/nginx.conf` proxifie `/api` et `/health` vers le service Docker `backend:8000`.

## Configuration

En developpement local, laisser `VITE_API_URL` vide pour utiliser le proxy Vite.

Pour un deploiement sans proxy, definir l'URL du backend au build :

```env
VITE_API_URL=https://api.example.com
```

Voir aussi `client/.env.example`.
