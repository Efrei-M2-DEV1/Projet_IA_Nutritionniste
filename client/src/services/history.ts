import type { AnalysisResult } from '../types';

const HISTORY_KEY = 'ingredient_analyzer_history';
const MAX_HISTORY_ITEMS = 20;

export const saveToHistory = (result: AnalysisResult): void => {
  try {
    const history = getHistory();
    // Ajouter le nouveau résultat au début
    const updatedHistory = [result, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'historique:', error);
  }
};

export const getHistory = (): AnalysisResult[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'historique:', error);
    return [];
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'historique:', error);
  }
};

export const removeFromHistory = (id: string): void => {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élément:', error);
  }
};
