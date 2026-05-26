import { useEffect, useState } from "react";
import { AnalysisResults } from "./components/AnalysisResults";
import { HealthProfileSetup } from "./components/HealthProfileSetup";
import { Help } from "./components/Help";
import { History } from "./components/History";
import { ImageUpload } from "./components/ImageUpload";
import { PersonalizedAlerts } from "./components/PersonalizedAlerts";
import { analyzeImage } from "./services/api";
import { hasActiveProfile, loadHealthProfile } from "./services/healthProfile";
import { clearHistory, getHistory, saveToHistory } from "./services/history";
import type { AnalysisResult } from "./types";

type View = "upload" | "results" | "history";

function App() {
  const [currentView, setCurrentView] = useState<View>("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // 🆕 État pour le profil santé
  const profileActive = hasActiveProfile();
  const profile = loadHealthProfile();

  useEffect(() => {
    loadHistory();
    // Ajouter un exemple d'historique si vide (pour test)
    const existingHistory = getHistory();
    if (existingHistory.length === 0) {
      const exampleResult: AnalysisResult = {
        id: "example-1",
        timestamp: Date.now() - 86400000, // Il y a 1 jour
        extractedText:
          "Eau, Sucre, Farine de blé, Huile de palme, Levure, Sel, Conservateur E202, Émulsifiant E471, Agent de traitement de la farine E300",
        ingredients: [
          {
            name: "Eau",
            category: "other",
            explanation: "Ingrédient de base, aucun risque particulier.",
            riskLevel: "none",
          },
          {
            name: "Sucre",
            category: "other",
            explanation:
              "Consommé avec modération, peut contribuer à l'obésité et au diabète.",
            riskLevel: "low",
          },
          {
            name: "Farine de blé",
            category: "allergen",
            explanation:
              "Contient du gluten. Allergène majeur pour les personnes intolérantes.",
            riskLevel: "high",
          },
          {
            name: "Huile de palme",
            category: "other",
            explanation:
              "Riche en acides gras saturés. Impact environnemental controversé.",
            riskLevel: "medium",
          },
          {
            name: "Conservateur E202",
            category: "preservative",
            explanation:
              "Sorbate de potassium. Généralement considéré comme sûr, mais peut causer des irritations chez certaines personnes sensibles.",
            riskLevel: "low",
          },
          {
            name: "Émulsifiant E471",
            category: "additive",
            explanation:
              "Mono et diglycérides d'acides gras. Additif alimentaire courant, généralement bien toléré.",
            riskLevel: "low",
          },
          {
            name: "Agent de traitement E300",
            category: "additive",
            explanation:
              "Acide ascorbique (vitamine C). Utilisé comme antioxydant, sans risque connu.",
            riskLevel: "none",
          },
        ],
        score: 65,
        grade: "C",
        summary: {
          positives: [
            "Contient des ingrédients naturels comme l'eau et la farine de blé.",
            "Utilisation d'agent de traitement naturel (E300).",
          ],
          warnings: [
            "Présence de sucre ajouté pouvant affecter la santé métabolique.",
            "Contient du gluten, allergène majeur pour certaines personnes.",
            "Utilisation d'huile de palme, à consommer avec modération.",
          ],
          recommendations: [
            "Réduire la quantité de sucre pour une meilleure santé.",
            "Considérer des alternatives à l'huile de palme.",
            "Vérifier les allergies au gluten avant consommation.",
          ],
        },
      };
      saveToHistory(exampleResult);
      setHistory([exampleResult]);
    }
  }, []);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  const handleImageSelect = async (file: File) => {
    setError(null);
    setIsAnalyzing(true);

    try {
      const apiResponse = await analyzeImage(file);

      console.log("📦 Réponse API complète:", apiResponse);
      console.log("📋 Summary reçu:", apiResponse.analysis.summary);

     

      // Transformer ApiResponse en AnalysisResult
      const result: AnalysisResult = {
        id: `analysis-${Date.now()}`,
        timestamp: Date.now(),
        extractedText: apiResponse.extractedText,
        ingredients: apiResponse.analysis.ingredients,
        score: apiResponse.analysis.score,
        grade: apiResponse.analysis.grade,
        summary: apiResponse.analysis.summary,
        // 🆕 Inclure les données personnalisées si présentes
        
      };

      setAnalysisResult(result);
      saveToHistory(result);
      loadHistory();
      setCurrentView("results");
      
    } catch (err) {
      console.error("Erreur lors de l'analyse:", err);
      setError(
        "Erreur lors de l'analyse. Veuillez réessayer ou vérifier que le serveur est démarré.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setCurrentView("upload");
  };

  const handleViewHistory = () => {
    loadHistory();
    setCurrentView("history");
  };

  const handleSelectFromHistory = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentView("results");
  };

  const handleClearHistory = () => {
    if (confirm("Êtes-vous sûr de vouloir effacer tout l'historique ?")) {
      clearHistory();
      loadHistory();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-yellow-400 to-amber-400 pb-24 md:pb-0 safe-area-top safe-area-bottom">
  
      {/* Navigation mobile fixe en bas - cachée quand modal profil ouverte */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 safe-area-bottom md:hidden ${profileModalOpen ? 'hidden' : ''}`}>
      
        <div className="grid grid-cols-2 h-24 bg-black/40 backdrop-blur-xl">
          <button
            onClick={handleNewAnalysis}
            className={`flex flex-col items-center justify-center gap-2 transition-all relative ${
              currentView === "upload"
                ? "text-white"
                : "text-white/70 active:text-white active:bg-white/10"
            }`}
          >
            {currentView === "upload" && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-white rounded-b-full" />
            )}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentView === "upload" ? "bg-white/30" : "bg-white/10"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="text-xs font-bold">Nouvelle</span>
          </button>
          <button
            onClick={handleViewHistory}
            className={`flex flex-col items-center justify-center gap-2 transition-all relative ${
              currentView === "history"
                ? "text-white"
                : "text-white/70 active:text-white active:bg-white/10"
            }`}
          >
            {currentView === "history" && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-white rounded-b-full" />
            )}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentView === "history" ? "bg-white/30" : "bg-white/10"
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <span className="text-xs font-bold">Historique</span>
          </button>
        </div>
      </nav>

      {/* Bouton aide flottant - mobile seulement, masqué sur historique */}
      {currentView !== "history" && (
        <button
          onClick={() => setShowHelp(true)}
          className="fixed top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white z-40 active:bg-white/30 transition-all touch-manipulation md:hidden shadow-lg"
          aria-label="Aide"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      )}

      {/* Header desktop seulement */}
      <header className="hidden md:block bg-white/90 backdrop-blur-sm shadow-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg font-bold">🔍</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Analyseur d'Ingrédients
                </h1>
                {/* 🆕 Afficher le profil actif sur desktop */}
                {profileActive && (
                  <p className="text-xs text-purple-600 font-medium mt-0.5">
                    👤 Profil: {profile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelp(true)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Aide
              </button>
              <button
                onClick={handleNewAnalysis}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === "upload"
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Nouvelle analyse
              </button>
              <button
                onClick={handleViewHistory}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  currentView === "history"
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Historique
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Fullscreen sur mobile */}
      <main className="min-h-screen flex flex-col md:max-w-7xl md:mx-auto md:px-4 md:py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Erreur</h3>
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Assurez-vous que le serveur backend est démarré et accessible.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentView === "upload" && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pt-8 pb-32 md:pb-8">
            <ImageUpload
              onImageSelect={handleImageSelect}
              isLoading={isAnalyzing}
            />
          </div>
        )}

        {currentView === "results" && analysisResult && (
          <div className="flex-1 space-y-4 md:space-y-6 px-4 pt-4 pb-32 md:pb-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <button
                onClick={handleNewAnalysis}
                className="flex items-center gap-2 px-6 py-4 bg-white/20 backdrop-blur-md active:bg-white/30 text-white rounded-[2rem] font-bold transition-colors touch-manipulation min-h-[56px] shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="text-lg">Retour</span>
              </button>
            </div>

            {/* 🆕 Alertes personnalisées (si profil actif) - Mobile & Desktop */}
            {analysisResult.personalizedWarnings &&
              analysisResult.personalizedWarnings.length > 0 && (
                <PersonalizedAlerts
                  warnings={analysisResult.personalizedWarnings}
                  suitabilityScore={analysisResult.suitabilityScore || 0}
                  recommendation={analysisResult.profileRecommendation || ""}
                />
              )}

            {/* Résultats normaux */}
            <AnalysisResults result={analysisResult} />
          </div>
        )}

        {currentView === "history" && (
          <div className="flex-1 space-y-4 md:space-y-6 px-4 pt-4 pb-32 md:pb-8 overflow-y-auto">
            <History
              history={history}
              onSelectResult={handleSelectFromHistory}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}
      </main>

      {/* Footer - Masqué sur mobile (navigation en bas) */}
      <footer className="hidden md:block mt-16 bg-white/80 backdrop-blur-sm border-t border-orange-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Application d'analyse d'ingrédients - Projet Web IA
          </p>
          <p className="text-xs text-gray-500">
            Cette application est fournie à titre informatif uniquement. Elle ne
            remplace pas un avis médical ou professionnel.
          </p>
        </div>
      </footer>

      {/* Modal d'aide */}
      {showHelp && <Help onClose={() => setShowHelp(false)} />}

      {/* 🆕 Bouton profil santé flottant - Mobile & Desktop */}
       {/* 🆕 Bouton profil santé flottant - Mobile & Desktop (unique et au-dessus de la nav) */}
      <div className="fixed right-4 bottom-36 z-60 pointer-events-auto md:static">
        <HealthProfileSetup onSave={() => window.location.reload()}
        onOpen={() => setProfileModalOpen(true)}
        onClose={() => setProfileModalOpen(false)} />
     </div>
      
    </div>
  );
}

export default App;
