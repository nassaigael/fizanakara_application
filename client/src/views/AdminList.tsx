// AdminList.tsx (corrigé)
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineMail,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineSearch,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from 'react-icons/ai';
import { useAdmin } from '../hooks/useAdmin';
import { AdminResponseModel } from '../lib/types/models/admin.models.types';
import { UserRole } from '../lib/types/enum.types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ActionBtn from '../components/ui/ActionBtn';
import Alert from '../components/ui/Alert';
import { getErrorMessage } from '../lib/helper/errorHelpers';
import { THEME } from '../styles/theme';
import toast from 'react-hot-toast';

const AdminList: React.FC = () => {
  const navigate = useNavigate();
  const { allAdmins, loadingAllAdmins, deleteAdmin } = useAdmin(); // ← correction ici
  const [searchTerm, setSearchTerm] = useState('');
  const [adminToDelete, setAdminToDelete] = useState<AdminResponseModel | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const filteredAdmins = useMemo(() => {
    return allAdmins.filter(
      (admin: AdminResponseModel) => // ← typage explicite
        admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allAdmins, searchTerm]);

  const handleDelete = async () => {
    if (!adminToDelete) return;
    try {
      await deleteAdmin.mutateAsync(adminToDelete.id);
      toast.success('Administrateur supprimé');
      setAdminToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la suppression');
    } finally {
      setIsDeleteAlertOpen(false);
    }
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
            Administrateurs
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {filteredAdmins.length} résultat(s)
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/management?tab=admins')}
          className="flex items-center gap-2"
        >
          <AiOutlinePlus /> AJOUTER
        </Button>
      </div>

      {/* Recherche */}
      <div className="bg-white p-6 rounded-[2.5rem] border-2 border-b-8 border-gray-100">
        <Input
          placeholder="Rechercher par nom ou email..."
          icon={<AiOutlineSearch />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Administrateur
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Contact
                </th>
                <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Rôle
                </th>
                <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Vérifié
                </th>
                <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {loadingAllAdmins ? ( // ← correction ici
                <tr>
                  <td colSpan={5} className="p-20 text-center font-black uppercase opacity-20">
                    Chargement...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center font-black uppercase opacity-20">
                    Aucun administrateur trouvé
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-xs uppercase">
                          {admin.firstName[0]}
                          {admin.lastName[0]}
                        </div>
                        <div>
                          <p className="font-black text-xs uppercase">
                            {admin.firstName} {admin.lastName}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">
                            {admin.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-[10px] uppercase flex items-center gap-1">
                        <AiOutlineMail className="text-gray-400" /> {admin.email}
                      </p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">
                        {admin.phoneNumber}
                      </p>
                    </td>
                    <td className="p-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[8px] font-black ${
                          admin.role === UserRole.SUPERADMIN
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {admin.role === UserRole.SUPERADMIN ? 'SUPER ADMIN' : 'ADMIN'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      {admin.verified ? (
                        <AiOutlineCheckCircle className="text-green-500 inline" size={20} />
                      ) : (
                        <AiOutlineCloseCircle className="text-red-500 inline" size={20} />
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <ActionBtn
                          icon={<AiOutlineEdit />}
                          title="Modifier"
                          variant="edit"
                          onClick={() => navigate(`/admin/admins/${admin.id}/edit`)}
                        />
                        <ActionBtn
                          icon={<AiOutlineDelete />}
                          title="Supprimer"
                          variant="delete"
                          onClick={() => {
                            setAdminToDelete(admin);
                            setIsDeleteAlertOpen(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert de suppression */}
      <Alert
        isOpen={isDeleteAlertOpen}
        variant="danger"
        title="Supprimer l'administrateur"
        message={`Êtes-vous sûr de vouloir supprimer ${adminToDelete?.firstName} ${adminToDelete?.lastName} ? Cette action est irréversible.`}
        confirmText="SUPPRIMER"
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminList;