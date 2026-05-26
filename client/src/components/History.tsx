import type { AnalysisResult, FoodItem } from "../types";

interface HistoryProps {
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const History = ({
  history,
  onSelectResult,
  onClearHistory,
  onDeleteItem,
}: HistoryProps) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70 text-base font-medium">
          Aucun repas analysé pour le moment
        </p>
        <p className="text-white/50 text-sm mt-2">
          Vos analyses apparaîtront ici après la première photo
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📚</span>
          Historique ({history.length})
        </h2>
        <button
          onClick={onClearHistory}
          className="px-5 py-2.5 bg-red-100 active:bg-red-200 text-red-700 rounded-xl font-medium transition-colors text-sm touch-manipulation min-h-[44px] w-full sm:w-auto"
        >
          Tout effacer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((result) => (
          <div
            key={result.id}
            onClick={() => onSelectResult(result)}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 border border-orange-100 active:shadow-lg active:border-orange-300 transition-all cursor-pointer touch-manipulation"
          >
            <div className="flex items-start justify-between mb-3">
              {result.imageUrl ? (
                <img
                  src={result.imageUrl}
                  alt="Repas"
                  className="w-14 h-14 rounded-xl object-cover border-2 border-orange-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 bg-orange-100 text-orange-700 border-orange-300">
                  🥗
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(result.id);
                }}
                className="p-2 active:bg-red-100 rounded-lg transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Supprimer"
              >
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-gray-800">
                {Math.round(result.nutrition.calories_kcal)} kcal
              </p>
              <p className="text-xs text-gray-500">
                {new Date(result.timestamp).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {result.foods.map((f: FoodItem) => f.name).join(", ")}
              </p>
              <span className="inline-block text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium mt-1">
                {result.foods.length} aliment
                {result.foods.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
