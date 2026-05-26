# CI/CD Pipeline - Projet Web IA

## 🔄 Workflows GitHub Actions

### 1. CI/CD Principal (`.github/workflows/ci-cd.yml`)

**Déclenchement** :
- Push sur `main`, `dev`, ou branches `feature/**`
- Pull Request vers `main` ou `dev`

**Jobs** :

#### 📋 test-backend
- Tests sur Node.js 18.x et 20.x
- Exécution de la suite de tests complète
- Upload de la couverture vers Codecov
- Variables d'environnement requises : `MISTRAL_API_KEY`

#### 🏗️ build-backend
- Build du backend après succès des tests
- Génération des artifacts
- Rétention : 7 jours

#### 🎨 test-frontend
- Tests du frontend sur Node.js 18.x et 20.x
- Linting et build

#### 🔒 quality-checks
- Audit de sécurité des dépendances
- Vérification des dépendances obsolètes

### 2. Déploiement (`.github/workflows/deploy.yml`)

**Déclenchement** :
- Push sur `main`
- Manuel via `workflow_dispatch`

**Étapes** :
1. Tests complets
2. Build de production
3. Déploiement (à configurer selon votre plateforme)

## 🔑 Secrets GitHub requis

Configurez ces secrets dans **Settings → Secrets and variables → Actions** :

```
MISTRAL_API_KEY         # Clé API Mistral AI
CODECOV_TOKEN           # Token Codecov (optionnel)
```

Pour le déploiement (selon plateforme) :
```
HEROKU_API_KEY         # Si déploiement Heroku
AZURE_CREDENTIALS      # Si déploiement Azure
```

## 📊 Badges de statut

Ajoutez ces badges dans votre README principal :

```markdown
![CI/CD](https://github.com/VOTRE-ORG/Projet-Web-IA/workflows/CI%2FCD%20Backend/badge.svg)
![Coverage](https://codecov.io/gh/VOTRE-ORG/Projet-Web-IA/branch/main/graph/badge.svg)
```

## 🚀 Configuration du déploiement

### Heroku
Décommentez et configurez dans `deploy.yml` :
```yaml
- name: Deploy to Heroku
  uses: akhileshns/heroku-deploy@v3.13.15
  with:
    heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
    heroku_app_name: "votre-app-name"
    heroku_email: "votre-email@example.com"
    appdir: "server"
```

### Azure Web App
Décommentez et configurez dans `deploy.yml` :
```yaml
- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    app-name: votre-app-name
    publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
    package: server/dist
```

## 📝 Bonnes pratiques

1. **Branches protégées** : Configurez les protections sur `main` et `dev`
2. **Pull Requests** : Exigez la réussite des tests avant merge
3. **Code Review** : Activez les revues obligatoires
4. **Semantic Versioning** : Utilisez des tags pour les releases

## 🐛 Dépannage

### Les tests échouent en CI
- Vérifiez que `MISTRAL_API_KEY` est configuré dans les secrets
- Vérifiez les logs dans l'onglet Actions

### Le build échoue
- Vérifiez la version de Node.js
- Assurez-vous que `package-lock.json` est commité

### Déploiement bloqué
- Vérifiez les secrets de déploiement
- Consultez les logs du workflow
