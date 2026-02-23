import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AiOutlineArrowLeft,
  AiOutlinePlus,
  AiOutlineDelete,
  AiOutlinePrinter,
  AiOutlineCheckCircle,
  AiOutlineDollar
} from 'react-icons/ai';
import { useFinance } from '../../hooks/useFinance';
import { usePayments } from '../../hooks/usePayments';
import { formatCurrency } from '../../lib/helper/currencyHelpers';
import { formatDate } from '../../lib/helper/dateHelpers';
import { getErrorMessage } from '../../lib/helper/errorHelpers';
import Button from '../../components/ui/Button';
import ActionBtn from '../../components/ui/ActionBtn';
import Alert from '../../components/ui/Alert';
import PaymentModal from '../../components/shared/modals/PaymentModal';
import { THEME } from '../../styles/theme';
import toast from 'react-hot-toast';

const ContributionPayments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contributions } = useFinance();
  const { payments, loadingPayments, deletePayment } = usePayments(id);
  
  const [contribution, setContribution] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (contributions.length > 0 && id) {
      const found = contributions.find(c => c.id === id);
      if (found) setContribution(found);
    }
  }, [contributions, id]);

  if (!contribution) {
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
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deletePayment.mutateAsync(deleteId);
      toast.success('Paiement supprimé avec succès');
      setDeleteId(null);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const remaining = contribution.amount - totalPayments;
  const isPaid = remaining <= 0;

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`/admin/contributions/${id}`)}
            className="p-3! rounded-xl!"
          >
            <AiOutlineArrowLeft size={20} />
          </Button>
          <div>
            <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
              Paiements
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Cotisation {contribution.year} • {contribution.memberName}
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
          {!isPaid && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <AiOutlinePlus size={18} />
              Nouveau paiement
            </Button>
          )}
        </div>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Total dû</p>
          <p className="text-2xl font-black">{formatCurrency(contribution.amount, 'Ar')}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Payé</p>
          <p className="text-2xl font-black text-green-600">{formatCurrency(totalPayments, 'Ar')}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Reste</p>
          <p className={`text-2xl font-black ${isPaid ? 'text-green-600' : 'text-orange-600'}`}>
            {formatCurrency(remaining, 'Ar')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Nombre</p>
          <p className="text-2xl font-black">{payments.length}</p>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6 shadow-sm">
        <h2 className="text-sm font-black mb-6">HISTORIQUE DES PAIEMENTS</h2>

        {loadingPayments ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-black text-sm opacity-40">Chargement...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <AiOutlineDollar className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="font-black text-sm opacity-40">Aucun paiement enregistré</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-brand-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                    <AiOutlineCheckCircle size={24} />
                  </div>
                  <div>
                    <p className="font-black text-xl">{formatCurrency(payment.amountPaid, 'Ar')}</p>
                    <p className="text-[9px] font-bold text-gray-400">
                      {formatDate(payment.paymentDate, 'long')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Statut</p>
                    <p className="font-black text-xs text-green-600">Complété</p>
                  </div>
                  <ActionBtn
                    icon={<AiOutlineDelete />}
                    title="Supprimer"
                    variant="delete"
                    onClick={() => setDeleteId(payment.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <PaymentModal
          contribution={contribution}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            // Les données seront automatiquement rafraîchies par React Query
          }}
        />
      )}

      <Alert
        isOpen={!!deleteId}
        variant="danger"
        title="Supprimer le paiement"
        message="Cette action est irréversible. Le montant sera déduit du total payé."
        confirmText="SUPPRIMER"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ContributionPayments;

function setIsDeleting(_arg0: boolean) {
  throw new Error('Function not implemented.');
}
