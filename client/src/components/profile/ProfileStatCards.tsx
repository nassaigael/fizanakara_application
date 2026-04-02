import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../ui/StatCard';
import { AiOutlineCheckCircle, AiOutlineCrown } from 'react-icons/ai';

const ProfileStatCards: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-[0_6px_0_0_#E5E5E5] hover:shadow-[0_8px_0_0_#E5E5E5] hover:translate-y-[-2px] transition-all duration-300">
        <StatCard title="Compte" status={user.verified ? "Vérifié" : "Non vérifié"} icon={<AiOutlineCheckCircle size={24} />} color={user.verified ? "green" : "orange"} />
      </div>
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-[0_6px_0_0_#E5E5E5] hover:shadow-[0_8px_0_0_#E5E5E5] hover:translate-y-[-2px] transition-all duration-300">
        <StatCard title="Rôle" status={user.role} icon={<AiOutlineCrown size={24} />} color="blue" />
      </div>
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-[0_6px_0_0_#E5E5E5] hover:shadow-[0_8px_0_0_#E5E5E5] hover:translate-y-[-2px] transition-all duration-300">
        <StatCard title="Statut" status="Actif" icon={<AiOutlineCheckCircle size={24} />} color="green" />
      </div>
    </div>
  );
};

export default ProfileStatCards;