import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import PasswordModal from '../profile/PasswordModal';

const SecuritySection: React.FC = () => {
  const { updateProfile } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border-2 border-b-8 border-gray-200 p-5 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider flex items-center gap-2 mb-2">
            SÉCURITÉ & MOT DE PASSE
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm">
            Gérez votre mot de passe et les paramètres de sécurité de votre compte.
          </p>
        </div>
        <Button
          onClick={() => setIsPasswordModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-black w-full sm:w-auto border-2 border-[#E51A1A] text-[#E51A1A] hover:bg-[#E51A1A] hover:text-white transition-all duration-200"
        >
          CHANGER LE MOT DE PASSE
        </Button>
      </div>
      <PasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} onSave={async (newPassword) => { await updateProfile({ password: newPassword }); }} />
    </div>
  );
};

export default SecuritySection;