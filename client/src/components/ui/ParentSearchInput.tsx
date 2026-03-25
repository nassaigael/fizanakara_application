// components/ui/ParentSearchInput.tsx
import React, { useState, useMemo } from 'react';
import { AiOutlineSearch, AiOutlineUser } from 'react-icons/ai';
import { PersonResponse } from '../../lib/types';

interface ParentSearchInputProps {
  members: PersonResponse[];
  value: string;
  onChange: (id: string, name: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const ParentSearchInput: React.FC<ParentSearchInputProps> = ({
  members,
  value,
  onChange,
  error,
  disabled,
  required
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Trouver le parent sélectionné
  const selectedParent = useMemo(() => {
    if (!value) return null;
    return members.find(m => m.id === value);
  }, [members, value]);

  // Filtrer les membres pour la recherche (exclure ceux qui ont déjà un parent ou qui sont des enfants)
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    return members.filter(member => {
      // Ne montrer que les membres qui peuvent être parents (sans parent)
      if (member.parentId) return false;
      
      // Rechercher par ID (format MBR00000001) ou par nom
      const matchesId = member.id.toLowerCase().includes(searchLower);
      const matchesFirstName = member.firstName.toLowerCase().includes(searchLower);
      const matchesLastName = member.lastName.toLowerCase().includes(searchLower);
      const matchesFullName = `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchLower);
      
      return matchesId || matchesFirstName || matchesLastName || matchesFullName;
    }).slice(0, 10); // Limiter à 10 résultats
  }, [members, searchTerm]);

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

  return (
    <div className="relative">
      <label className="block text-[9px] font-black uppercase tracking-wider text-gray-500 mb-2">
        Parent {required && <span className="text-red-500">*</span>}
      </label>
      
      {selectedParent ? (
        // Affichage du parent sélectionné
        <div className="bg-white border-2 border-brand-primary rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
              <AiOutlineUser className="text-brand-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">
                {selectedParent.firstName} {selectedParent.lastName}
              </p>
              <p className="text-[10px] text-gray-400 font-mono">
                ID: {selectedParent.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 text-xs font-bold uppercase"
            disabled={disabled}
          >
            Change
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
              placeholder="Search by ID (MBR00000001) or name..."
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
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              {filteredMembers.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleSelectParent(member)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <AiOutlineUser className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">
                        {member.firstName} {member.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="font-mono">{member.id}</span>
                        <span>•</span>
                        <span>{member.status === 'STUDENT' ? 'Student' : 'Worker'}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {isOpen && searchTerm && filteredMembers.length === 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 text-center">
              <p className="text-sm text-gray-400">No parent found</p>
              <p className="text-[10px] text-gray-400 mt-1">
                Try searching by ID (MBR00000001) or name
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
          Search by ID (e.g., MBR00000001) or member name
        </p>
      </div>
    </div>
  );
};

export default ParentSearchInput;