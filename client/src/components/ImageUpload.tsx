import { useCallback, useEffect, useRef, useState } from "react";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  isLoading: boolean;
}

export function ImageUpload({ onImageSelect, isLoading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // ✅ Fonction pour arrêter la caméra (déclarée avant useEffect)
  const stopCamera = useCallback(() => {
    console.log("⏹️ Arrêt de la caméra");

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("🛑 Track arrêté:", track.kind);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onerror = null;
    }

    setShowCamera(false);
    setIsVideoReady(false);
    setCameraError(null);
  }, []);

  // Nettoyer le stream vidéo quand le composant est démonté
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // ✅ NOUVELLE FONCTION : Créer une preview depuis un File
   const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Impossible de lire l'image"));
        }
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    try {
      const preview = await createImagePreview(file);
      onImageSelect(file, preview);
    } catch (error) {
      console.error("Erreur lors de la prévisualisation:", error);
      alert("Erreur lors du chargement de l'image");
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    event.target.value = "";
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const openGallery = () => {
    console.log("📂 Ouverture de la galerie");
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    console.log("📸 Démarrage de la caméra...");
    setCameraError(null);
    setIsVideoReady(false);
    setShowCamera(true); // Afficher le modal immédiatement

    try {
      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Caméra arrière sur mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      console.log(
        "✅ Stream obtenu:",
        stream.getVideoTracks().length,
        "pistes vidéo",
      );

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Attendre que la vidéo soit prête
        videoRef.current.onloadedmetadata = () => {
          console.log("📹 Métadonnées vidéo chargées");
          console.log(
            "📐 Dimensions vidéo:",
            videoRef.current?.videoWidth,
            "x",
            videoRef.current?.videoHeight,
          );
          videoRef.current
            ?.play()
            .then(() => {
              console.log("▶️ Lecture vidéo démarrée");
              setIsVideoReady(true);
            })
            .catch((err) => {
              console.error("❌ Erreur lecture vidéo:", err);
              setCameraError(
                "Impossible de démarrer la lecture vidéo: " + err.message,
              );
            });
        };

        videoRef.current.onerror = (err) => {
          console.error("❌ Erreur élément vidéo:", err);
          setCameraError("Erreur de l'élément vidéo");
        };
      }
    } catch (error) {
      console.error("❌ Erreur caméra:", error);

      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          setCameraError(
            "Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres du navigateur.",
          );
        } else if (error.name === "NotFoundError") {
          setCameraError("Aucune caméra détectée sur cet appareil.");
        } else if (error.name === "NotReadableError") {
          setCameraError(
            "La caméra est déjà utilisée par une autre application.",
          );
        } else {
          setCameraError(
            "Impossible d'accéder à la caméra. Erreur: " + error.message,
          );
        }
      } else {
        setCameraError("Une erreur est survenue lors de l'accès à la caméra.");
      }
    }
  };

  const capturePhoto = async () => {
    console.log("📷 Capture de la photo...");

    if (!videoRef.current || !canvasRef.current) {
      console.error("❌ Références vidéo ou canvas manquantes");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Vérifier que la vidéo est bien en cours de lecture
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      console.error("❌ Vidéo pas prête, readyState:", video.readyState);
      alert("La vidéo n'est pas encore prête. Attendez quelques secondes.");
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      console.error("❌ Impossible d'obtenir le contexte 2D du canvas");
      return;
    }

    // Définir les dimensions du canvas basées sur la vidéo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    console.log("📐 Dimensions capture:", canvas.width, "x", canvas.height);

    // Dessiner l'image vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en blob puis en File
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.error("❌ Erreur lors de la conversion en blob");
          return;
        }

        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        console.log("✅ Photo capturée:", file.name, file.size, "bytes");

        // Arrêter la caméra
        stopCamera();

        // Envoyer l'image pour analyse
        await handleFile(file);
      },
      "image/jpeg",
      0.95,
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Analyse en cours...
            </h3>
            <p className="text-gray-600 text-center">
              L'IA analyse votre image, veuillez patienter
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Interface principale */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500 rounded-full mb-4 shadow-lg">
              <span className="text-4xl" style={{marginTop: "-14px"}}>📸</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Analysez vos produits
            </h2>
            <p className="text-gray-600 text-lg">
              Prenez en photo ou importez une image d'étiquette alimentaire
            </p>
          </div>

          {/* Erreur caméra */}
          {cameraError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">
                    Erreur caméra
                  </h4>
                  <p className="text-sm text-red-800">{cameraError}</p>
                  <button
                    onClick={() => setCameraError(null)}
                    className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Zone de drag & drop - Desktop uniquement */}
          <div
            className="hidden md:block mb-6 border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center transition-all hover:border-orange-400 hover:bg-orange-50/50"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              borderColor: dragActive ? "#fb923c" : undefined,
              backgroundColor: dragActive
                ? "rgba(251, 146, 60, 0.1)"
                : undefined,
            }}
          >
            <div className="flex flex-col items-center">
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600 font-medium mb-2">
                Glissez-déposez une image ici
              </p>
              <p className="text-sm text-gray-500">
                ou utilisez les boutons ci-dessous
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bouton Appareil Photo */}
            <button
              onClick={startCamera}
              type="button"
              className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation min-h-[120px] flex flex-col items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold block">
                  Prendre une photo
                </span>
                <span className="text-sm opacity-90 block mt-1">
                  📷 Webcam / Caméra
                </span>
              </div>
            </button>

            {/* Bouton Galerie */}
            <button
              onClick={openGallery}
              type="button"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all active:scale-95 touch-manipulation min-h-[120px] flex flex-col items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold block">
                  Choisir une image
                </span>
                <span className="text-sm opacity-90 block mt-1">
                  🖼️ Depuis les fichiers
                </span>
              </div>
            </button>
          </div>

          {/* Input GALERIE */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            aria-label="Choisir une image depuis la galerie"
          />

          {/* Informations */}
          <div className="mt-8 p-4 md:p-6 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Conseils pour une meilleure analyse
                </h4>
                <ul className="text-sm text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>
                      Assurez-vous que l'étiquette est bien éclairée et nette
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Cadrez uniquement la liste des ingrédients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Évitez les reflets et les ombres</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span className="font-medium">
                      📸 Le navigateur demandera l'autorisation d'accès à la
                      caméra
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CAMÉRA - Plein écran avec z-index élevé */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Canvas caché pour la capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Conteneur vidéo */}
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 safe-area-top">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-bold">
                  {isVideoReady ? "📸 Cadrez l'étiquette" : "⏳ Chargement..."}
                </h3>
                <button
                  onClick={stopCamera}
                  type="button"
                  className="w-10 h-10 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Vidéo - Prend tout l'espace */}
            <div className="flex-1 relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Indicateur de chargement */}
              {!isVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="text-white text-lg font-medium">
                      Démarrage de la caméra...
                    </p>
                    <p className="text-white/70 text-sm mt-2">
                      Veuillez autoriser l'accès à la caméra
                    </p>
                  </div>
                </div>
              )}

              {/* Overlay avec guides - Visible seulement si vidéo prête */}
              {isVideoReady && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Guide de cadrage */}
                  <div className="absolute inset-8 md:inset-16 border-4 border-white/60 rounded-3xl border-dashed shadow-2xl"></div>

                  {/* Coins de cadrage */}
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-32 left-8 w-12 h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-32 right-8 w-12 h-12 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>

                  {/* Instructions */}
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black/80 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-sm">
                      <p className="text-sm md:text-base font-bold">
                        📋 Cadrez la liste des ingrédients
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons de contrôle */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8 safe-area-bottom">
              <div className="flex items-center justify-center gap-6">
                {/* Bouton Capturer */}
                <button
                  onClick={capturePhoto}
                  type="button"
                  disabled={!isVideoReady}
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full shadow-2xl flex items-center justify-center transition-all ${
                    isVideoReady
                      ? "bg-white hover:scale-110 active:scale-95 cursor-pointer"
                      : "bg-white/30 cursor-not-allowed"
                  }`}
                >
                  <div className="absolute inset-2 border-4 border-orange-500 rounded-full"></div>
                  <span className="text-4xl md:text-5xl">📸</span>
                </button>
              </div>

              {/* Aide */}
              {isVideoReady && (
                <p className="text-white text-center text-sm mt-4 opacity-90">
                  💡 Appuyez sur le bouton pour capturer l'image
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
