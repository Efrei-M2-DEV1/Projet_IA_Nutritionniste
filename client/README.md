# Application d'Analyse d'Ingrédients - Frontend

Application web responsive React pour analyser les ingrédients de produits alimentaires, cosmétiques et d'hygiène via l'intelligence artificielle.

## � Prérequis

- **Node.js** : Utilisation de la dernière version LTS (Long Term Support), garantissant stabilité et support à long terme. Les développements ont été réalisés et validés avec Node.js v22.12.0 (LTS).

- **npm** : Gestionnaire de paquets inclus avec Node.js, utilisé dans sa dernière version LTS (v11.8.0) afin d'assurer la compatibilité et la fiabilité des dépendances du projet.

## �🚀 Fonctionnalités

- **Capture/Upload d'images** : Glisser-déposer ou sélectionner une image d'étiquette produit
- **Extraction OCR** : Reconnaissance automatique du texte sur l'étiquette
- **Analyse IA** : Analyse intelligente des ingrédients avec Mistral AI
- **Résultats détaillés** : 
  - Note et grade (A à E)
  - Liste des ingrédients avec explications
  - Points positifs et points de vigilance
  - Recommandations personnalisées
- **Historique local** : Sauvegarde automatique des analyses dans le navigateur
- **Interface moderne** : Design responsive avec excellente affordance

## 🛠️ Technologies

- **React 19** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **LocalStorage** pour l'historique

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier `client` :

```env
VITE_API_URL=http://localhost:3000
```

Par défaut, l'application se connecte à `http://localhost:3000`.

## 🎨 Design et Affordance

L'application a été conçue avec une attention particulière à l'**affordance** :

- **Boutons clairs** : États visuels distincts (hover, active, disabled)
- **Feedback visuel** : Animations et transitions pour guider l'utilisateur
- **Hiérarchie visuelle** : Utilisation de couleurs, tailles et espacements pour structurer l'information
- **Accessibilité** : Contrastes suffisants, textes lisibles, navigation intuitive
- **Responsive** : Adaptation automatique aux différentes tailles d'écran

## 📱 Structure des composants

```
src/
├── components/
│   ├── ImageUpload.tsx      # Composant d'upload/capture d'image
│   ├── AnalysisResults.tsx  # Affichage des résultats d'analyse
│   └── History.tsx          # Historique des analyses
├── services/
│   ├── api.ts               # Service API pour communiquer avec le backend
│   └── history.ts           # Gestion de l'historique local
├── types/
│   └── index.ts             # Types TypeScript
├── App.tsx                  # Composant principal
└── main.tsx                 # Point d'entrée
```

## 🔌 Connexion Backend

Le service API (`src/services/api.ts`) est prêt à être connecté au backend. Il envoie une requête POST à `/api/analyze` avec l'image en FormData.

Format de réponse attendu du backend :

```typescript
{
  extractedText: string;
  analysis: {
    ingredients: Array<{
      name: string;
      category: 'allergen' | 'preservative' | 'additive' | 'irritant' | 'beneficial' | 'other';
      explanation: string;
      riskLevel: 'low' | 'medium' | 'high' | 'none';
    }>;
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    summary: {
      positives: string[];
      warnings: string[];
      recommendations: string[];
    };
  };
}
```

## 📝 Notes

- L'historique est stocké dans le `localStorage` du navigateur
- Les images sont traitées temporairement et ne sont pas stockées
- L'application fonctionne entièrement côté client, seule l'analyse nécessite le backend

## 🎯 Prochaines étapes

1. Connecter le frontend au backend une fois celui-ci prêt
2. Tester l'application avec de vraies images d'étiquettes
3. Ajuster les styles si nécessaire
4. Ajouter des fonctionnalités supplémentaires (comparaison de produits, export, etc.)
