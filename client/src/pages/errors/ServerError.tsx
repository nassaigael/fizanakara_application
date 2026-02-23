import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineWarning,
  AiOutlineReload,
  AiOutlineHome
} from 'react-icons/ai';
import Button from '../../components/ui/Button';
import { THEME } from '../../styles/theme';

const ServerError: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg">
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-12 max-w-2xl w-full text-center shadow-2xl">
        <div className="w-32 h-32 bg-red-100 rounded-4xl flex items-center justify-center mx-auto mb-8">
          <AiOutlineWarning className="text-red-500" size={64} />
        </div>

        <h1 className={`${THEME.font.black} text-5xl mb-4 text-red-500`}>500</h1>
        <h2 className="text-xl font-black mb-4">Erreur serveur</h2>
        
        <p className="text-brand-muted font-bold mb-8 max-w-md mx-auto">
          Une erreur inattendue s'est produite sur le serveur.
          Veuillez réessayer plus tard ou contacter l'équipe technique.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2"
          >
            <AiOutlineReload size={18} />
            Réessayer
          </Button>
          <Button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center justify-center gap-2"
          >
            <AiOutlineHome size={18} />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerError;