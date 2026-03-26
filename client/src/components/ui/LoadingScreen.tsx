import React, { useState, useEffect } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const messages = [
    "Préparation de votre espace...",
    "Chargement des données...",
    "Connexion sécurisée...",
    "Presque prêt...",
    "Bienvenue chez Fizanakara !",
];

const LoadingScreen: React.FC = () => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-linear-to-br from-brand-primary to-orange-500">
            <div className="text-center text-white px-4">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-lg rounded-3xl border-2 border-white/30 flex items-center justify-center animate-pulse">
                        <AiOutlineLoading3Quarters className="text-white text-4xl sm:text-5xl animate-spin" />
                    </div>
                </div>

                <p className="text-xl sm:text-2xl font-black uppercase tracking-widest mb-6 drop-shadow-lg">
                    {messages[currentMessageIndex]}
                </p>

                <div className="w-48 sm:w-64 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-white rounded-full animate-loading-bar" />
                </div>

                <p className="text-xs sm:text-sm font-medium mt-8 opacity-80">
                    Fizanakara • Gestion des membres
                </p>
            </div>

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