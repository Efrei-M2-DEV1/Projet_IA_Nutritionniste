# CI/CD — Nutritionniste IA

## Workflows

### `ci-cd.yml`

Workflow principal execute sur `main`, `dev`, `feat/**`, `feature/**` et pull requests.

Jobs :

- Tests backend Python avec Python 3.11 et 3.12.
- Lint backend via Ruff.
- Build frontend React/Vite.

### `deploy.yml`

Workflow manuel de verification Docker.

Il ne deploie pas automatiquement en production. Il sert a valider que les images Docker backend et client se construisent correctement avant une demo ou une mise en ligne.

Lancement :

1. GitHub Actions.
2. `Docker build verification`.
3. `Run workflow`.

## Secrets optionnels

Le projet fonctionne sans secret grace au fallback local.

Secrets utiles si un provider LLM est active :

```text
MISTRAL_API_KEY
OPENAI_API_KEY
HF_TOKEN
```

## Notes

- Les cles API doivent rester dans les secrets GitHub ou dans un `.env` local ignore par Git.
- Le dossier `server/` est legacy et ne doit plus etre utilise dans les workflows du rendu final.
- Le premier build Docker backend peut etre long car il installe les dependances IA Python.
