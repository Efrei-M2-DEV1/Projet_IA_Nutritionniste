#!/usr/bin/env python3
"""
Importe les issues depuis .github/issues.json via l'API GitHub REST.

Usage local :
  set GITHUB_TOKEN=ghp_...
  set GITHUB_REPOSITORY=Efrei-M2-DEV1/Projet_IA_Nutritionniste
  python scripts/import_issues.py

Options :
  --dry-run     Affiche ce qui serait créé sans appeler l'API de création
  --force       Crée même si des issues avec les mêmes titres existent déjà
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

API_VERSION = "2022-11-28"
DEFAULT_ISSUES_FILE = Path(__file__).resolve().parent.parent / ".github" / "issues.json"

# Couleurs sans # pour les labels personnalisés du projet
LABEL_COLORS: dict[str, str] = {
    "equipe": "1D76DB",
    "priorite-haute": "B60205",
    "P1-backend": "0052CC",
    "P2-vision": "5319E7",
    "P3-nutrition": "FBCA04",
    "P4-frontend": "0E8A16",
    "P5-devops": "006B75",
    "documentation": "0075CA",
    "bonus": "C5DEF5",
}


class GitHubClient:
    def __init__(self, token: str, repository: str) -> None:
        if "/" not in repository:
            raise ValueError("GITHUB_REPOSITORY doit être au format owner/repo")
        self.owner, self.repo = repository.split("/", 1)
        self.base = f"https://api.github.com/repos/{self.owner}/{self.repo}"
        self.token = token

    def _request(
        self,
        method: str,
        path: str,
        body: dict | None = None,
        accept: str = "application/vnd.github+json",
    ) -> tuple[int, dict | list | None]:
        url = path if path.startswith("https://") else f"{self.base}{path}"
        data = None
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Accept": accept,
            "X-GitHub-Api-Version": API_VERSION,
            "User-Agent": "projet-ia-nutritionniste-import-issues",
        }
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                raw = resp.read().decode("utf-8")
                if not raw:
                    return resp.status, None
                return resp.status, json.loads(raw)
        except urllib.error.HTTPError as exc:
            raw = exc.read().decode("utf-8")
            try:
                payload = json.loads(raw) if raw else None
            except json.JSONDecodeError:
                payload = {"message": raw}
            return exc.code, payload

    def list_issue_titles(self) -> set[str]:
        titles: set[str] = set()
        page = 1
        while True:
            status, data = self._request(
                "GET",
                f"/issues?state=all&per_page=100&page={page}",
            )
            if status != 200 or not isinstance(data, list):
                raise RuntimeError(f"Impossible de lister les issues (HTTP {status}): {data}")
            if not data:
                break
            for item in data:
                if "pull_request" in item:
                    continue
                titles.add(item["title"])
            if len(data) < 100:
                break
            page += 1
        return titles

    def ensure_label(self, name: str) -> None:
        status, _ = self._request("GET", f"/labels/{urllib.request.quote(name, safe='')}")
        if status == 200:
            return
        color = LABEL_COLORS.get(name, "EDEDED")
        status, payload = self._request(
            "POST",
            "/labels",
            {"name": name, "color": color, "description": f"Label projet — {name}"},
        )
        if status not in (200, 201):
            raise RuntimeError(f"Création label '{name}' échouée (HTTP {status}): {payload}")

    def create_issue(self, title: str, body: str, labels: list[str]) -> dict:
        for label in labels:
            self.ensure_label(label)
        status, payload = self._request(
            "POST",
            "/issues",
            {"title": title, "body": body, "labels": labels},
        )
        if status not in (200, 201) or not isinstance(payload, dict):
            raise RuntimeError(f"Création issue '{title}' échouée (HTTP {status}): {payload}")
        return payload


def load_issues(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    issues = data.get("issues")
    if not isinstance(issues, list):
        raise ValueError(f"{path} : clé 'issues' manquante ou invalide")
    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description="Import issues GitHub depuis JSON")
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_ISSUES_FILE,
        help="Chemin vers le fichier JSON (défaut: .github/issues.json)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulation sans création",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Créer même si un titre identique existe déjà",
    )
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    repository = os.environ.get("GITHUB_REPOSITORY")

    if not token:
        print(
            "Erreur : définissez GITHUB_TOKEN (PAT avec scope repo/issues) ou GH_TOKEN.",
            file=sys.stderr,
        )
        return 1
    if not repository:
        print(
            "Erreur : définissez GITHUB_REPOSITORY (ex. Efrei-M2-DEV1/Projet_IA_Nutritionniste).",
            file=sys.stderr,
        )
        return 1
    if not args.file.is_file():
        print(f"Erreur : fichier introuvable — {args.file}", file=sys.stderr)
        return 1

    issues = load_issues(args.file)
    client = GitHubClient(token, repository)

    print(f"Dépôt : {repository}")
    print(f"Fichier : {args.file}")
    print(f"Issues à traiter : {len(issues)}")
    print(f"Mode dry-run : {args.dry_run}")

    existing_titles = client.list_issue_titles()
    print(f"Issues déjà présentes (hors PR) : {len(existing_titles)}")

    created = 0
    skipped = 0
    failed = 0

    for item in issues:
        title = item.get("title", "").strip()
        body = item.get("body", "")
        labels = item.get("labels") or []

        if not title:
            print("⚠️  Entrée ignorée : titre vide")
            skipped += 1
            continue

        if title in existing_titles and not args.force:
            print(f"⏭️  Déjà existante : {title}")
            skipped += 1
            continue

        if args.dry_run:
            print(f"🔍 [dry-run] Créerait : {title}  labels={labels}")
            created += 1
            continue

        try:
            result = client.create_issue(title, body, labels)
            url = result.get("html_url", "")
            print(f"✅ #{result.get('number')} — {title}")
            if url:
                print(f"   {url}")
            existing_titles.add(title)
            created += 1
        except Exception as exc:  # noqa: BLE001 — script CLI
            print(f"❌ Échec : {title}\n   {exc}", file=sys.stderr)
            failed += 1

    print()
    print(f"Résumé — créées/simulées : {created}, ignorées : {skipped}, échecs : {failed}")

    if failed > 0:
        return 1
    if not args.dry_run and created == 0 and skipped == len(issues):
        print("Aucune nouvelle issue créée (toutes existaient déjà). Utilisez --force pour dupliquer.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
