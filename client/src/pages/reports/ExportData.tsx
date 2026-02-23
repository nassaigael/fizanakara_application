import React, { useState } from 'react';
import {
  AiOutlineArrowLeft,
  AiOutlineDownload,
  AiOutlineFileExcel,
  AiOutlineFilePdf,
  AiOutlineGlobal,
  AiOutlineTeam,
  AiOutlineUser,
  AiOutlineDollar
} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useMembers } from '../../hooks/useMembers';
import { useFinance } from '../../hooks/useFinance';
import { useDistrict } from '../../hooks/useDistrict';
import { useTribute } from '../../hooks/useTribute';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { THEME } from '../../styles/theme';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

type ExportType = 'members' | 'contributions' | 'payments' | 'districts' | 'tributes' | 'all';
type ExportFormat = 'excel' | 'pdf' | 'csv';

const ExportData: React.FC = () => {
  const navigate = useNavigate();
  const { members } = useMembers();
  const { contributions } = useFinance();
  const { districts } = useDistrict();
  const { tributes } = useTribute();

  const [selectedType, setSelectedType] = useState<ExportType>('members');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [exportStats, setExportStats] = useState({ count: 0, type: '' });

  const years = [...new Set(contributions.map(c => c.year))].sort((a, b) => b - a);

  const handleExport = () => {
    setIsExporting(true);

    try {
      let data: any[] = [];
      let filename = '';
      let count = 0;

      switch (selectedType) {
        case 'members':
          data = members.map(m => ({
            'N° Séquence': m.sequenceNumber,
            Prénom: m.firstName,
            Nom: m.lastName,
            'Nom complet': `${m.firstName} ${m.lastName}`,
            'Date naissance': m.birthDate,
            Genre: m.gender === 'MALE' ? 'Homme' : 'Femme',
            Téléphone: m.phoneNumber || '',
            District: m.districtName,
            Tribu: m.tributeName,
            Statut: m.status === 'WORKER' ? 'Travailleur' : 'Étudiant',
            'Membre actif': m.isActiveMember ? 'Oui' : 'Non',
            'ID Parent': m.parentId || '',
            'Nom Parent': m.parentName || ''
          }));
          count = members.length;
          filename = `membres_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'contributions':
          data = contributions
            .filter(c => c.year === selectedYear)
            .map(c => ({
              Année: c.year,
              Membre: c.memberName,
              'Montant dû': c.amount,
              'Montant payé': c.totalPaid,
              Reste: c.remaining,
              Statut: c.remaining === 0 ? 'Soldé' : 'En attente',
              'Date échéance': c.dueDate
            }));
          count = contributions.filter(c => c.year === selectedYear).length;
          filename = `cotisations_${selectedYear}`;
          break;

        case 'payments':
          const allPayments = contributions.flatMap(c => 
            (c.payments || []).map(p => ({
              ...p,
              memberName: c.memberName,
              year: c.year
            }))
          );
          data = allPayments.map(p => ({
            'ID Paiement': p.id,
            Membre: p.memberName,
            Année: p.year,
            Montant: p.amountPaid,
            'Date paiement': p.paymentDate,
            Statut: p.status
          }));
          count = allPayments.length;
          filename = `paiements_${new Date().toISOString().split('T')[0]}`;
          break;

        case 'districts':
          data = districts.map(d => ({
            ID: d.id,
            Nom: d.name
          }));
          count = districts.length;
          filename = 'districts';
          break;

        case 'tributes':
          data = tributes.map(t => ({
            ID: t.id,
            Nom: t.name
          }));
          count = tributes.length;
          filename = 'tribus';
          break;

        case 'all':
          // Créer un fichier avec plusieurs onglets (Excel uniquement)
          if (selectedFormat === 'excel') {
            const wb = XLSX.utils.book_new();
            
            const membersSheet = XLSX.utils.json_to_sheet(members.map(m => ({
              'N° Séquence': m.sequenceNumber,
              Nom: `${m.firstName} ${m.lastName}`,
              District: m.districtName,
              Tribu: m.tributeName,
              'Membre actif': m.isActiveMember ? 'Oui' : 'Non'
            })));
            XLSX.utils.book_append_sheet(wb, membersSheet, 'Membres');

            const contribsSheet = XLSX.utils.json_to_sheet(contributions.map(c => ({
              Année: c.year,
              Membre: c.memberName,
              Montant: c.amount,
              Payé: c.totalPaid,
              Reste: c.remaining
            })));
            XLSX.utils.book_append_sheet(wb, contribsSheet, 'Cotisations');

            const districtsSheet = XLSX.utils.json_to_sheet(districts.map(d => ({ Nom: d.name })));
            XLSX.utils.book_append_sheet(wb, districtsSheet, 'Districts');

            const tributesSheet = XLSX.utils.json_to_sheet(tributes.map(t => ({ Nom: t.name })));
            XLSX.utils.book_append_sheet(wb, tributesSheet, 'Tribus');

            XLSX.writeFile(wb, `export_complet_${new Date().toISOString().split('T')[0]}.xlsx`);
            count = members.length + contributions.length + districts.length + tributes.length;
            setExportStats({ count, type: 'toutes les données' });
            setShowSuccessAlert(true);
            setIsExporting(false);
            return;
          }
          break;
      }

      // Export selon le format choisi
      if (selectedFormat === 'excel') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Données');
        XLSX.writeFile(wb, `${filename}.xlsx`);
      } else if (selectedFormat === 'csv') {
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
      } else {
        // PDF
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Export ${filename}`, 14, 22);
        
        const headers = Object.keys(data[0] || {}).map(key => key);
        const rows = data.map(row => Object.values(row));
        
        (doc as any).autoTable({
          head: [headers],
          body: rows,
          startY: 30
        });
        
        doc.save(`${filename}.pdf`);
      }

      setExportStats({ count, type: selectedType });
      setShowSuccessAlert(true);
    } catch (error) {
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/admin/dashboard')}
          className="p-3! rounded-xl!"
        >
          <AiOutlineArrowLeft size={20} />
        </Button>
        <div>
          <h1 className={`${THEME.font.black} text-3xl uppercase tracking-tighter`}>
            Export des données
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase">
            Télécharger les données du système
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-[3rem] border-2 border-b-8 border-gray-100 p-8 shadow-sm max-w-2xl mx-auto">
        <div className="space-y-8">
          {/* Icône */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary">
              <AiOutlineDownload size={40} />
            </div>
          </div>

          {/* Type de données */}
          <div className="space-y-4">
            <label className="block font-black text-brand-muted text-[10px] uppercase tracking-wider">
              Type de données à exporter
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType('members')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedType === 'members'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AiOutlineUser size={24} className={selectedType === 'members' ? 'text-brand-primary' : 'text-gray-400'} />
                <span className="font-black text-xs">Membres</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('contributions')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedType === 'contributions'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AiOutlineDollar size={24} className={selectedType === 'contributions' ? 'text-brand-primary' : 'text-gray-400'} />
                <span className="font-black text-xs">Cotisations</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('districts')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedType === 'districts'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AiOutlineGlobal size={24} className={selectedType === 'districts' ? 'text-brand-primary' : 'text-gray-400'} />
                <span className="font-black text-xs">Districts</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('tributes')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedType === 'tributes'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AiOutlineTeam size={24} className={selectedType === 'tributes' ? 'text-brand-primary' : 'text-gray-400'} />
                <span className="font-black text-xs">Tribus</span>
              </button>
            </div>
          </div>

          {/* Année pour les cotisations */}
          {selectedType === 'contributions' && (
            <Select
              label="Année"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              options={years.map(y => ({ value: y, label: y.toString() }))}
            />
          )}

          {/* Format d'export */}
          <div className="space-y-4">
            <label className="block font-black text-brand-muted text-[10px] uppercase tracking-wider">
              Format d'export
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedFormat('excel')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedFormat === 'excel'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AiOutlineFileExcel size={24} className={selectedFormat === 'excel' ? 'text-green-600' : 'text-gray-400'} />
                <span className="font-black text-[9px]">Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('pdf')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedFormat === 'pdf'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AiOutlineFilePdf size={24} className={selectedFormat === 'pdf' ? 'text-red-600' : 'text-gray-400'} />
                <span className="font-black text-[9px]">PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('csv')}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  selectedFormat === 'csv'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AiOutlineDownload size={24} className={selectedFormat === 'csv' ? 'text-blue-600' : 'text-gray-400'} />
                <span className="font-black text-[9px]">CSV</span>
              </button>
            </div>
          </div>

          {/* Bouton d'export */}
          <Button
            onClick={handleExport}
            className="w-full py-5 text-sm flex items-center justify-center gap-2"
            isLoading={isExporting}
            disabled={isExporting}
          >
            <AiOutlineDownload size={20} />
            {isExporting ? 'Export en cours...' : 'Lancer l\'export'}
          </Button>

          {selectedType === 'all' && selectedFormat !== 'excel' && (
            <p className="text-[9px] font-bold text-orange-600 text-center">
              L'export "Toutes les données" n'est disponible qu'au format Excel.
            </p>
          )}
        </div>
      </div>

      {/* Alert de succès */}
      <Alert
        isOpen={showSuccessAlert}
        variant="success"
        title="Export réussi"
        message={
          <div className="space-y-2">
            <p>{exportStats.count} élément(s) ont été exportés avec succès.</p>
            <p className="text-[10px] font-bold text-green-700">
              Vérifiez votre dossier de téléchargements.
            </p>
          </div>
        }
        confirmText="OK"
        onClose={() => setShowSuccessAlert(false)}
        onConfirm={() => setShowSuccessAlert(false)}
      />
    </div>
  );
};

export default ExportData;