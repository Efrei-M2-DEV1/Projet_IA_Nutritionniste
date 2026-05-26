import type { PersonalizedWarning } from "../types";

interface PersonalizedAlertsProps {
  warnings: PersonalizedWarning[];
  suitabilityScore: number;
  recommendation: string;
}

export function PersonalizedAlerts({
  warnings,
  suitabilityScore,
  recommendation,
}: PersonalizedAlertsProps) {
  if (warnings.length === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">✅</span>
          <div>
            <h3 className="font-bold text-green-900 text-lg">
              Compatible avec votre profil !
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Aucun ingrédient incompatible détecté selon vos préférences santé.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-50 border-red-500 text-red-900";
      case "high":
        return "bg-orange-50 border-orange-500 text-orange-900";
      case "medium":
        return "bg-yellow-50 border-yellow-500 text-yellow-900";
      default:
        return "bg-blue-50 border-blue-500 text-blue-900";
    }
  };

  return (
    <div className="space-y-4">
      {/* Score de compatibilité */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold opacity-90">
              Compatibilité Profil
            </h3>
            <p className="text-3xl font-bold mt-1">{suitabilityScore}/100</p>
          </div>
          <div className="text-5xl">
            {suitabilityScore >= 80
              ? "😊"
              : suitabilityScore >= 60
                ? "😐"
                : "😟"}
          </div>
        </div>
        <p className="mt-3 text-sm opacity-95">{recommendation}</p>
      </div>

      {/* Alertes personnalisées */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 text-lg">
          ⚠️ Alertes Personnalisées
        </h3>
        {warnings.map((warning, idx) => (
          <div
            key={idx}
            className={`border-l-4 rounded-xl p-4 ${getLevelColor(warning.level)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{warning.icon}</span>
              <div className="flex-1">
                <h4 className="font-bold">{warning.title}</h4>
                <p className="text-sm mt-1 opacity-90">{warning.message}</p>
                {warning.ingredient && (
                  <p className="text-xs mt-2 font-mono bg-white/50 px-2 py-1 rounded inline-block">
                    {warning.ingredient}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
