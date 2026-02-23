import React, { useState, useMemo } from 'react';
import {
  AiOutlineArrowLeft,
  AiOutlineDownload,
  AiOutlinePrinter,
  AiOutlineDollar,
  AiOutlineCalendar,
  AiOutlineRise,
  AiOutlineFall,
  AiOutlinePieChart
} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../../hooks/useFinance';
import { formatCurrency } from '../../lib/helper/currencyHelpers';
import Button from '../../components/ui/Button';
import { THEME } from '../../styles/theme';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FinancialReport: React.FC = () => {
  const navigate = useNavigate();
  const { contributions, loadingContribs } = useFinance();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  const years = useMemo(() => {
    const uniqueYears = [...new Set(contributions.map(c => c.year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [contributions]);

  const filteredContribs = useMemo(() => {
    return contributions.filter(c => c.year === selectedYear);
  }, [contributions, selectedYear]);

  const stats = useMemo(() => {
    const totalDue = filteredContribs.reduce((sum, c) => sum + c.amount, 0);
    const totalPaid = filteredContribs.reduce((sum, c) => sum + c.totalPaid, 0);
    const totalRemaining = totalDue - totalPaid;
    const paidCount = filteredContribs.filter(c => c.remaining === 0).length;
    const pendingCount = filteredContribs.filter(c => c.remaining > 0).length;
    const paymentRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    return {
      totalDue,
      totalPaid,
      totalRemaining,
      paidCount,
      pendingCount,
      paymentRate
    };
  }, [filteredContribs]);

  const handleExport = () => {
    const data = filteredContribs.map(c => ({
      Membre: c.memberName,
      Année: c.year,
      'Montant dû': c.amount,
      'Montant payé': c.totalPaid,
      Reste: c.remaining,
      Statut: c.remaining === 0 ? 'Payé' : 'En attente'
    }));

    if (exportFormat === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport Financier');
      XLSX.writeFile(wb, `rapport_financier_${selectedYear}.xlsx`);
    } else {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Rapport Financier ${selectedYear}`, 14, 22);
      
      (doc as any).autoTable({
        head: [['Membre', 'Dû', 'Payé', 'Reste', 'Statut']],
        body: data.map(row => [
          row.Membre,
          row['Montant dû'].toLocaleString() + ' Ar',
          row['Montant payé'].toLocaleString() + ' Ar',
          row.Reste.toLocaleString() + ' Ar',
          row.Statut
        ]),
        startY: 30
      });
      
      doc.save(`rapport_financier_${selectedYear}.pdf`);
    }
  };

  if (loadingContribs) {
    return (
      <div className="p-8 text-center">
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 max-w-md mx-auto">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-black text-xl opacity-60">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
              Rapport Financier
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Analyse des cotisations
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
          <Button
            variant="secondary"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <AiOutlineDownload size={18} />
            Exporter
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <AiOutlinePrinter size={18} />
            Imprimer
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-[2.5rem] border-2 border-b-8 border-gray-100">
        <div className="flex items-center gap-4">
          <AiOutlineCalendar className="text-gray-400" size={20} />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="flex-1 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase">Total dû</p>
            <AiOutlineDollar className="text-brand-primary" size={20} />
          </div>
          <p className="text-2xl font-black">{formatCurrency(stats.totalDue, 'Ar')}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase">Total payé</p>
            <AiOutlineRise className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-black text-green-600">{formatCurrency(stats.totalPaid, 'Ar')}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase">Reste à percevoir</p>
            <AiOutlineFall className="text-orange-500" size={20} />
          </div>
          <p className="text-2xl font-black text-orange-600">{formatCurrency(stats.totalRemaining, 'Ar')}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase">Taux de recouvrement</p>
            <AiOutlinePieChart className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-black text-blue-600">{stats.paymentRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistiques globales */}
        <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6">
          <h2 className="text-sm font-black mb-6">STATISTIQUES GLOBALES</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <span className="font-black text-xs">Cotisations totales</span>
              <span className="font-black">{filteredContribs.length}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl">
              <span className="font-black text-xs text-green-700">Cotisations soldées</span>
              <span className="font-black text-green-700">{stats.paidCount}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-2xl">
              <span className="font-black text-xs text-orange-700">Cotisations en attente</span>
              <span className="font-black text-orange-700">{stats.pendingCount}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl">
              <span className="font-black text-xs text-blue-700">Moyenne par cotisation</span>
              <span className="font-black text-blue-700">
                {formatCurrency(stats.totalDue / (filteredContribs.length || 1), 'Ar')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6">
        <h2 className="text-sm font-black mb-6">DÉTAIL DES COTISATIONS</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-[8px] font-black text-gray-400 uppercase">Membre</th>
                <th className="p-4 text-[8px] font-black text-gray-400 uppercase">Montant</th>
                <th className="p-4 text-[8px] font-black text-gray-400 uppercase">Payé</th>
                <th className="p-4 text-[8px] font-black text-gray-400 uppercase">Reste</th>
                <th className="p-4 text-[8px] font-black text-gray-400 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContribs.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-4 font-black text-xs">{c.memberName}</td>
                  <td className="p-4 font-black">{formatCurrency(c.amount, 'Ar')}</td>
                  <td className="p-4 text-green-600 font-black">{formatCurrency(c.totalPaid, 'Ar')}</td>
                  <td className="p-4 text-orange-600 font-black">{formatCurrency(c.remaining, 'Ar')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black ${
                      c.remaining === 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {c.remaining === 0 ? 'Soldé' : 'En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;