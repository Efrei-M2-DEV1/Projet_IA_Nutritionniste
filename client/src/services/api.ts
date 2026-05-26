import type { ApiResponse } from "../types";
import { loadHealthProfile } from "./healthProfile";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export async function analyzeImage(imageFile: File): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const healthProfile = loadHealthProfile();
  formData.append("healthProfile", JSON.stringify(healthProfile));

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
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
    const res = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}
