// client/src/components/admin/members/MembersTableRow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { PersonResponse, Gender, MemberStatus } from '../../../lib/types';
import {
  AiOutlineEye,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineMan,
  AiOutlineWoman,
  AiOutlineCrown,
  AiOutlineStar,
  AiOutlineMore,
} from 'react-icons/ai';
import { getInitials, } from '../../../lib/helper';
import { getImageUrl } from '../../../lib/constant/constant';

interface MembersTableRowProps {
  member: PersonResponse;
  onEdit: (member: PersonResponse) => void;
  onDelete: (id: string) => void;
  onView: (member: PersonResponse) => void;
}

const MembersTableRow: React.FC<MembersTableRowProps> = ({ member, onEdit, onDelete, onView }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isMale = member.gender === Gender.MALE;
  const genderIcon = isMale ? <AiOutlineMan size={14} /> : <AiOutlineWoman size={14} />;
  const statusIcon = member.status === MemberStatus.WORKER ? <AiOutlineCrown size={12} /> : <AiOutlineStar size={12} />;
  const statusLabel = member.status === MemberStatus.WORKER ? 'Travailleur' : 'Étudiant';
  const statusColor = member.status === MemberStatus.WORKER ? 'text-purple-600 bg-purple-50' : 'text-amber-600 bg-amber-50';

  const avatarUrl = member.imageUrl ? getImageUrl(member.imageUrl, 'member') : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleView = () => {
    setMenuOpen(false);
    onView(member);
  };

  const handleEdit = () => {
    setMenuOpen(false);
    onEdit(member);
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete(member.id);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-xs font-black">
            {avatarUrl ? (
              <img src={avatarUrl} alt={member.firstName} className="w-full h-full object-cover" />
            ) : (
              <span className={isMale ? 'text-blue-500' : 'text-pink-500'}>
                {getInitials(member.firstName, member.lastName)}
              </span>
            )}
          </div>
          <div>
            <div className="font-bold text-sm uppercase">
              {member.lastName}{' '}
              <span className="font-black text-brand-primary">{member.firstName}</span>
            </div>
            {!member.isActiveMember && (
              <span className="text-[8px] font-black text-gray-400 uppercase">Inactif</span>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
          {genderIcon}
          {isMale ? 'Homme' : 'Femme'}
        </div>
      </td>

      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">
        {member.districtName}
      </td>

      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">
        {member.tributeName}
      </td>

      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase ${statusColor}`}>
          {statusIcon}
          {statusLabel}
        </span>
      </td>

      <td className="px-4 py-3 hidden lg:table-cell">
        {member.childrenCount > 0 ? (
          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            {member.childrenCount} enfant{member.childrenCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Actions"
          >
            <AiOutlineMore size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-200 z-10 overflow-hidden animate-in fade-in zoom-in duration-150">
              <button
                onClick={handleView}
                className="w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-2 hover:bg-blue-50 text-gray-700 transition-colors"
              >
                <AiOutlineEye size={14} className="text-blue-500" />
                Voir
              </button>
              <button
                onClick={handleEdit}
                className="w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-2 hover:bg-brand-primary/10 text-gray-700 transition-colors"
              >
                <AiOutlineEdit size={14} className="text-brand-primary" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 text-left text-xs font-bold flex items-center gap-2 hover:bg-red-50 text-gray-700 transition-colors"
              >
                <AiOutlineDelete size={14} className="text-red-500" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default MembersTableRow;