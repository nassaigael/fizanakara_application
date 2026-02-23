import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineWarning,
  AiOutlineArrowLeft,
  AiOutlineHome
} from 'react-icons/ai';
import Button from '../../components/ui/Button';
import { THEME } from '../../styles/theme';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg">
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-12 max-w-2xl w-full text-center shadow-2xl">
        <div className="w-32 h-32 bg-orange-100 rounded-4xl flex items-center justify-center mx-auto mb-8">
          <AiOutlineWarning className="text-orange-500" size={64} />
        </div>

        <h1 className={`${THEME.font.black} text-7xl mb-4 text-brand-primary`}>404</h1>
        <h2 className="text-2xl font-black mb-4">Page introuvable</h2>
        
        <p className="text-brand-muted font-bold mb-8 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
          Vérifiez l'URL ou retournez au tableau de bord.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2"
          >
            <AiOutlineArrowLeft size={18} />
            Retour
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

export default NotFound;