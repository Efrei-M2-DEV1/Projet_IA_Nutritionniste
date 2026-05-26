# Créer toutes les issues GitHub automatiquement

Ce dépôt contient un fichier **`.github/issues.json`** (37 tâches) et un workflow GitHub Actions qui les importe en un clic.

> **Important :** GitHub ne crée pas les issues **automatiquement** au simple `git push`. Il faut **lancer le workflow une fois** depuis l’onglet Actions (c’est normal et voulu, pour éviter les doublons).

---

## Étapes (une seule fois par repo)

### 1. Pousser ces fichiers sur GitHub

```bash
git add .github/issues.json .github/workflows/import-issues.yml docs/IMPORT_ISSUES_GITHUB.md
git commit -m "chore: ajout import automatique des issues projet"
git push
```

### 2. Créer les issues (obligatoire : dry_run = false)

1. Ouvrir le repo sur **GitHub.com**
2. Onglet **Actions** → **Import project issues** (menu de gauche)
3. **Run workflow** → branche **`main`**
4. Choisir **dry_run = `false`** ← **sinon 0 issue créée**
5. **Run workflow**

Après ~1 minute : onglet **Issues** → **37 issues** avec labels (`P1-backend`, `semaine-1`, etc.).

> Si vous avez déjà lancé avec `dry_run = true` : c’est normal que l’onglet Issues soit vide. Le workflow est vert mais n’a rien créé.

### 3. (Optionnel) Test sans créer

Relancer avec **dry_run = `true`** uniquement pour vérifier que le JSON est valide.

---

## Répartition des issues

| Label | Rôle | Nombre approx. |
|-------|------|----------------|
| `P1-backend` | Lead FastAPI | 6 |
| `P2-vision` | Deep learning vision | 6 |
| `P3-nutrition` | LLM / nutrition | 5 |
| `P4-frontend` | React | 7 |
| `P5-devops` | Docker, README, soutenance | 7 |
| `equipe` | Tâches communes | 6 |
| `bonus` | Optionnel | 3 |

Les labels sont **créés automatiquement** par GitHub à la première importation.

---

## Assigner les issues aux membres

Après l’import :

1. **Issues** → filtrer par label (`P1-backend`, etc.)
2. Cocher les issues → **Assignees** → choisir le membre
3. Ou utiliser un **GitHub Project** (board Kanban) et glisser-déposer

---

## Modifier / ajouter des issues plus tard

1. Éditer `.github/issues.json`
2. **Ne pas** relancer l’import complet (doublons)
3. Créer les nouvelles issues à la main, **ou** retirer du JSON celles déjà créées et n’importer que les nouvelles

---

## Dépannage

| Problème | Solution |
|----------|----------|
| Workflow absent dans Actions | Vérifier que `import-issues.yml` est sur la branche par défaut (`main`) |
| Permission denied | Settings → Actions → General → autoriser les workflows |
| Issues en double | Normal si vous avez lancé 2× avec `dry_run=false` — fermer les doublons à la main |
| Assignees invalides | Laisser les assignees vides dans le JSON ; assigner après coup sur GitHub |

---

## Fichiers concernés

```
.github/
├── issues.json              ← liste des issues (source de vérité)
└── workflows/
    └── import-issues.yml    ← workflow d'import
```

Plan projet complet : [`docs/PLAN_PROJET_EQUIPE.md`](./PLAN_PROJET_EQUIPE.md)
