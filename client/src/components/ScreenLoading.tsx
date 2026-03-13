import React from 'react';
import { THEME } from '../styles/theme';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface ScreenLoadingProps {
  message?: string;
  subMessage?: string;
}

export const ScreenLoading: React.FC<ScreenLoadingProps> = ({ 
  message = 'Chargement en cours',
  subMessage = 'Veuillez patienter...'
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-brand-bg via-brand-bg to-brand-bg/95 flex flex-col items-center justify-center z-[9999] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-10 right-20 w-72 h-72 bg-brand-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-brand-secondary rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-brand-bg flex items-center justify-center">
              <AiOutlineLoading3Quarters 
                size={48} 
                className="text-brand-primary animate-spin" 
              />
            </div>
          </div>
          
          <div className="absolute -inset-2 rounded-full border-2 border-brand-primary/20 animate-pulse"></div>
          <div className="absolute -inset-4 rounded-full border border-brand-primary/10 animate-spin" style={{animationDuration: '3s'}}></div>
        </div>

        <div className="text-center space-y-3">
          <h2 className={`${THEME.font.h1} text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary animate-pulse`}>
            {message}
          </h2>
          <p className={`${THEME.font.muted} text-sm md:text-base`}>
            {subMessage}
          </p>
        </div>

        <div className="flex gap-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-primary/60"
              style={{
                animation: `bounce 1.4s infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          ))}
        </div>

        <p className="text-xs mt-8 text-brand-muted animate-pulse">
          Fyza • Nakara
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default ScreenLoading;
