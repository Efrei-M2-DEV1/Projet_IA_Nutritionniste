import type { AnalysisResult } from '../types';
import { removeFromHistory } from '../services/history';

interface HistoryProps {
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClearHistory: () => void;
}

export const History = ({ history, onSelectResult, onClearHistory }: HistoryProps) => {
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromHistory(id);
    // Rafraîchir l'historique en appelant onClearHistory puis en rechargeant
    window.location.reload();
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70 text-base font-medium">
          Aucun historique pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
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
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md p-5 md:p-5 border border-orange-100 active:shadow-lg active:border-orange-300 transition-all cursor-pointer touch-manipulation"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`
                w-14 h-14 md:w-12 md:h-12 rounded-full flex items-center justify-center text-2xl md:text-xl font-bold border-2
                ${result.grade === 'A' ? 'bg-green-100 text-green-800 border-green-300' :
                  result.grade === 'B' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                  result.grade === 'C' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  result.grade === 'D' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                  'bg-red-100 text-red-800 border-red-300'}
              `}>
                {result.grade}
              </div>
              <button
                onClick={(e) => handleDelete(result.id, e)}
                className="p-2 active:bg-red-100 rounded-lg transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Supprimer"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-base md:text-sm font-semibold text-gray-800">
                Note: {result.score}/100
              </p>
              <p className="text-xs text-gray-500">
                {new Date(result.timestamp).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-sm md:text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                {result.extractedText.substring(0, 100)}...
              </p>
              <div className="flex gap-2 mt-3">
                <span className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium">
                  {result.ingredients.length} ingrédients
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
