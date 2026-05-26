import { useEffect, useState } from "react";
import {
  COMMON_ALLERGENS,
  //   HealthProfile,
  loadHealthProfile,
  resetHealthProfile,
  saveHealthProfile,
} from "../services/healthProfile";
import type { HealthProfile } from "../types";

interface HealthProfileSetupProps {
  onSave?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function HealthProfileSetup({ onSave, onOpen, onClose }: HealthProfileSetupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<HealthProfile>(loadHealthProfile());
useEffect(() => {
    if (isOpen) onOpen?.();
   else onClose?.();
  }, [isOpen, onOpen, onClose]);

  const handleSave = () => {
    saveHealthProfile(profile);
    setIsOpen(false);
    onSave?.();
    alert("✅ Profil santé enregistré avec succès !");
  };

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser votre profil ?")) {
      resetHealthProfile();
      setProfile(loadHealthProfile());
    }
  };

  const toggleAllergen = (allergenId: string) => {
    setProfile((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter((a) => a !== allergenId)
        : [...prev.allergens, allergenId],
    }));
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir le profil */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute right-0 bottom-0 z-60 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform pointer-events-auto"
      >
        👤
      </button>

      {/* Modal de configuration */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">👤 Mon Profil Santé</h2>
                  <p className="text-sm opacity-90 mt-1">
                    Personnalisez vos analyses
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Nom du profil */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📝 Nom du profil
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Mon profil santé"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Conditions médicales */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  🏥 Conditions Médicales
                </h3>
                <div className="space-y-2">
                  {[
                    { key: "diabetes", label: "Diabète", icon: "💉" },
                    { key: "hypertension", label: "Hypertension", icon: "🩺" },
                    {
                      key: "obesity",
                      label: "Obésité / Contrôle du poids",
                      icon: "⚖️",
                    },
                  ].map(({ key, label, icon }) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={profile[key as keyof HealthProfile] as boolean}
                        onChange={(e) =>
                          setProfile({ ...profile, [key]: e.target.checked })
                        }
                        className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="text-2xl">{icon}</span>
                      <span className="font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergènes */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  🚨 Allergies & Intolérances
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_ALLERGENS.map((allergen) => (
                    <label
                      key={allergen.id}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        profile.allergens.includes(allergen.id)
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-red-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={profile.allergens.includes(allergen.id)}
                        onChange={() => toggleAllergen(allergen.id)}
                        className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {allergen.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Régime alimentaire */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  🍽️ Régime Alimentaire
                </h3>
                <select
                  value={profile.diet}
                  onChange={(e) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setProfile({ ...profile, diet: e.target.value as any })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="none">Aucun régime spécifique</option>
                  <option value="vegetarian">🌱 Végétarien</option>
                  <option value="vegan">🥗 Vegan</option>
                  <option value="halal">☪️ Halal</option>
                  <option value="kosher">✡️ Kasher</option>
                  <option value="gluten-free">🌾 Sans Gluten</option>
                </select>
              </div>

              {/* Préférences */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  ⚙️ Préférences
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.avoidAdditives}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          avoidAdditives: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                    />
                    <span className="text-2xl">⚗️</span>
                    <span className="font-medium text-gray-700">
                      Éviter les additifs controversés
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.avoidPalmOil}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          avoidPalmOil: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                    />
                    <span className="text-2xl">🌴</span>
                    <span className="font-medium text-gray-700">
                      Éviter l'huile de palme
                    </span>
                  </label>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  ✅ Enregistrer
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  🔄 Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
