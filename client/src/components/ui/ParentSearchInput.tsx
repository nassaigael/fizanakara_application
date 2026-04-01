import React, { useState, useMemo } from 'react';
import { AiOutlineSearch, AiOutlineUser, AiOutlineCheck, AiOutlineCrown, AiOutlineStar } from 'react-icons/ai';
import { PersonResponse, MemberStatus } from '../../lib/types';
import { getImageUrl } from '../../lib/constant/constant';

interface ParentSearchInputProps {
  members: PersonResponse[];
  value: string;
  onChange: (id: string, name: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  excludeCurrentMemberId?: string; // Pour exclure le membre en cours d'édition
}

const ParentSearchInput: React.FC<ParentSearchInputProps> = ({
  members,
  value,
  onChange,
  error,
  disabled,
  required,
  excludeCurrentMemberId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Trouver le parent sélectionné
  const selectedParent = useMemo(() => {
    if (!value) return null;
    return members.find(m => m.id === value);
  }, [members, value]);

  // Filtrer les membres pour la recherche - Afficher TOUS les membres sauf celui en cours d'édition
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const searchLower = searchTerm.toLowerCase();
    return members.filter(member => {
      // Exclure le membre en cours d'édition (pour éviter de se choisir soi-même)
      if (excludeCurrentMemberId && member.id === excludeCurrentMemberId) return false;

      // Rechercher par ID, nom, prénom, téléphone
      const matchesId = member.id.toLowerCase().includes(searchLower);
      const matchesFirstName = member.firstName.toLowerCase().includes(searchLower);
      const matchesLastName = member.lastName.toLowerCase().includes(searchLower);
      const matchesFullName = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchLower);
      const matchesPhone = member.phoneNumber?.toLowerCase().includes(searchLower);

      return matchesId || matchesFirstName || matchesLastName || matchesFullName || matchesPhone;
    }).slice(0, 15); // Limiter à 15 résultats
  }, [members, searchTerm, excludeCurrentMemberId]);

  const handleSelectParent = (parent: PersonResponse) => {
    onChange(parent.id, `${parent.firstName} ${parent.lastName}`);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    onChange('', '');
    setSearchTerm('');
  };

  // Fonction pour obtenir l'URL de l'image ou les initiales
  const getParentAvatar = (parent: PersonResponse) => {
    if (parent.imageUrl) {
      return getImageUrl(parent.imageUrl, 'member');
    }
    return null;
  };

  // Fonction pour obtenir les initiales
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Déterminer le type de membre (pour l'affichage)
  const getMemberTypeInfo = (member: PersonResponse) => {
    if (member.parentId && member.childrenCount > 0) {
      return {
        label: 'Parent & Enfant',
        icon: <AiOutlineCrown size={10} />,
        color: 'text-purple-600 bg-purple-100'
      };
    }
    if (member.parentId) {
      return {
        label: 'Enfant',
        icon: <AiOutlineStar size={10} />,
        color: 'text-blue-600 bg-blue-100'
      };
    }
    if (member.childrenCount > 0) {
      return {
        label: 'Parent',
        icon: <AiOutlineCrown size={10} />,
        color: 'text-green-600 bg-green-100'
      };
    }
    return {
      label: 'Membre',
      icon: <AiOutlineUser size={10} />,
      color: 'text-gray-600 bg-gray-100'
    };
  };

  return (
    <div className="relative">
      <label className="block text-[9px] font-black uppercase tracking-wider text-gray-500 mb-2">
        Parent {required && <span className="text-red-500">*</span>}
      </label>

      {selectedParent ? (
        // Affichage du parent sélectionné
        <div className="bg-white border-2 border-brand-primary rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-primary/10 flex items-center justify-center">
              {getParentAvatar(selectedParent) ? (
                <img
                  src={getParentAvatar(selectedParent)!}
                  alt={selectedParent.firstName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(selectedParent.firstName, selectedParent.lastName);
                    (e.target as HTMLImageElement).parentElement!.classList.add('text-brand-primary', 'font-black', 'text-sm');
                  }}
                />
              ) : (
                <span className="text-brand-primary font-black text-sm">
                  {getInitials(selectedParent.firstName, selectedParent.lastName)}
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm">
                {selectedParent.firstName} {selectedParent.lastName}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span className="font-mono">{selectedParent.id}</span>
                <span>•</span>
                <span>{selectedParent.status === MemberStatus.STUDENT ? 'Étudiant' : 'Travailleur'}</span>
                {selectedParent.isActiveMember && (
                  <span className="text-green-500">• Actif</span>
                )}
                {selectedParent.childrenCount > 0 && (
                  <span className="text-purple-500">• {selectedParent.childrenCount} enfant{selectedParent.childrenCount > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 text-xs font-bold uppercase text-gray-400 hover:text-red-500 transition-colors"
            disabled={disabled}
          >
            Changer
          </button>
        </div>
      ) : (
        // Champ de recherche
        <div className="relative">
          <div className="relative">
            <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              placeholder="Rechercher par ID, nom ou numéro de téléphone..."
              className={`
                w-full pl-11 pr-4 py-3 rounded-xl border-2 
                ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-brand-primary'}
                text-sm font-medium outline-none transition-all
                disabled:bg-gray-100 disabled:cursor-not-allowed
              `}
              disabled={disabled}
            />
          </div>

          {/* Dropdown de recherche */}
          {isOpen && searchTerm && filteredMembers.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {filteredMembers.map(member => {
                const avatarUrl = member.imageUrl ? getImageUrl(member.imageUrl, 'member') : null;
                const isSelected = value === member.id;
                const memberType = getMemberTypeInfo(member);

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleSelectParent(member)}
                    className={`
                      w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors
                      ${isSelected ? 'bg-brand-primary/5' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={member.firstName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(member.firstName, member.lastName);
                              (e.target as HTMLImageElement).parentElement!.classList.add('text-gray-500', 'font-black', 'text-sm');
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 font-black text-sm">
                            {getInitials(member.firstName, member.lastName)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm">
                            {member.firstName} {member.lastName}
                          </p>
                          {isSelected && (
                            <AiOutlineCheck className="text-green-500" size={16} />
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className="text-[9px] font-mono text-gray-400">
                            {member.id}
                          </span>
                          <span className="text-[9px] text-gray-400">•</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${memberType.color}`}>
                            {memberType.icon}
                            <span className="ml-1">{memberType.label}</span>
                          </span>
                          {member.status === MemberStatus.WORKER ? (
                            <span className="text-[9px] text-purple-500 font-bold">Travailleur</span>
                          ) : (
                            <span className="text-[9px] text-amber-500 font-bold">Étudiant</span>
                          )}
                          {member.isActiveMember && (
                            <span className="text-[9px] text-green-500 font-bold">Actif</span>
                          )}
                          {member.childrenCount > 0 && (
                            <span className="text-[9px] text-purple-500 font-bold">
                              {member.childrenCount} enfant{member.childrenCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {isOpen && searchTerm && filteredMembers.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 text-center">
              <p className="text-sm text-gray-400">Aucun membre trouvé</p>
              <p className="text-[10px] text-gray-400 mt-1">
                Essayez de rechercher par ID, nom ou numéro de téléphone
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">
          {error}
        </p>
      )}

      <div className="flex items-start gap-2 mt-2 text-gray-400">
        <AiOutlineUser size={12} />
        <p className="text-[8px] font-bold uppercase leading-tight">
          Recherchez un membre par ID, nom ou numéro de téléphone pour le définir comme parent
        </p>
      </div>
    </div>
  );
};

export default ParentSearchInput;