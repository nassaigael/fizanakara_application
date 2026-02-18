// components/ui/LoadingScreen.tsx
import React, { useState, useEffect } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

// Liste de messages dynamiques
const messages = [
  "Préparation de votre espace...",
  "Chargement des données...",
  "Connexion sécurisée...",
  "Presque prêt...",
  "Bienvenue chez Fizanakara !",
];

// Images aléatoires (à remplacer par vos propres URLs)
const images = [
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
];

const LoadingScreen: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Rotation des messages toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Rotation des images toutes les 4 secondes avec effet de fondu
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 500); // demi-seconde de fondu
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 relative overflow-hidden">
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            fade ? 'opacity-30' : 'opacity-10'
          }`}
          style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay sombre pour lisibilité */}
      </div>

      {/* Contenu central */}
      <div className="relative z-10 text-center text-white px-4">
        {/* Logo ou icône animée */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-3xl border-2 border-white/30 flex items-center justify-center animate-pulse">
            <AiOutlineLoading3Quarters className="text-white text-5xl animate-spin" />
          </div>
        </div>

        {/* Message dynamique */}
        <div className="transition-opacity duration-500 ease-in-out" key={currentMessageIndex}>
          <p className="text-2xl font-black uppercase tracking-widest mb-4 drop-shadow-lg">
            {messages[currentMessageIndex]}
          </p>
        </div>

        {/* Barre de progression (facultative) */}
        <div className="w-64 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-white rounded-full animate-loading-bar" />
        </div>

        <p className="text-sm font-medium mt-8 opacity-80">Fizanakara • Gestion des membres</p>
      </div>

      {/* Animation CSS pour la barre de progression */}
      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loadingBar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;