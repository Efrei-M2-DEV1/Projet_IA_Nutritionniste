# 🍎 Analyseur d'Ingrédients

> **Projet Web IA - Master 2**  
> Une application intelligente pour analyser les ingrédients de vos produits alimentaires en temps réel

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Status](https://img.shields.io/badge/status-en%20développement-yellow)
![Team](https://img.shields.io/badge/équipe-4%20personnes-blue)

---

## 📋 Table des matières

- [🎯 Le Projet](#-le-projet)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [⚙️ Configuration](#️-configuration)
- [🛠️ Technologies](#️-technologies)
- [👥 Équipe](#-équipe)

---

## 🎯 Le Projet

### 🌟 Notre Mission

Dans un monde où la transparence alimentaire devient cruciale, **Analyseur d'Ingrédients** se positionne comme votre allié santé du quotidien. Notre objectif ? Démocratiser l'accès à l'information nutritionnelle en rendant la lecture des étiquettes aussi simple qu'une photo !

### 💡 Pourquoi ce projet ?

- 🏥 **Santé publique** : Aider les consommateurs à faire des choix éclairés
- 🔬 **IA au service du bien-être** : Exploiter Mistral AI pour une analyse précise
- 📱 **Accessibilité** : Une app web responsive compatible desktop et mobile
- 🎓 **Apprentissage** : Projet académique Master 2 - Web & IA

### ✅ Version actuelle du rendu

La version livrable du sujet 1 n'analyse plus des étiquettes produits. Elle traite une **photo d'assiette**, détecte des aliments courants côté backend FastAPI, puis renvoie des calories/macros et des conseils personnalisés côté frontend React.

- Backend vision actuel: `Food-101` finement ajusté via Hugging Face (`vishnudas08/food101-vit-model`)
- Réponse API: `foods`, `nutrition`, `advice`, `warnings`, `vision_mode`
- Limite à annoncer: l'estimation reste approximative et ne constitue pas un avis médical
- Détails techniques: voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### 📚 Modèle Vision — résumé pour la soutenance

- Dataset: Food-101
- Classes: 101 catégories de plats
- Taille annoncée: 75 000 images d'entraînement
- Métrique annoncée: environ 90% de validation accuracy
- Limite clé: un plat hors Food-101 ou très ambigu peut encore être mal classé

### 🎯 Nos Ambitions

- ✅ Analyse instantanée des ingrédients via OCR et IA
- ✅ Notation rigoureuse inspirée de Yuka et du Nutri-Score
- ✅ Détection des allergènes et additifs controversés
- ✅ Recommandations personnalisées basées sur l'OMS
- ✅ **Profils de santé personnalisés** : Notation adaptée selon votre profil
- ✅ Historique des analyses et favoris
- 🚧 Mode hors ligne avec Progressive Web App (PWA)
- 🚧 Comparaison de produits similaires

---

## ✨ Fonctionnalités

### 🎥 Capture d'Image Multi-Plateforme

- **📸 Webcam en direct** : Capturez des étiquettes sur desktop avec votre webcam
- **📱 Caméra mobile** : Utilisez l'appareil photo de votre smartphone (iOS/Android)
- **🖼️ Import depuis galerie** : Sélectionnez des photos existantes
- **🖱️ Drag & Drop** : Glissez-déposez vos images (desktop)

### 🧠 Analyse Intelligente par IA

- **🔍 OCR Puissant** : Extraction de texte via Mistral AI (Pixtral)
- **🏷️ Catégorisation** : Classification automatique des ingrédients
  - Additifs controversés (E621, colorants, etc.)
  - Allergènes majeurs (gluten, lactose, fruits à coque)
  - Sucres ajoutés et édulcorants
  - Ultra-transformés (sirop glucose-fructose, maltodextrine)
  - Ingrédients naturels et bénéfiques

### 📊 Notation Personnalisée et Intelligente

- **Score sur 100 adapté à VOTRE profil** : Un même produit peut avoir des scores différents !
  - 👤 **Profil standard** : Évaluation nutritionnelle générale
  - 🩺 **Profil diabétique** : Pénalités sévères sur les sucres (>10g = Grade D/E)
  - 💉 **Profil hypertendu** : Attention au sel et glutamate (>1.5g = Grade D)
  - ⚖️ **Profil obésité** : Focus sur les calories et graisses (>400 kcal = -20 points)
  - 🌾 **Allergies** : Score forcé à 0/100 si allergène détecté
  - 🌱 **Régimes** : Vegan, végétarien, halal, casher, sans gluten
- **Grades A-E dynamiques** : Système inspiré du Nutri-Score mais personnalisé
  - 🟢 **A (90-100)** : EXCELLENT - Produit sain recommandé pour VOUS
  - 🟢 **B (75-89)** : BON - Qualité correcte selon votre profil
  - 🟡 **C (50-74)** : MOYEN - Consommation modérée
  - � Profils de Santé Personnalisés

- **🩺 Conditions médicales** :
  - Diabète (Type 1 & 2) : Détection stricte des sucres et index glycémique
  - Hypertension : Contrôle du sel et glutamate (E621)
  - Obésité/Contrôle du poids : Focus calories et graisses saturées

- **🌾 Allergènes majeurs** (9 catégories) :
  - Gluten, lactose, œufs, fruits à coque
  - Arachides, soja, poisson, crustacés, sulfites
  - **Score automatique 0/100** si allergène détecté ⛔

- **🍃 Régimes alimentaires** :
  - **Vegan** : Exclusion totale ingrédients animaux (lait, œufs, miel, gélatine)
  - **Végétarien** : Exclusion viande/poisson
  - **Halal** : Détection alcool/porc → Score 0/100 si présent
  - **Casher** : Exclusion porc/fruits de mer/mélanges lait-viande
  - **Sans gluten** : Pour maladie cœliaque

- **⚗️ Préférences** :
  - Éviter les additifs controversés (E621, E951, colorants)
  - Éviter l'huile de palme (-40 points au lieu de -12)

**🔒 Stockage sécurisé** : Votre profil reste sur votre appareil (localStorage)

### 📱 Interface Moderne

- **🎨 Design responsive** : Adapté mobile, tablette, desktop
- **🌙 Mode sombre** : Thème clair/sombre avec persistance
- **🎯 UX intuitive** : Navigation fluide et accessible
- **⚡ Temps réel** : Analyse en quelques secondes
- **📜 Historique** : Consultez vos analyses précédentes
- **👤 Profil flottant** : Bouton d'accès rapide à vos paramètr
  - 🩺 Diabétique → Score 25/100 (Grade E) ⛔ INTERDIT
  - 💉 Hypertendu → Score 70/100 (Grade C) ✅ OK

### 📱 Interface Moderne

- **🎨 Design responsive** : Adapté mobile, tablette, desktop
- **🌙 UX intuitive** : Navigation fluide et accessible
- **⚡ Temps réel** : Analyse en quelques secondes
- **📜 Historique** : Consultez vos analyses précédentes

---

## 🚀 Démarrage Rapide

### 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** : Utilisation de la dernière version LTS (Long Term Support), garantissant stabilité et support à long terme. Les développements ont été réalisés et validés avec Node.js v22.12.0 (LTS).

- **npm** : Gestionnaire de paquets inclus avec Node.js, utilisé dans sa dernière version LTS (v11.8.0) afin d'assurer la compatibilité et la fiabilité des dépendances du projet.

- **Une clé API Mistral** : [Créer un compte](https://console.mistral.ai/)

### 🔧 Installation

```bash
# 1️⃣ Cloner le projet
git clone https://github.com/Efrei-M2-DEV1/Projet-Web-IA.git
cd projet-web-ia

# 2️⃣ Installer les dépendances
npm install

# 3️⃣ Installer les dépendances du client
cd client
npm install

# 4️⃣ Installer les dépendances du serveur
cd ../server
npm install

# 5️⃣ Revenir à la racine
cd ..
```

---

## ⚙️ Configuration

### 🔑 Variables d'Environnement

#### **Backend (.env dans `/server`)**

Créez un fichier `.env` dans le dossier `server/` :

```env
# Port du serveur backend
PORT=3000

# Clé API Mistral (OBLIGATOIRE)
MISTRAL_API_KEY=votre_clé_api_mistral_ici

# Modèle Mistral à utiliser
MISTRAL_MODEL=pixtral-12b-2409
```

📌 **Comment obtenir votre clé API Mistral ?**

1. Rendez-vous sur [console.mistral.ai](https://console.mistral.ai/)
2. Créez un compte ou connectez-vous
3. Accédez à "API Keys"
4. Générez une nouvelle clé
5. Copiez-la dans votre fichier `.env`

📌 **Variables disponibles :**

| Variable          | Description                 | Valeur par défaut  | Obligatoire |
| ----------------- | --------------------------- | ------------------ | ----------- |
| `PORT`            | Port du serveur Express     | `3000`             | ❌          |
| `MISTRAL_API_KEY` | Clé d'accès API Mistral AI  | -                  | ✅          |
| `MISTRAL_MODEL`   | Modèle de vision à utiliser | `pixtral-12b-2409` | ❌          |

⚠️ **Important** :

- La variable `MISTRAL_API_KEY` est **obligatoire** pour que l'analyse fonctionne
- Ne partagez **jamais** votre clé API publiquement
- Ajoutez `.env` dans votre `.gitignore`

#### **Frontend (.env.local dans `/client`)**

Créez un fichier `.env.local` dans le dossier `client/` :

```env
# URL du backend (ajustez si nécessaire)
VITE_API_URL=
```

📌 **Variables disponibles :**

| Variable       | Description            | Valeur par défaut       |
| -------------- | ---------------------- | ----------------------- |
| `VITE_API_URL` | URL du serveur backend | `http://localhost:3000` |

⚠️ **Important** : Si vous déployez l'application, remplacez par l'URL de production du backend.

---

## 🎮 Lancement de l'Application

### 🚀 Méthode Rapide (Recommandée)

Depuis la **racine du projet** (`projet-web-ia/`) :

```bash
npm run dev
```

Cette commande lance automatiquement :

- ✅ Le serveur backend sur `http://localhost:3000`
- ✅ Le client frontend sur `http://localhost:5173`

### 🔧 Méthode Manuelle (2 Terminaux)

Si vous préférez lancer séparément :

**Terminal 1 - Backend :**

```bash
cd server
npm run dev
```

> Le serveur démarre sur http://localhost:3000

**Terminal 2 - Frontend :**

```bash
cd client
npm run dev
```

> L'application s'ouvre sur http://localhost:5173

---

## 📱 Test sur Mobile

### 🎯 Méthode 1 : Accès Direct via Réseau Local (Recommandée)

Cette méthode est la plus simple et ne nécessite aucun outil externe.

#### 📋 Prérequis

- ✅ Ordinateur et téléphone sur le **même réseau WiFi**
- 📱 **Alternative** : Activer le partage de connexion mobile depuis votre téléphone

#### 🚀 Étapes détaillées

**1️⃣ Démarrez l'application complète**

Depuis la racine du projet :

```bash
npm run dev
```

> Cela lance automatiquement le backend ET le frontend

**2️⃣ Récupérez l'adresse Network**

Dans votre terminal, Vite affichera **2 adresses** : (c'est un exemple)

```bash
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.114:5173/  👈 C'est celle-ci !
```

📝 **Note** : L'adresse Network correspond à l'IP locale de votre ordinateur sur le réseau WiFi

**3️⃣ Connectez-vous depuis votre mobile**

Sur votre smartphone (ou tablette ou PC, Mac...) IOS, Android (ou autre) :

1. **Ouvrez un navigateur** (recommandations ci-dessous)
2. **Tapez l'adresse Network** dans la barre d'adresse
   - Exemple : `http://192.168.1.187:5173/`
3. **Validez** et laissez la page charger

#### 🌐 Navigateurs Recommandés

| Navigateur | Compatibilité | Remarques                                      |
| ---------- | ------------- | ---------------------------------------------- |
| ✅ Chrome  | Excellent     | Recommandé - Fonctionne parfaitement           |
| ✅ Firefox | Excellent     | Recommandé - Accès caméra fluide               |
| ✅ Edge    | Bon           | Compatible                                     |
| ⚠️ Safari  | Limité        | **Non recommandé sur iOS** - Bloque par défaut |

#### 🔒 Message de Sécurité (Normal)

Lors de votre première connexion, vous verrez probablement :

```
⚠️ Avertissement : Site potentiellement dangereux
   Connexion non sécurisée
```

**C'est normal !** En développement local, il n'y a pas de certificat HTTPS.

**🔓 Comment continuer** :

- **Chrome/Firefox** : Cliquez sur "Paramètres avancés" → "Continuer malgré tout"
- **Autre navigateur** : Cherchez l'option "Accéder au site" ou "Continuer"

✅ Une fois validé, vous arriverez sur l'application **Analyseur d'Ingrédients**

#### 💡 Astuces & Dépannage

**❌ "Impossible de se connecter"**

- Vérifiez que votre téléphone est bien sur le **même WiFi** que votre PC
- Désactivez temporairement le pare-feu Windows/Mac
- Essayez de redémarrer `npm run dev`

**❌ "L'adresse Network n'apparaît pas"**

```bash
# Lancez manuellement avec l'option --host
cd client
npm run dev -- --host
```

**📸 Autorisation caméra refusée**

- Allez dans les paramètres du navigateur mobile
- Autorisez l'accès à la caméra pour ce site
- Rechargez la page

---

### 🌐 Méthode 2 : Tunnel HTTPS via ngrok (Pour iOS Strict)

⚠️ **Utilisez cette méthode si** :

- Safari bloque complètement l'accès
- Vous devez tester sur iOS avec HTTPS obligatoire
- Vous voulez partager l'app à distance

#### 📦 Installation de ngrok

```bash
# Installez ngrok globalement
npm install -g ngrok
```

#### 🚀 Lancement

```bash
# Démarrez ngrok pour exposer le port frontend
ngrok http 5173
```

#### 🔗 Accès

Ngrok affichera une URL HTTPS :

```
Forwarding: https://abc123-xyz456.ngrok-free.app → http://localhost:5173
```

**Utilisez cette URL** sur n'importe quel appareil (même hors réseau local) !

📌 **Avantage** : HTTPS natif, compatible iOS Safari  
📌 **Inconvénient** : Nécessite une connexion internet, gratuit limité

---

## 🛠️ Technologies

### **Frontend**

- ⚛️ **React 18** + **TypeScript** : Framework UI moderne
- ⚡ **Vite** : Build tool ultra-rapide
- 🎨 **Tailwind CSS v3** : Styling utility-first avec mode sombre
- 📷 **MediaDevices API** : Accès webcam/caméra
- 🗣️ **Web Speech API** : Recherche vocale intégrée
- 💾 **localStorage** : Persistance profils et historique

### **Backend**

- 🟢 **Node.js** + **Express** : Serveur API REST
- 🤖 **Mistral AI (Pixtral-12b-2409)** : Vision AI pour OCR et analyse
- 📤 **Multer** (memoryStorage) : Gestion upload d'images optimisée
- 🔒 **CORS** : Sécurisation des requêtes
- 🧠 **Système de prompts personnalisés** : 300+ lignes de logique conditionnelle

### **DevOps & Tests**

- 📦 **npm workspaces** : Gestion monorepo
- 🔧 **TypeScript** : Typage statique strict
- 🐛 **ESLint** : Linting du code
- 🧪 **Jest + Supertest** : Suite de tests (68% coverage)

---

## 📂 Structure du Projet

```
projet-web-ia/
├── 📁 client/                 # Application React (Frontend)
│   ├── src/
│   │   ├── components/        # Composants React
│   │   │   ├── ImageUpload.tsx           # Capture photo/upload
│   │   │   ├── AnalysisResults.tsx       # Affichage résultats
│   │   │   ├── HealthProfileSetup.tsx    # 🆕 Profil santé personnalisé
│   │   │   ├── PersonalizedAlerts.tsx    # 🆕 Alertes selon profil
│   │   │   ├── History.tsx               # Historique analyses
│   │   │   └── Help.tsx                  # Aide utilisateur
│   │   ├── services/          # Services API
│   │   │   ├── api.ts               # Communication backend
│   │   │   ├── healthProfile.ts     # 🆕 Gestion profil santé
│   │   │   └── history.ts           # Gestion historique
│   │   ├── hooks/             # 🆕 React Hooks personnalisés
│   │   │   └── useTheme.ts          # Hook mode sombre
│   │   ├── types/             # Types TypeScript
│   │   │   └── index.ts             # HealthProfile, AnalysisResul

### **Backend**

- 🟢 **Node.js** + **Express** : Serveur API REST
- 🤖 **Mistral AI (Pixtral)** : Vision AI pour OCR
- 📤 **Multer** : Gestion upload d'images
- 🔒 **CORS** : Sécurisation des requêtes

### **DevOps**

- 📦 **npm workspaces** : Gestion monorepo
- 🔧 **TypeScript** : Typage statique
- 🐛 **ESLint** : Linting du code

---

## 📂 Structure du Projet

```

projet-web-ia/
├── 📁 client/ # Application React (Frontend)
│ ├── src/
│ │ ├── components/ # Composants React
│ │ │ ├── ImageUpload.tsx # Capture photo/upload
│ │ │ ├── AnalysisResults.tsx # Affichage résultats
│ │ │ ├── History.tsx # Historique analyses
│ │ │ └── Help.tsx # Aide utilisateur
│ │ ├── services/ # Services API
│ │ │ ├── api.ts # Communication backend
│ │ │ ├── analyzeController.ts
│ │ │ └── **tests**/ # Tests unitaires
│ │ ├── services/ # Services externes
│ │ │ ├── mistralService.ts # 🧠 IA + prompts personnalisés
│ │ │ └── **tests**/ # Tests Mistral AI
│ │ ├── routes/ # Routes API
│ │ │ ├── api.ts
│ │ │ └── **tests**/ # Tests routes
│ │ └── index.ts # Serveur Express
│ ├── uploads/ # 📸 Images temporaires
│ ├── .env # ⚙️ Config backend (clé API)
│ ├── jest.config.js # 🧪 Configuration tests
│ ├── src/
│ │ ├── controllers/ # Logique métier
│ │ │ └── analyzeController.ts
│ │ ├── services/ # Services externes
│ │ │ └── mistralService.ts # Intégration Mistral AI
│ │ ├── routes/ # Routes API
│ │ │ └── api.ts
│ │ └── index.ts # Serveur Express
│ ├── uploads/ # 📸 Images temporaires
│ ├── .env # ⚙️ Config backend (clé API)
│ └── package.json
│
├── package.json # Scripts racine
└── README.md # 📖 Ce fichier

````

---

## 🧪 Commandes Utiles

```bash
# 🚀 Lancer l'app complète (racine)
npm run dev

# 🏗️ Build de production (client)
cd client && npm run build

# 🧹 Nettoyer les node_modules
rm -rf node_modules client/node_modules server/node_modules

# 📦 Réinstaller toutes les dépendances
npm install && cd client && npm install && cd ../server && npm install
````

---

## 🐛 Résolution de Problèmes

### ❌ Erreur "Failed to fetch"

**Problème** : Le frontend ne peut pas se connecter au backend

**Solutions** :

1. Vérifiez que le serveur backend est lancé (`http://localhost:3000`)
2. Vérifiez le fichier `.env.local` du client :
3. Dedans mettre bien la valeur à vide : `VITE_API_URL=`
4. Vérifiez que CORS est activé dans `server/src/index.ts`

### ❌ Erreur "MISTRAL_API_KEY manquante"

**Problème** : Clé API non configurée

**Solutions** :

1. Créez le fichier `.env` dans `server/`
2. Ajoutez `MISTRAL_API_KEY=votre_clé`
3. Ajoutez le model : `MISTRAL_MODEL=pixtral-12b-2409` et le PORT=`3000`
4. Redémarrez le serveur

### 📷 La caméra ne s'affiche pas

**Solutions** :

1. Autorisez l'accès à la caméra dans votre navigateur
2. Sur iOS & Android, utilisez HTTPS
3. Vérifiez que la caméra n'est pas utilisée par une autre app

### 🔍 Analyse qui retourne "Texte non disponible"

**Solutions** :

1. Utilisez une image nette et bien éclairée
2. Cadrez uniquement la liste des ingrédients
3. Évitez les reflets et ombres
4. Essayez avec une meilleure qualité d'image

---

## 👥 Équipe

Projet réalisé par **Farid, Mody, Loris, Redjane ** en Master 2 dans le cadre du cours **Projet Web & IA**. 🎓

---

## 📝 Licence

🎯 Utilisation des Profils de Santé

### 📝 Configuration de votre profil

1. **Cliquez sur le bouton profil** (icône utilisateur en bas à droite)
2. **Sélectionnez vos conditions** :
   - ✅ Cochez "Diabète" si vous êtes diabétique
   - ✅ Cochez "Hypertension" si vous avez de la tension
   - ✅ Cochez "Obésité/Contrôle du poids" si nécessaire
3. **Choisissez vos allergènes** (9 disponibles)
4. **Sélectionnez votre régime alimentaire** :
   - Aucun, Vegan, Végétarien, Halal, Casher, Sans gluten
5. **Cliquez sur "Enregistrer"**

### 🔍 Comment ça fonctionne ?

Lorsque vous analysez un produit :

1. **L'IA lit l'étiquette** avec Mistral AI (Pixtral)
2. **Votre profil est appliqué** automatiquement
3. **Le score est recalculé** selon vos contraintes :
   - 🩺 **Diabétique + produit sucré** → Score divisé par 2 ou 3
   - 🌾 **Allergique + allergène détecté** → Score forcé à 0/100 ⛔
   - 🌱 **Halal + alcool** → Score 0/100 + warning "HARAM"
   - 💉 **Hypertendu + glutamate (E621)** → -60 points au lieu de -15

### 📊 Exemple réel

**Produit** : Yaourt aux fruits (15g sucre/100g)

| Profil                | Score  | Grade | Commentaire                            |
| --------------------- | ------ | ----- | -------------------------------------- |
| 👤 Aucun profil       | 65/100 | C     | ✅ Consommation modérée                |
| 🩺 Diabétique         | 25/100 | E     | ⛔ INTERDIT - Risque hyperglycémie     |
| 💉 Hypertendu         | 70/100 | C     | ✅ OK (peu de sel)                     |
| 🌾 Allergique lactose | 0/100  | E     | ⛔ ALLERGÈNE MAJEUR - Produit interdit |
| 🌱 Vegan              | 0/100  | E     | ⛔ NON-VEGAN - Contient lait           |

## 🧪 Tests & Qualité

Le projet dispose d'une suite de tests complète :

```bash
# Lancer les tests
cd server
npm test

# Lancer les tests avec coverage
npm run test:coverage
```

**Coverage actuel** : 68.42%

- Routes : 100%
- Controllers : 94.11%
- Services : 51.92%

## 🚀 Prochaines Étapes

- [x] ✅ Profils de santé personnalisés (diabète, allergies, régimes)
- [x] ✅ Mode sombre avec persistance
- [x] ✅ Système de notation adaptatif
- [ ] Amélioration coverage tests (objectif 100%)
- [ ] Intégration OpenFoodFacts pour recherche vocale
- [ ] Système de favoris avancé
- [ ] Mode hors ligne (PWA)
- [ ] Base de données produits
- [ ] Comparaison de 3 produits simultanés
- [ ] Export PDF des analyses
- [ ] Gamification (badges, niveaux, points)inspiration
- **Yuka** pour l'inspiration du système de notation
- **OMS** pour les recommandations nutritionnelles

---

## 🚀 Prochaines Étapes

- [ ] Amélioration de la précision OCR
- [ ] Système de favoris
- [ ] Mode hors ligne (PWA)
- [ ] Base de données produits
- [ ] Comparaison de produits
- [ ] Export PDF des analyses

---

<div align="center">

**Fait avec ❤️ et beaucoup de ☕ par notre équipe en Master 2**

[🐛 Reporter un bug](../../issues) • [✨ Proposer une fonctionnalité](../../issues)

</div>
