# Import des issues GitHub

Les tâches du projet sont définies dans [`.github/issues.json`](../.github/issues.json).

## Méthode 1 — GitHub Actions (recommandée)

1. **Settings → Actions → General → Workflow permissions**
   - Choisir **Read and write permissions**
   - Enregistrer

2. **Actions → Import project issues → Run workflow**
   - `dry_run` = `true` pour tester
   - `dry_run` = `false` pour créer les issues
   - `force` = `false` (évite les doublons si un titre existe déjà)

### Si erreur 403 persiste

Créer un [Personal Access Token](https://github.com/settings/tokens) (classic) avec le scope **`repo`**.

Puis **Settings → Secrets and variables → Actions → New repository secret** :

| Nom | Valeur |
|-----|--------|
| `ISSUES_IMPORT_TOKEN` | votre PAT |

Relancer le workflow : le script utilisera ce secret en priorité.

## Méthode 2 — En local (secours)

```powershell
cd Projet_IA_Nutritionniste
$env:GITHUB_TOKEN = "ghp_VOTRE_TOKEN"
$env:GITHUB_REPOSITORY = "Efrei-M2-DEV1/Projet_IA_Nutritionniste"

# Simulation
python scripts/import_issues.py --dry-run

# Création
python scripts/import_issues.py
```

Prérequis : Python 3.10+ (aucune dépendance pip).

## Notes

- Les **pull requests** n'apparaissent pas dans l'onglet Issues filtré : vérifiez le filtre **Issues** (pas *Pull requests*).
- Ne pas utiliser `force = true` sans raison : cela peut créer des doublons.
