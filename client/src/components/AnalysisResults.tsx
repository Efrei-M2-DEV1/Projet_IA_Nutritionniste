import type { AnalysisResult, FoodItem } from '../types';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const MacroCard = ({
  label,
  value,
  unit,
  color,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: string;
}) => (
  <div className={`rounded-xl p-4 border ${color} flex flex-col items-center gap-1`}>
    <span className="text-2xl">{icon}</span>
    <span className="text-xl font-bold">{Math.round(value)}</span>
    <span className="text-xs font-medium">{unit}</span>
    <span className="text-xs text-gray-600 text-center">{label}</span>
  </div>
);

const ConfidenceBadge = ({ confidence }: { confidence: number }) => {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 80
      ? 'bg-green-100 text-green-800 border-green-300'
      : pct >= 60
      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
      : 'bg-red-100 text-red-800 border-red-300';
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${color}`}>
      {pct}%
    </span>
  );
};

const FoodCard = ({ food }: { food: FoodItem }) => (
  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200">
    <div className="flex items-center gap-3">
      <span className="text-2xl">🍽️</span>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{food.name}</p>
        <p className="text-xs text-gray-500 capitalize">Portion {food.portion_estimate}</p>
      </div>
    </div>
    <ConfidenceBadge confidence={food.confidence} />
  </div>
);

export const AnalysisResults = ({ result }: AnalysisResultsProps) => {
  const { foods, nutrition, advice, warnings, imageUrl } = result;

  return (
    <div className="w-full space-y-4 md:space-y-6 animate-fadeIn">
      {imageUrl && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-orange-100">
          <img
            src={imageUrl}
            alt="Votre assiette"
            className="w-full max-h-64 object-cover"
          />
        </div>
      )}

      {/* En-tête calories */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🥗</span>
          <h2 className="text-3xl font-bold text-gray-800">
            {Math.round(nutrition.calories_kcal)} kcal
          </h2>
          <p className="text-sm text-gray-500">
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

      {/* Macronutriments */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Macronutriments
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MacroCard
            label="Protéines"
            value={nutrition.protein_g}
            unit="g"
            color="bg-blue-50 border-blue-200 text-blue-700"
            icon="💪"
          />
          <MacroCard
            label="Glucides"
            value={nutrition.carbs_g}
            unit="g"
            color="bg-yellow-50 border-yellow-200 text-yellow-700"
            icon="🌾"
          />
          <MacroCard
            label="Lipides"
            value={nutrition.fat_g}
            unit="g"
            color="bg-orange-50 border-orange-200 text-orange-700"
            icon="🫒"
          />
          <MacroCard
            label="Fibres"
            value={nutrition.fiber_g}
            unit="g"
            color="bg-green-50 border-green-200 text-green-700"
            icon="🥦"
          />
        </div>
      </div>

      {/* Aliments détectés */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🔍</span>
          Aliments détectés ({foods.length})
        </h3>
        <div className="space-y-2">
          {foods.map((food, index) => (
            <FoodCard key={index} food={food} />
          ))}
        </div>
      </div>

      {/* Conseils personnalisés */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          Conseils nutritionnels
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">{advice}</p>
      </div>

      {/* Alertes profil santé */}
      {warnings.length > 0 && (
        <div className="bg-red-50 rounded-2xl shadow-lg p-5 md:p-6 border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            Alertes profil santé
          </h3>
          <ul className="space-y-2">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Avertissement légal */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm text-amber-800 flex items-start gap-2 leading-relaxed">
          <span className="font-semibold text-base">⚠️</span>
          <span>
            <strong>Important :</strong> Cette analyse est fournie à titre informatif et pédagogique
            uniquement. Les estimations nutritionnelles sont approximatives et ne constituent pas un
            avis médical. Consultez un professionnel de santé si nécessaire.
          </span>
        </p>
      </div>
    </div>
  );
};
