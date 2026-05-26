import type { AnalysisResult, IngredientAnalysis } from '../types';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'B':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'C':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'D':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'E':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'low':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'none':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    allergen: 'Allergène',
    preservative: 'Conservateur',
    additive: 'Additif',
    irritant: 'Irritant',
    beneficial: 'Bénéfique',
    other: 'Autre',
  };
  return labels[category] || category;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'allergen':
      return '⚠️';
    case 'preservative':
      return '🧪';
    case 'additive':
      return '⚗️';
    case 'irritant':
      return '🔴';
    case 'beneficial':
      return '✅';
    default:
      return 'ℹ️';
  }
};

export const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  return (
    <div className="w-full space-y-4 md:space-y-6 animate-fadeIn">
      {/* En-tête avec note et grade */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100">
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className={`
              w-28 h-28 md:w-24 md:h-24 rounded-full flex items-center justify-center text-5xl md:text-4xl font-bold border-4
              ${getGradeColor(result.grade)}
            `}>
              {result.grade}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-2xl font-bold text-gray-800 mb-1">
                Note: {result.score}/100
              </h2>
              <p className="text-sm text-gray-600">
                {new Date(result.timestamp).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Texte extrait */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100">
        <h3 className="text-lg md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📝</span>
          Texte extrait de l'étiquette
        </h3>
        <div className="bg-gray-50 rounded-xl p-4 md:p-4 border border-gray-200">
          <p className="text-sm md:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {result.extractedText || 'Aucun texte extrait'}
          </p>
        </div>
      </div>

      {/* Ingrédients analysés */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100">
        <h3 className="text-lg md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🔍</span>
          Ingrédients analysés ({result.ingredients.length})
        </h3>
        <div className="space-y-3 md:space-y-3">
          {result.ingredients.map((ingredient, index) => (
            <IngredientCard key={index} ingredient={ingredient} />
          ))}
        </div>
      </div>

      {/* Synthèse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Points positifs */}
        {result.summary.positives.length > 0 && (
          <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <span>✅</span>
              Points positifs
            </h3>
            <ul className="space-y-2">
              {result.summary.positives.map((point, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Points de vigilance */}
        {result.summary?.warnings && result.summary.warnings.length > 0 && (
          <div className="bg-orange-50 rounded-xl shadow-lg p-6 border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
              <span>⚠️</span>
              Points de vigilance
            </h3>
            <ul className="space-y-2">
              {result.summary.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommandations */}
        {result.summary?.recommendations && result.summary.recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <span>💡</span>
              Recommandations
            </h3>
            <ul className="space-y-2">
              {result.summary.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
        {/* ✅ AJOUTER : Message si summary est vide */}
      {(!result.summary || 
        (result.summary.positives.length === 0 && 
         result.summary.warnings.length === 0 && 
         result.summary.recommendations.length === 0)) && (
        <div className="bg-gray-50 rounded-xl shadow-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-center">
            ℹ️ Aucune synthèse disponible pour cette analyse
          </p>
        </div>
      )}

      {/* Avertissement */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-4">
        <p className="text-sm md:text-sm text-amber-800 flex items-start gap-2 leading-relaxed">
          <span className="font-semibold text-base">⚠️</span>
          <span>
            <strong>Important:</strong> Cette analyse est fournie à titre informatif et pédagogique uniquement.
            Elle ne constitue pas un avis médical ou réglementaire. En cas de doute, consultez un professionnel de santé.
          </span>
        </p>
      </div>
    </div>
  );
};

const IngredientCard = ({ ingredient }: { ingredient: IngredientAnalysis }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 md:p-4 border border-gray-200 active:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-2 text-base md:text-sm">{ingredient.name}</h4>
          <div className="flex flex-wrap gap-2">
            <span className={`
              px-3 py-1.5 rounded-lg text-xs md:text-xs font-medium border
              ${getRiskColor(ingredient.riskLevel)}
            `}>
              {ingredient.riskLevel === 'high' ? 'Risque élevé' :
               ingredient.riskLevel === 'medium' ? 'Risque modéré' :
               ingredient.riskLevel === 'low' ? 'Risque faible' : 'Aucun risque'}
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs md:text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300">
              {getCategoryIcon(ingredient.category)} {getCategoryLabel(ingredient.category)}
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm md:text-sm text-gray-600 leading-relaxed mt-2">
        {ingredient.explanation}
      </p>
    </div>
  );
};
