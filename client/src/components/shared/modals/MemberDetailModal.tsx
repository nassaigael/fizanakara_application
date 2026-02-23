import React, { memo } from 'react';
import {
  AiOutlineClose,
  AiOutlineCalendar,
  AiOutlinePhone,
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineUser,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle
} from 'react-icons/ai';
import { PersonResponseModel } from '../../../lib/types/models/person.models.types';
import Button from '../../ui/Button';
import { calculateAge } from '../../../lib/helper/dateHelpers';
import { getFullName, getInitials } from '../../../lib/helper/stringHelpers';

interface MemberDetailModalProps {
  member: PersonResponseModel;
  onClose: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] border-2 border-b-8 border-gray-100 overflow-hidden shadow-2xl">
        {/* Header avec image de fond */}
        <div className="relative h-32 bg-gradient-to-r from-brand-primary to-orange-500">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors z-10"
            aria-label="Fermer"
          >
            <AiOutlineClose size={20} />
          </button>
          <div className="absolute -bottom-12 left-10">
            <div className="w-24 h-24 bg-white rounded-4xl border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-brand-primary uppercase">
              {getInitials(member.firstName, member.lastName)}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-10 pt-16">
          <div className="mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              {getFullName(member.firstName, member.lastName)}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-brand-primary font-black text-[10px] uppercase italic">
                {member.status === 'WORKER' ? 'Travailleur' : 'Étudiant'}
              </p>
              <span className="text-gray-300">•</span>
              <p className="text-[10px] font-bold text-gray-400">N° {member.sequenceNumber}</p>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-2 gap-4">
            <DetailBox 
              label="Âge" 
              value={`${calculateAge(member.birthDate)} ans`} 
              icon={<AiOutlineCalendar />} 
            />
            <DetailBox 
              label="Contact" 
              value={member.phoneNumber || 'Non renseigné'} 
              icon={<AiOutlinePhone />} 
            />
            <DetailBox 
              label="District" 
              value={member.districtName} 
              icon={<AiOutlineGlobal />} 
            />
            <DetailBox 
              label="Tribu" 
              value={member.tributeName} 
              icon={<AiOutlineTeam />} 
            />
            <DetailBox 
              label="Statut" 
              value={member.isActiveMember ? 'Actif' : 'Inactif'} 
              icon={member.isActiveMember ? 
                <AiOutlineCheckCircle className="text-green-500" /> : 
                <AiOutlineCloseCircle className="text-red-500" />
              } 
            />
            <DetailBox 
              label="Enfants" 
              value={member.childrenCount.toString()} 
              icon={<AiOutlineUser />} 
            />
          </div>

          {/* Parent si existant */}
          {member.parentName && (
            <div className="mt-6 p-4 bg-gray-50 rounded-3xl border-2 border-gray-100">
              <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Parent</p>
              <p className="font-black text-sm uppercase">{member.parentName}</p>
            </div>
          )}

          <div className="mt-8">
            <Button onClick={onClose} className="w-full">
              FERMER
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailBox = memo(({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="bg-gray-50 p-4 rounded-3xl border-2 border-gray-100 flex items-center gap-3">
    {icon && <div className="text-brand-primary opacity-60">{icon}</div>}
    <div>
      <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="font-black text-[10px] uppercase text-gray-800 truncate">{value}</p>
    </div>
  </div>
));

export default memo(MemberDetailModal);