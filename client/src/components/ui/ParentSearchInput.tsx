import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AiOutlineSearch, AiOutlineUser, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { PersonResponse, MemberStatus } from '../../lib/types';
import { getImageUrl } from '../../lib/constant/constant';

interface ParentSearchInputProps {
  members: PersonResponse[];
  value: string;
  onChange: (id: string, name: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  excludeCurrentMemberId?: string;
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trouver le parent sélectionné
  const selectedParent = useMemo(() => {
    if (!value) return null;
    return members.find(m => m.id === value);
  }, [members, value]);

  // Filtrer les membres pour la recherche
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const searchLower = searchTerm.toLowerCase();
    return members.filter(member => {
      if (excludeCurrentMemberId && member.id === excludeCurrentMemberId) return false;

      const matchesId = member.id.toLowerCase().includes(searchLower);
      const matchesFirstName = member.firstName.toLowerCase().includes(searchLower);
      const matchesLastName = member.lastName.toLowerCase().includes(searchLower);
      const matchesFullName = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchLower);
      const matchesPhone = member.phoneNumber?.toLowerCase().includes(searchLower);

      return matchesId || matchesFirstName || matchesLastName || matchesFullName || matchesPhone;
    }).slice(0, 15);
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
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getParentAvatar = (parent: PersonResponse) => {
    if (parent.imageUrl) {
      return getImageUrl(parent.imageUrl, 'member');
    }
    return null;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };


  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">
        Parent {required && <span className="text-red-500">*</span>}
      </label>

      {selectedParent ? (
        // Affichage du parent sélectionné - Version responsive
        <div className="bg-white border-2 border-brand-primary rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-brand-primary/10 flex items-center justify-center shrink-0">
              {getParentAvatar(selectedParent) ? (
                <img
                  src={getParentAvatar(selectedParent)!}
                  alt={selectedParent.firstName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(selectedParent.firstName, selectedParent.lastName);
                    (e.target as HTMLImageElement).parentElement!.classList.add('text-brand-primary', 'font-black', 'text-xs', 'sm:text-sm');
                  }}
                />
              ) : (
                <span className="text-brand-primary font-black text-xs sm:text-sm">
                  {getInitials(selectedParent.firstName, selectedParent.lastName)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm sm:text-base truncate">
                {selectedParent.firstName} {selectedParent.lastName}
              </p>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] text-gray-400 mt-0.5 sm:mt-1">
                <span className="font-mono truncate max-w-20 sm:max-w-none">{selectedParent.id}</span>
                <span className="hidden sm:inline">•</span>
                <span>{selectedParent.status === MemberStatus.STUDENT ? 'Étudiant' : 'Travailleur'}</span>
                {selectedParent.isActiveMember && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-green-500">Actif</span>
                  </>
                )}
                {selectedParent.childrenCount > 0 && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-purple-500 whitespace-nowrap">
                      {selectedParent.childrenCount} enfant{selectedParent.childrenCount > 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase text-gray-400 hover:text-red-500 transition-colors shrink-0 self-end sm:self-center"
            disabled={disabled}
          >
            Changer
          </button>
        </div>
      ) : (
        // Champ de recherche - Version responsive
        <div className="relative">
          <div className="relative">
            <AiOutlineSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => setIsOpen(true)}
              placeholder="Rechercher par ID, nom ou téléphone..."
              className={`
                w-full pl-9 sm:pl-11 pr-8 sm:pr-10 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 
                ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-brand-primary'}
                text-xs sm:text-sm font-medium outline-none transition-all
                disabled:bg-gray-100 disabled:cursor-not-allowed
                placeholder:text-[11px] sm:placeholder:text-sm
              `}
              disabled={disabled}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <AiOutlineClose size={12} className="sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Dropdown de recherche - Version responsive */}
          {isOpen && searchTerm && filteredMembers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 sm:mt-2 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl shadow-xl max-h-60 sm:max-h-80 overflow-y-auto">
              {filteredMembers.map(member => {
                const avatarUrl = member.imageUrl ? getImageUrl(member.imageUrl, 'member') : null;
                const isSelected = value === member.id;

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleSelectParent(member)}
                    className={`
                      w-full p-2.5 sm:p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors
                      ${isSelected ? 'bg-brand-primary/5' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={member.firstName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(member.firstName, member.lastName);
                              (e.target as HTMLImageElement).parentElement!.classList.add('text-gray-500', 'font-black', 'text-xs', 'sm:text-sm');
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 font-black text-xs sm:text-sm">
                            {getInitials(member.firstName, member.lastName)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-xs sm:text-sm truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          {isSelected && (
                            <AiOutlineCheck className="text-green-500 shrink-0" size={14} />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                          <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 truncate max-w-15 sm:max-w-none">
                            {member.id}
                          </span>
                          <span className="text-[8px] sm:text-[9px] text-gray-400 hidden sm:inline">•</span>
                          <span className="text-[8px] sm:text-[9px] font-bold text-purple-500">
                            {member.status === MemberStatus.WORKER ? 'Travailleur' : 'Étudiant'}
                          </span>
                          {member.isActiveMember && (
                            <span className="text-[8px] sm:text-[9px] font-bold text-green-500">Actif</span>
                          )}
                          {member.childrenCount > 0 && (
                            <span className="text-[8px] sm:text-[9px] font-bold text-purple-500 whitespace-nowrap">
                              {member.childrenCount} enf{member.childrenCount > 1 ? 's' : ''}
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
            <div className="absolute z-50 w-full mt-1 sm:mt-2 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-gray-400">Aucun membre trouvé</p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-1">
                Essayez de rechercher par ID, nom ou téléphone
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-[9px] sm:text-[10px] font-bold mt-1.5 sm:mt-2 uppercase tracking-wide">
          {error}
        </p>
      )}

      <div className="flex items-start gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-gray-400">
        <AiOutlineUser size={10} className="sm:w-3 sm:h-3 shrink-0 mt-0.5" />
        <p className="text-[7px] sm:text-[8px] font-bold uppercase leading-tight">
          Recherchez un membre par ID, nom ou téléphone pour le définir comme parent
        </p>
      </div>
    </div>
  );
};

export default ParentSearchInput;