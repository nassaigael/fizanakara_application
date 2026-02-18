// MemberDetail.tsx (corrigé)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AiOutlineUser,
  AiOutlineCalendar,
  AiOutlinePhone,
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineArrowLeft,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineCheck,
  AiOutlineClose,
} from 'react-icons/ai';
import { useMembers } from '../hooks/useMembers';
import { useFinance } from '../hooks/useFinance';
import { PersonResponseModel } from '../lib/types/models/person.models.types';
import { ContributionResponseModel } from '../lib/types/models/contribution.models.types';
import { PaymentStatus } from '../lib/types/enum.types';
import Button from '../components/ui/Button';
import ActionBtn from '../components/ui/ActionBtn';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import MemberForm from '../components/shared/modals/MemberForm';
import { getFullName, getInitials } from '../lib/helper/stringHelpers';
import { calculateAge } from '../lib/helper/dateHelpers';
import { THEME } from '../styles/theme';
import toast from 'react-hot-toast';

const MemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { members, deleteMember } = useMembers();
  const { contributions, loadingContribs, addPayment } = useFinance(id);

  const [member, setMember] = useState<PersonResponseModel | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'children' | 'contributions' | 'payments'>('info');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [selectedContribution, setSelectedContribution] = useState<ContributionResponseModel | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Récupération locale du membre
  useEffect(() => {
    if (id) {
      const found = members.find(m => m.id === id); // ← au lieu de getMemberById
      setMember(found || null);
    }
  }, [id, members]);

  if (!member) {
    return (
      <div className="p-8 text-center">
        <p className="font-black opacity-20">Membre introuvable</p>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMember.mutateAsync(member.id);
      toast.success('Membre supprimé');
      navigate('/admin/members');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleAddPayment = async (contributionId: string) => {
    const amount = Number(paymentAmounts[contributionId]);
    if (!amount || amount <= 0) return;
    try {
      await addPayment.mutateAsync({
        amountPayed: amount,
        paymentDate: new Date().toISOString(),
        paymentStatus: PaymentStatus.COMPLETED,
        contributionId,
      });
      setPaymentAmounts((prev) => ({ ...prev, [contributionId]: '' }));
      toast.success('Paiement enregistré');
    } catch (err) {
      toast.error('Erreur paiement');
    }
  };

  const renderInfoTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <InfoBox label="Nom complet" value={getFullName(member.firstName, member.lastName)} icon={<AiOutlineUser />} />
      <InfoBox label="Date de naissance" value={`${member.birthDate} (${calculateAge(member.birthDate)} ans)`} icon={<AiOutlineCalendar />} />
      <InfoBox label="Téléphone" value={member.phoneNumber} icon={<AiOutlinePhone />} />
      <InfoBox label="District" value={member.districtName} icon={<AiOutlineGlobal />} />
      <InfoBox label="Tribu" value={member.tributeName} icon={<AiOutlineTeam />} />
      <InfoBox label="Statut" value={member.status} icon={<AiOutlineUser />} />
      <InfoBox label="Membre actif" value={member.isActiveMember ? 'Oui' : 'Non'} icon={<AiOutlineCheck />} />
      <InfoBox label="Numéro de séquence" value={member.sequenceNumber.toString()} icon={<AiOutlineUser />} />
    </div>
  );

  const renderChildrenTab = () => (
    <div className="space-y-4">
      {member.children && member.children.length > 0 ? (
        member.children.map((child) => (
          <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-200 flex items-center justify-center font-black">
                {getInitials(child.firstName, child.lastName)}
              </div>
              <div>
                <p className="font-black text-xs uppercase">{getFullName(child.firstName, child.lastName)}</p>
                <p className="text-[9px] text-gray-400">N° {child.sequenceNumber}</p>
              </div>
            </div>
            <ActionBtn
              icon={<AiOutlineUser />}
              title="Voir"
              variant="view"
              onClick={() => navigate(`/admin/members/${child.id}`)}
            />
          </div>
        ))
      ) : (
        <p className="text-center py-8 opacity-50">Aucun enfant enregistré</p>
      )}
      <Button onClick={() => setIsAddChildModalOpen(true)} className="w-full mt-4">
        <AiOutlinePlus /> AJOUTER UN ENFANT
      </Button>
    </div>
  );

  const renderContributionsTab = () => (
    <div className="space-y-4">
      {loadingContribs ? (
        <p className="text-center py-8">Chargement...</p>
      ) : contributions.length === 0 ? (
        <p className="text-center py-8 opacity-50">Aucune cotisation</p>
      ) : (
        contributions.map((c) => (
          <div key={c.id} className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-black text-sm">Année {c.year}</p>
                <p className="text-[10px] text-gray-500">Échéance: {c.dueDate}</p>
              </div>
              <div className="flex gap-4">
                <span className="font-black text-sm">{c.amount.toLocaleString()} Ar</span>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black ${c.remaining === 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  Reste: {c.remaining.toLocaleString()} Ar
                </span>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                onClick={() => {
                  setSelectedContribution(c);
                  setIsPaymentModalOpen(true);
                }}
                disabled={c.remaining === 0}
                className="px-3 py-1 text-xs" // ← au lieu de size="sm"
              >
                ENCAISSER
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-4">
      {contributions.flatMap(c => c.payments || []).length === 0 ? (
        <p className="text-center py-8 opacity-50">Aucun paiement</p>
      ) : (
        contributions.flatMap(c => c.payments || []).map((p) => (
          <div key={p.id} className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-black text-xs">{p.paymentDate}</p>
              <p className="text-[9px] text-gray-400">Cotisation {p.contributionId}</p>
            </div>
            <span className="font-black text-sm">{p.amountPayed.toLocaleString()} Ar</span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/admin/members')} className="p-3! rounded-xl!">
            <AiOutlineArrowLeft size={20} />
          </Button>
          <div>
            <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
              {getFullName(member.firstName, member.lastName)}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase">N° {member.sequenceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ActionBtn icon={<AiOutlineEdit />} title="Modifier" variant="edit" onClick={() => setIsEditModalOpen(true)} />
          <ActionBtn icon={<AiOutlineDelete />} title="Supprimer" variant="delete" onClick={() => setIsDeleteAlertOpen(true)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-3xl border-2 border-gray-100 shadow-lg w-full md:w-fit">
        {(['info', 'children', 'contributions', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === tab
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            {tab === 'info' ? 'Informations' : tab === 'children' ? 'Enfants' : tab === 'contributions' ? 'Cotisations' : 'Paiements'}
          </button>
        ))}
      </div>

      {/* Contenu du tab */}
      <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-8">
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'children' && renderChildrenTab()}
        {activeTab === 'contributions' && renderContributionsTab()}
        {activeTab === 'payments' && renderPaymentsTab()}
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <MemberForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          memberToEdit={member}
          allMembers={members}
          onSuccess={() => {
            setIsEditModalOpen(false);
            // Recharger le membre (déjà fait via le useEffect)
          }}
        />
      )}

      {isAddChildModalOpen && (
        <MemberForm
          isOpen={isAddChildModalOpen}
          onClose={() => setIsAddChildModalOpen(false)}
          memberToEdit={null}
          allMembers={members}
          parentId={member.id} // ← on passe le parentId
          onSuccess={() => {
            setIsAddChildModalOpen(false);
            // Recharger le membre
          }}
        />
      )}

      {isPaymentModalOpen && selectedContribution && (
        <PaymentModal
          contribution={selectedContribution}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedContribution(null);
          }}
          onSuccess={() => {
            // Recharger les données
          }}
        />
      )}

      <Alert
        isOpen={isDeleteAlertOpen}
        variant="danger"
        title="Supprimer le membre"
        message="Cette action est irréversible."
        confirmText="SUPPRIMER"
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const InfoBox: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
    <div className="text-brand-primary">{icon}</div>
    <div>
      <p className="text-[8px] font-black text-gray-400 uppercase">{label}</p>
      <p className="font-black text-sm uppercase">{value}</p>
    </div>
  </div>
);

const PaymentModal: React.FC<{ contribution: ContributionResponseModel; onClose: () => void; onSuccess: () => void }> = ({
  contribution,
  onClose,
  onSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const { addPayment } = useFinance();

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) return;
    try {
      await addPayment.mutateAsync({
        amountPayed: num,
        paymentDate: new Date().toISOString(),
        paymentStatus: PaymentStatus.COMPLETED,
        contributionId: contribution.id,
      });
      toast.success('Paiement enregistré');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border-4 border-white shadow-2xl max-w-md w-full p-8">
        <h2 className="font-black text-xl uppercase mb-4">Encaisser un paiement</h2>
        <p className="text-sm mb-2">Cotisation {contribution.year} - Reste dû: {contribution.remaining.toLocaleString()} Ar</p>
        <Input
          label="Montant"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          autoFocus
        />
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={!amount || Number(amount) <= 0}>
            Valider
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;