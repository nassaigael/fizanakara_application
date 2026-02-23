import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineLock,
  AiOutlineArrowLeft,
  AiOutlineLogin
} from 'react-icons/ai';
import Button from '../../components/ui/Button';
import { THEME } from '../../styles/theme';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-bg">
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-12 max-w-2xl w-full text-center shadow-2xl">
        <div className="w-32 h-32 bg-red-100 rounded-4xl flex items-center justify-center mx-auto mb-8">
          <AiOutlineLock className="text-red-500" size={64} />
        </div>

        <h1 className={`${THEME.font.black} text-5xl mb-4 text-red-500`}>Accès Refusé</h1>
        <h2 className="text-xl font-black mb-4">Vous n'avez pas les droits nécessaires</h2>
        
        <p className="text-brand-muted font-bold mb-8 max-w-md mx-auto">
          Cette section est réservée aux administrateurs. Si vous pensez qu'il s'agit d'une erreur,
          contactez votre super administrateur.
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
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2"
          >
            <AiOutlineLogin size={18} />
            Se reconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;