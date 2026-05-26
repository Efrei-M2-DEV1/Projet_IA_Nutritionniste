interface HelpProps {
  onClose: () => void;
}

export const Help = ({ onClose }: HelpProps) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 safe-area-bottom safe-area-top"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500 rounded-[3rem] md:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp">
        <div className="sticky top-0 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 backdrop-blur-sm border-b border-white/20 px-6 py-5 flex items-center justify-between rounded-t-[3rem] md:rounded-t-3xl">
          <h2 className="text-2xl font-black text-white">Comment ça marche ?</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30 backdrop-blur-sm transition-colors touch-manipulation"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl mb-3">📸</div>
              <h3 className="text-xl font-black text-white mb-2">1. Capturez</h3>
              <p className="text-base text-white/90 leading-relaxed font-medium">
                Prenez une photo de l'étiquette ou sélectionnez une image depuis votre galerie
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-xl font-black text-white mb-2">2. Analysez</h3>
              <p className="text-base text-white/90 leading-relaxed font-medium">
                Notre IA extrait le texte et analyse chaque ingrédient automatiquement
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-3">📊</div>
              <h3 className="text-xl font-black text-white mb-2">3. Comprenez</h3>
              <p className="text-base text-white/90 leading-relaxed font-medium">
                Recevez une note, des explications claires et des recommandations personnalisées
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/20">
            <p className="text-sm text-white/80 text-center leading-relaxed">
              <span className="text-xl">⚠️</span> <strong>Important:</strong> Cette analyse est fournie à titre informatif uniquement. 
              Elle ne remplace pas un avis médical ou professionnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
