import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineGlobal,
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineArrowLeft
} from 'react-icons/ai';
import { useDistrict } from '../../hooks/useDistrict';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ActionBtn from '../../components/ui/ActionBtn';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const DistrictList: React.FC = () => {
  const navigate = useNavigate();
  const { districts, loadingDistricts, deleteDistrict } = useDistrict();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const filteredDistricts = useMemo(() => {
    return districts.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [districts, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteDistrict.mutateAsync(deleteId);
      toast.success('District supprimé avec succès');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/superadmin/management')}
            className="p-3! rounded-xl!"
          >
            <AiOutlineArrowLeft size={20} />
          </Button>
          <div>
            <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
              Districts
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              {filteredDistricts.length} résultat(s)
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/admin/districts/create')}
          className="flex items-center gap-2"
        >
          <AiOutlinePlus /> NOUVEAU DISTRICT
        </Button>
      </div>

      {/* Recherche */}
      <div className="bg-white p-6 rounded-[2.5rem] border-2 border-b-8 border-gray-100">
        <Input
          placeholder="Rechercher un district..."
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
                  Nom
                </th>
                <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {loadingDistricts ? (
                <tr>
                  <td colSpan={2} className="p-20 text-center font-black uppercase opacity-20">
                    Chargement...
                  </td>
                </tr>
              ) : filteredDistricts.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-20 text-center font-black uppercase opacity-20">
                    Aucun district trouvé
                  </td>
                </tr>
              ) : (
                filteredDistricts.map((district) => (
                  <tr key={district.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-xs uppercase">
                          <AiOutlineGlobal className="text-gray-500" size={18} />
                        </div>
                        <span className="font-black text-sm uppercase">{district.name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <ActionBtn
                          icon={<AiOutlineEdit />}
                          title="Modifier"
                          variant="edit"
                          onClick={() => navigate(`/admin/districts/${district.id}/edit`)}
                        />
                        <ActionBtn
                          icon={<AiOutlineDelete />}
                          title="Supprimer"
                          variant="delete"
                          onClick={() => {
                            setDeleteId(district.id!);
                            setDeleteName(district.name);
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
        isOpen={!!deleteId}
        variant="danger"
        title="Supprimer le district"
        message={`Êtes-vous sûr de vouloir supprimer le district "${deleteName}" ? Cette action est irréversible.`}
        confirmText="SUPPRIMER"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default DistrictList;

function setIsDeleting(arg0: boolean) {
  throw new Error('Function not implemented.');
}
