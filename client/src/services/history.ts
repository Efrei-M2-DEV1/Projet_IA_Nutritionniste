import type { AnalysisResult } from "../types";

const HISTORY_KEY = "nutritionniste_ia_history";
const LEGACY_KEY = "ingredient_analyzer_history";
const MAX_HISTORY_ITEMS = 20;

function isMealResult(item: unknown): item is AnalysisResult {
  if (!item || typeof item !== "object") return false;
  const r = item as AnalysisResult;
  return (
    Array.isArray(r.foods) &&
    r.nutrition != null &&
    typeof r.nutrition.calories_kcal === "number"
  );
}

export const getHistory = (): AnalysisResult[] => {
  try {
    const stored =
      localStorage.getItem(HISTORY_KEY) ||
      localStorage.getItem(LEGACY_KEY);
    if (!stored) return [];
    const parsed: unknown[] = JSON.parse(stored);
    return parsed.filter(isMealResult);
  } catch {
    return [];
  }
};

export const saveToHistory = (result: AnalysisResult): void => {
  try {
    const history = getHistory();
    const updated = [result, ...history.filter((h) => h.id !== result.id)].slice(
      0,
      MAX_HISTORY_ITEMS,
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    localStorage.removeItem(LEGACY_KEY);
  } catch (error) {
    console.error("Erreur sauvegarde historique:", error);
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(LEGACY_KEY);
};

export const removeFromHistory = (id: string): void => {
  const updated = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};
