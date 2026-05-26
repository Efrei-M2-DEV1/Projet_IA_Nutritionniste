# Tests Backend - Projet Web IA

## 📚 Structure des tests

```
server/src/
├── services/__tests__/
│   └── mistralService.test.ts
├── controllers/__tests__/
│   └── analyzeController.test.ts
└── routes/__tests__/
    └── api.test.ts
```

## 🚀 Commandes de test

```bash
# Exécuter tous les tests
npm test

# Mode watch (développement)
npm run test:watch

# Tests pour CI/CD
npm run test:ci

# Génération du rapport de couverture
npm test -- --coverage
```

## 📊 Couverture de code

Les tests couvrent :
- ✅ Service Mistral AI (analyzeImageService)
- ✅ Controller d'analyse (analyzeImage)
- ✅ Routes API (POST /api/analyze)

Objectif : >80% de couverture

## 🧪 Technologies utilisées

- **Jest** : Framework de test
- **Supertest** : Tests d'intégration API
- **ts-jest** : Support TypeScript

## 📝 Exemples d'utilisation

### Exécuter un test spécifique
```bash
npm test -- mistralService.test.ts
```

### Voir le rapport de couverture
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

## 🔧 Configuration

La configuration Jest se trouve dans `jest.config.js`.

## ⚠️ Notes importantes

- Les tests mockent le client Mistral AI pour éviter les appels API réels
- Les fichiers temporaires sont nettoyés après chaque test
- Les variables d'environnement de test doivent être définies dans `.env.test`
