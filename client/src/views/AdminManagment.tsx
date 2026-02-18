// AdminManagment.tsx (corrigé)
import React, { useState } from 'react';
import { AiOutlineUserAdd, AiOutlineGlobal, AiOutlineArrowLeft, AiOutlineControl, AiOutlineTeam } from 'react-icons/ai';
import AdminRegisterForm from '../components/shared/management/AdminRegisterForm';
import ManageOrganization from '../components/shared/management/ManageOrganization';
import AdminList from './AdminList'; // ← import depuis le même dossier
import Button from '../components/ui/Button';
import { THEME } from '../styles/theme';

const AdminManagement: React.FC = () => {
  const [view, setView] = useState<'menu' | 'admins' | 'org' | 'list'>('menu');

  return (
    <div className="flex flex-col gap-8 p-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-text text-white rounded-2xl shadow-lg border-b-4 border-black/30">
            <AiOutlineControl size={32} />
          </div>
          <div>
            <h1 className={`${THEME.font.black} text-3xl tracking-tighter`}>Console Maître</h1>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mt-1">Configuration Système</p>
          </div>
        </div>
        {view !== 'menu' && (
          <Button variant="secondary" onClick={() => setView('menu')} className="py-3! px-5! rounded-xl! text-[10px]! flex items-center gap-2">
            <AiOutlineArrowLeft size={16} /> Retour au menu
          </Button>
        )}
      </div>

      {view === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <MenuCard
            icon={<AiOutlineUserAdd />}
            title="Créer Admin"
            onClick={() => setView('admins')}
            color="bg-brand-primary"
          />
          <MenuCard
            icon={<AiOutlineTeam />}
            title="Liste des Admins"
            onClick={() => setView('list')}
            color="bg-blue-500"
          />
          <MenuCard
            icon={<AiOutlineGlobal />}
            title="Districts & Tribus"
            onClick={() => setView('org')}
            color="bg-orange-500"
          />
        </div>
      ) : view === 'admins' ? (
        <AdminRegisterForm onSuccess={() => setView('list')} />
      ) : view === 'list' ? (
        <AdminList />
      ) : (
        <ManageOrganization />
      )}
    </div>
  );
};

const MenuCard: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void; color: string }> = ({
  icon,
  title,
  onClick,
  color,
}) => (
  <button
    onClick={onClick}
    className="group p-8 bg-white rounded-[2.5rem] border-2 border-brand-border border-b-8 flex flex-col items-center gap-4 hover:shadow-xl transition-all"
  >
    <div className={`w-20 h-20 ${color} rounded-3xl flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <span className="font-black text-sm uppercase">{title}</span>
  </button>
);

export default AdminManagement;