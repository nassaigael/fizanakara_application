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
import Avatar from '../../ui/Avatar';

interface MembersTableRowProps {
  member: PersonResponse;
  onEdit: (member: PersonResponse) => void;
  onDelete: (id: string) => void;
  onView: (member: PersonResponse) => void;
}

const MembersTableRow: React.FC<MembersTableRowProps> = ({ member, onEdit, onDelete, onView }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isMale = member.gender === Gender.MALE;
  const genderIcon = isMale ? <AiOutlineMan size={14} /> : <AiOutlineWoman size={14} />;
  const statusIcon = member.status === MemberStatus.WORKER ? <AiOutlineCrown size={12} /> : <AiOutlineStar size={12} />;
  const statusLabel = member.status === MemberStatus.WORKER ? 'Travailleur' : 'Étudiant';
  const statusColor = member.status === MemberStatus.WORKER ? 'text-purple-600 bg-purple-50' : 'text-amber-600 bg-amber-50';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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

  const handleProfileClick = () => {
    onView(member);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-4 py-3">
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-3 w-full text-left cursor-pointer group/profile"
        >
          <Avatar
            imageUrl={member.imageUrl}
            firstName={member.firstName}
            lastName={member.lastName}
            gender={member.gender}
            category="member"
            size="sm"
            shape="circle"
            className="transition-transform group-hover/profile:scale-105"
          />
          <div>
            <div className="font-bold text-sm uppercase group-hover/profile:text-[#E51A1A] transition-colors">
              {member.lastName}{' '}
              <span className="font-black capitalize">{member.firstName}</span>
            </div>
            {!member.isActiveMember && (
              <span className="text-[8px] font-black text-gray-400 uppercase">Inactif</span>
            )}
          </div>
        </button>
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

      <td className="px-4 py-3 text-right relative">
        <button
          ref={buttonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Actions"
        >
          <AiOutlineMore size={18} />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="fixed z-50 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/30 overflow-hidden animate-in fade-in zoom-in duration-150"
            style={{
              position: 'fixed',
              top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 4 : 0,
              right: buttonRef.current ? window.innerWidth - buttonRef.current.getBoundingClientRect().right : 0,
              minWidth: '160px'
            }}
          >
            <button
              onClick={handleView}
              className="w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 hover:bg-blue-50/50 transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100/50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <AiOutlineEye size={14} className="text-blue-600" />
              </div>
              <span className="text-gray-700 group-hover:text-blue-700">Voir</span>
            </button>

            <button
              onClick={handleEdit}
              className="w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 hover:bg-amber-50/50 transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100/50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <AiOutlineEdit size={14} className="text-amber-600" />
              </div>
              <span className="text-gray-700 group-hover:text-amber-700">Modifier</span>
            </button>

            <div className="mx-3 h-px bg-gray-100" />

            <button
              onClick={handleDelete}
              className="w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 hover:bg-red-50/50 transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-lg bg-red-100/50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <AiOutlineDelete size={14} className="text-red-600" />
              </div>
              <span className="text-red-600 group-hover:text-red-700">Supprimer</span>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default MembersTableRow;