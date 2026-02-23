import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AiOutlineArrowLeft,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineCalendar,
  AiOutlineDollar,
  AiOutlineHistory,
  AiOutlineUser,
  AiOutlinePrinter
} from 'react-icons/ai';
import { useFinance } from '../../hooks/useFinance';
import { useMembers } from '../../hooks/useMembers';
import { formatCurrency } from '../../lib/helper/currencyHelpers';
import { formatDate, getDaysRemaining } from '../../lib/helper/dateHelpers';
import { getFullName } from '../../lib/helper/stringHelpers';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import Button from '../../components/ui/Button';
import ActionBtn from '../../components/ui/ActionBtn';
import Alert from '../../components/ui/Alert';
import PaymentModal from '../../components/shared/modals/PaymentModal';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const ContributionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contributions, loadingContribs, deleteContribution, refetch } = useFinance();
  const { members } = useMembers();

  const [contribution, setContribution] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (contributions.length > 0 && id) {
      const found = contributions.find(c => c.id === id);
      if (found) {
        setContribution(found);
        
        // Trouver le membre associé
        const foundMember = members.find(m => m.id === found.memberId);
        setMember(foundMember);
      }
    }
  }, [contributions, id, members]);

  if (loadingContribs || !contribution) {
    return (
      <div className="p-8 text-center">
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 max-w-md mx-auto">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-xl opacity-60">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContribution.mutateAsync(id!);
      toast.success('Cotisation supprimée avec succès');
      navigate('/admin/contributions');
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const daysRemaining = getDaysRemaining(contribution.dueDate);
  const isPaid = contribution.remaining === 0;
  const isOverdue = daysRemaining < 0 && !isPaid;

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/contributions')}
            className="p-3! rounded-xl!"
          >
            <AiOutlineArrowLeft size={20} />
          </Button>
          <div>
            <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
              Détail de la cotisation
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Année {contribution.year}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-3! text-xs!"
          >
            <AiOutlinePrinter size={18} />
            Imprimer
          </Button>
          <ActionBtn
            icon={<AiOutlineEdit />}
            title="Modifier"
            variant="edit"
            onClick={() => navigate(`/admin/contributions/${id}/edit`)}
          />
          <ActionBtn
            icon={<AiOutlineDelete />}
            title="Supprimer"
            variant="delete"
            onClick={() => setShowDeleteAlert(true)}
          />
        </div>
      </div>

      {/* Badge de statut */}
      <div className="flex justify-end">
        <div className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-black text-sm
          ${isPaid ? 'bg-green-100 text-green-700 border-green-300' : 
            isOverdue ? 'bg-red-100 text-red-700 border-red-300' : 
            'bg-orange-100 text-orange-700 border-orange-300'}
        `}>
          {isPaid ? (
            <AiOutlineCheckCircle size={20} />
          ) : isOverdue ? (
            <AiOutlineCloseCircle size={20} />
          ) : (
            <AiOutlineCalendar size={20} />
          )}
          <span>
            {isPaid ? 'Payée' : isOverdue ? 'En retard' : 'En attente'}
          </span>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte membre */}
        <div className="lg:col-span-1 bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-black mb-4 flex items-center gap-2">
            <AiOutlineUser className="text-brand-primary" />
            MEMBRE
          </h2>
          {member ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center font-black text-xl">
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </div>
                <div>
                  <p className="font-black text-lg uppercase">
                    {getFullName(member.firstName, member.lastName)}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">N° {member.sequenceNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[8px] font-black text-gray-400 uppercase">District</p>
                  <p className="font-black text-xs truncate">{member.districtName}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[8px] font-black text-gray-400 uppercase">Tribu</p>
                  <p className="font-black text-xs truncate">{member.tributeName}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400">Membre non trouvé</p>
          )}
        </div>

        {/* Carte financière */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-black mb-6 flex items-center gap-2">
            <AiOutlineDollar className="text-brand-primary" />
            SITUATION FINANCIÈRE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Montant dû</p>
              <p className="text-2xl font-black text-brand-text">
                {formatCurrency(contribution.amount, 'Ar')}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <p className="text-[8px] font-black text-green-600 uppercase mb-2">Payé</p>
              <p className="text-2xl font-black text-green-600">
                {formatCurrency(contribution.totalPaid, 'Ar')}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-2xl">
              <p className="text-[8px] font-black text-orange-600 uppercase mb-2">Reste</p>
              <p className="text-2xl font-black text-orange-600">
                {formatCurrency(contribution.remaining, 'Ar')}
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <span>Progression</span>
              <span>{Math.round((contribution.totalPaid / contribution.amount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-brand-primary rounded-full transition-all"
                style={{ width: `${(contribution.totalPaid / contribution.amount) * 100}%` }}
              />
            </div>
          </div>

          {/* Bouton d'action */}
          {!isPaid && (
            <Button
              onClick={() => setShowPaymentModal(true)}
              className="w-full mt-6 flex items-center justify-center gap-2"
            >
              <AiOutlinePlus size={18} />
              Enregistrer un paiement
            </Button>
          )}
        </div>
      </div>

      {/* Historique des paiements */}
      <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6 shadow-sm">
        <h2 className="text-sm font-black mb-6 flex items-center gap-2">
          <AiOutlineHistory className="text-brand-primary" />
          HISTORIQUE DES PAIEMENTS
        </h2>

        {contribution.payments && contribution.payments.length > 0 ? (
          <div className="space-y-4">
            {contribution.payments.map((payment: any) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-brand-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                    <AiOutlineCheckCircle size={20} />
                  </div>
                  <div>
                    <p className="font-black text-lg">
                      {formatCurrency(payment.amountPayed, 'Ar')}
                    </p>
                    <p className="text-[8px] font-bold text-gray-400">
                      {formatDate(payment.paymentDate, 'long')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-gray-400 uppercase">Référence</p>
                  <p className="font-black text-xs">{payment.id.slice(-8)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <AiOutlineHistory className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="font-black text-sm opacity-40">Aucun paiement enregistré</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          contribution={contribution}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            refetch();
            setShowPaymentModal(false);
          }}
        />
      )}

      <Alert
        isOpen={showDeleteAlert}
        variant="danger"
        title="Supprimer la cotisation"
        message="Cette action est irréversible. Tous les paiements associés seront également supprimés."
        confirmText="SUPPRIMER"
        onClose={() => setShowDeleteAlert(false)}
        onConfirm={handleDelete}
        cancelText="Annuler"
      />
    </div>
  );
};

export default ContributionDetail;

function setIsDeleting(arg0: boolean) {
  throw new Error('Function not implemented.');
}
