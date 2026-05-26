import type { ApiResponse } from "../types";
import { loadHealthProfile } from "./healthProfile";

/**
 * En dev (`npm run dev`), URL vide = requêtes via le proxy Vite (/api, /health).
 * Évite le blocage mixed content (front en https://localhost:5173 → back http://8000).
 * En prod ou sans proxy : VITE_API_URL=http://localhost:8000
 */
function resolveApiBaseUrl(): string {
  // Front en HTTPS (Vite) → toujours le proxy, sinon mixed content si .env pointe vers :8000
  if (
    import.meta.env.DEV &&
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  ) {
    return "";
  }

  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv !== undefined && fromEnv !== "") {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "";
  }
  return "http://localhost:8000";
}

const API_BASE_URL = resolveApiBaseUrl();

export function getApiBaseUrl(): string {
  if (API_BASE_URL === "") {
    return import.meta.env.DEV
      ? `${window.location.origin} (proxy → :8000)`
      : "http://localhost:8000";
  }
  return API_BASE_URL;
}

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function analyzeImage(imageFile: File): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const healthProfile = loadHealthProfile();
  formData.append("healthProfile", JSON.stringify(healthProfile));

  const response = await fetch(apiUrl("/api/analyze"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const detail =
      typeof errorData.detail === "string"
        ? errorData.detail
        : errorData.error || `Erreur HTTP ${response.status}`;
    throw new Error(detail);
  }

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error("L'analyse a échoué côté serveur.");
  }

  return data;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/health"), { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
