import React, { useState, useMemo } from 'react';
import {
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
} from 'react-icons/ai';
import { useFinance } from '../hooks/useFinance';
import { useMembers } from '../hooks/useMembers';
import { PaymentStatus } from '../lib/types/enum.types'; // on garde PaymentStatus, on enlève ContributionStatus
import { THEME } from '../styles/theme';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ActionBtn from '../components/ui/ActionBtn';
import Alert from '../components/ui/Alert';
import toast from 'react-hot-toast';

const ContributionManagement: React.FC = () => {
  const { contributions, loadingContribs, addPayment, generateAnnualContribs, updateContribution, deleteContribution } = useFinance(); // ← correction
  const { members } = useMembers(); // ← on garde même si non utilisé pour l'instant
  const [searchTerm, setSearchTerm] = useState('');
  const [inputAmounts, setInputAmounts] = useState<Record<string, string>>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredContributions = useMemo(() => {
    return contributions.filter((c) =>
      c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.childName && c.childName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [contributions, searchTerm]);

  const handleAmountChange = (id: string, value: string) => {
    setInputAmounts(prev => ({ ...prev, [id]: value }));
  };

  const handleProcessPayment = async (contributionId: string) => {
    const amount = Number(inputAmounts[contributionId]);
    if (!amount || amount <= 0) return;
    try {
      await addPayment.mutateAsync({
        amountPayed: amount,
        paymentDate: new Date().toISOString(),
        paymentStatus: PaymentStatus.COMPLETED,
        contributionId,
      });
      setInputAmounts(prev => ({ ...prev, [contributionId]: '' }));
      toast.success('Paiement enregistré');
    } catch (error) {
      toast.error('Erreur paiement');
    }
  };

  const handleGenerate = async (year: number) => {
    try {
      await generateAnnualContribs.mutateAsync({ year }); // ← correction
      toast.success(`Cotisations ${year} générées`);
      setIsGenerateModalOpen(false);
    } catch (err) {
      toast.error('Erreur génération');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateContribution.mutateAsync({ id, data });
      toast.success('Cotisation mise à jour');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error('Erreur mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteContribution.mutateAsync(deleteId);
      toast.success('Cotisation supprimée');
    } catch (err) {
      toast.error('Erreur suppression');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`${THEME.font.black} text-3xl tracking-tighter uppercase`}>
            Gestion des Cotisations
          </h1>
          <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-1 italic">
            Année {selectedYear}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsGenerateModalOpen(true)} className="flex items-center gap-2">
            <AiOutlinePlus /> GÉNÉRER
          </Button>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white border-2 border-brand-border border-b-4 rounded-xl px-4 py-3 font-black text-sm"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="w-full max-w-2xl">
        <Input
          placeholder="Rechercher un membre..."
          icon={<AiOutlineSearch size={22} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border-2 border-brand-border border-b-8 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50 border-b-2 border-brand-border">
                <th className="p-6 text-[9px] font-black uppercase text-brand-muted">Membre</th>
                <th className="p-6 text-center text-[9px] font-black uppercase text-brand-muted">Année</th>
                <th className="p-6 text-center text-[9px] font-black uppercase text-brand-muted">Dû</th>
                <th className="p-6 text-center text-[9px] font-black uppercase text-brand-muted">Payé</th>
                <th className="p-6 text-center text-[9px] font-black uppercase text-brand-muted">Reste</th>
                <th className="p-6 text-right text-[9px] font-black uppercase text-brand-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-brand-bg">
              {loadingContribs ? (
                <tr><td colSpan={6} className="p-20 text-center">Chargement...</td></tr>
              ) : filteredContributions.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center">Aucune cotisation</td></tr>
              ) : (
                filteredContributions.map((c) => (
                  <tr key={c.id} className="group hover:bg-brand-primary/5">
                    <td className="p-6">
                      <p className="font-black text-[11px] uppercase">{c.memberName}</p>
                      {c.childName && <p className="text-[8px] text-gray-400">Enfant: {c.childName}</p>}
                    </td>
                    <td className="p-6 text-center font-black">{c.year}</td>
                    <td className="p-6 text-center font-black">{c.amount.toLocaleString()}</td>
                    <td className="p-6 text-center font-black text-green-600">{c.totalPaid.toLocaleString()}</td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black ${c.remaining === 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {c.remaining === 0 ? 'Soldé' : `${c.remaining.toLocaleString()} Ar`}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <ActionBtn icon={<AiOutlineEdit />} title="Modifier" variant="edit" onClick={() => { setEditingContribution(c); setIsEditModalOpen(true); }} />
                        <ActionBtn icon={<AiOutlineDelete />} title="Supprimer" variant="delete" onClick={() => setDeleteId(c.id)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isGenerateModalOpen && (
        <GenerateModal
          year={selectedYear}
          onClose={() => setIsGenerateModalOpen(false)}
          onConfirm={handleGenerate}
        />
      )}

      {isEditModalOpen && editingContribution && (
        <EditContributionModal
          contribution={editingContribution}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdate}
        />
      )}

      <Alert
        isOpen={!!deleteId}
        variant="danger"
        title="Supprimer la cotisation"
        message="Cette action est irréversible."
        confirmText="SUPPRIMER"
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

const GenerateModal: React.FC<{ year: number; onClose: () => void; onConfirm: (year: number) => void }> = ({ year, onClose, onConfirm }) => {
  const [selectedYear, setSelectedYear] = useState(year);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border-4 border-white shadow-2xl max-w-md w-full p-8">
        <h2 className="font-black text-xl uppercase mb-4">Générer les cotisations</h2>
        <p className="text-sm mb-4">Créer les cotisations pour tous les membres actifs de l'année {selectedYear}.</p>
        <Input
          label="Année"
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          min={2000}
          max={2100}
        />
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={() => onConfirm(selectedYear)} className="flex-1">Générer</Button>
        </div>
      </div>
    </div>
  );
};

const EditContributionModal: React.FC<{ contribution: any; onClose: () => void; onSave: (id: string, data: any) => void }> = ({
  contribution,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState(contribution.amount);
  const [status, setStatus] = useState(contribution.contributionStatus);
  // setMemberId n'est pas utilisé, on peut le supprimer

  const handleSubmit = () => {
    onSave(contribution.id, { amount, contributionStatus: status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl border-4 border-white shadow-2xl max-w-md w-full p-8">
        <h2 className="font-black text-xl uppercase mb-4">Modifier la cotisation</h2>
        <div className="space-y-4">
          <Input
            label="Montant dû"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-4 border-2 border-brand-border border-b-4 rounded-2xl font-bold"
          >
            <option value="PENDING">En attente</option>
            <option value="PARTIAL">Partiel</option>
            <option value="PAID">Payé</option>
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSubmit} className="flex-1">Enregistrer</Button>
        </div>
      </div>
    </div>
  );
};

export default ContributionManagement;