import React, { useState, useMemo } from 'react';
import {
  AiOutlineArrowLeft,
  AiOutlineDownload,
  AiOutlinePrinter,
  AiOutlineTeam,
  AiOutlineGlobal,
  AiOutlineUser,
  AiOutlineRise
} from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useMembers } from '../../hooks/useMembers';
import { useDistrict } from '../../hooks/useDistrict';
import { useTribute } from '../../hooks/useTribute';
import { groupBy } from '../../lib/helper/arrayHelpers';
import { calculateAge } from '../../lib/helper/dateHelpers';
import { getFullName } from '../../lib/helper/stringHelpers';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { THEME } from '../../styles/theme';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MemberReport: React.FC = () => {
  const navigate = useNavigate();
  const { members, isLoading } = useMembers();
  const { districts } = useDistrict();
  const { tributes } = useTribute();

  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedTribute, setSelectedTribute] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (selectedDistrict && m.districtName !== selectedDistrict) return false;
      if (selectedTribute && m.tributeName !== selectedTribute) return false;
      if (selectedStatus) {
        if (selectedStatus === 'active' && !m.isActiveMember) return false;
        if (selectedStatus === 'inactive' && m.isActiveMember) return false;
      }
      return true;
    });
  }, [members, selectedDistrict, selectedTribute, selectedStatus]);

  const stats = useMemo(() => {
    const total = filteredMembers.length;
    const active = filteredMembers.filter(m => m.isActiveMember).length;
    const inactive = total - active;
    const workers = filteredMembers.filter(m => m.status === 'WORKER').length;
    const students = filteredMembers.filter(m => m.status === 'STUDENT').length;
    
    const byDistrict = groupBy(filteredMembers, 'districtName');
    const districtStats = Object.entries(byDistrict).map(([district, mems]) => ({
      district,
      count: mems.length
    })).sort((a, b) => b.count - a.count);

    const byTribute = groupBy(filteredMembers, 'tributeName');
    const tributeStats = Object.entries(byTribute).map(([tribute, mems]) => ({
      tribute,
      count: mems.length
    })).sort((a, b) => b.count - a.count);

    const ageGroups = filteredMembers.reduce((acc, m) => {
      const age = calculateAge(m.birthDate);
      if (age < 18) acc['0-17']++;
      else if (age < 30) acc['18-29']++;
      else if (age < 50) acc['30-49']++;
      else acc['50+']++;
      return acc;
    }, { '0-17': 0, '18-29': 0, '30-49': 0, '50+': 0 });

    return {
      total,
      active,
      inactive,
      workers,
      students,
      districtStats,
      tributeStats,
      ageGroups
    };
  }, [filteredMembers]);

  const handleExport = () => {
    const data = filteredMembers.map(m => ({
      'N° Séquence': m.sequenceNumber,
      Nom: getFullName(m.firstName, m.lastName),
      District: m.districtName,
      Tribu: m.tributeName,
      Statut: m.status === 'WORKER' ? 'Travailleur' : 'Étudiant',
      'Membre actif': m.isActiveMember ? 'Oui' : 'Non',
      Téléphone: m.phoneNumber || 'N/A',
      'Date naissance': m.birthDate,
      Âge: calculateAge(m.birthDate)
    }));

    if (exportFormat === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport Membres');
      XLSX.writeFile(wb, 'rapport_membres.xlsx');
    } else {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Rapport des Membres', 14, 22);
      
      (doc as any).autoTable({
        head: [['N°', 'Nom', 'District', 'Tribu', 'Statut', 'Âge']],
        body: data.map(row => [
          row['N° Séquence'],
          row.Nom,
          row.District,
          row.Tribu,
          row.Statut,
          row.Âge
        ]),
        startY: 30
      });
      
      doc.save('rapport_membres.pdf');
    }
  };

  if (isLoading) {
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
              Rapport des Membres
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              {filteredMembers.length} résultat(s)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="District"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            options={[
              { value: '', label: 'Tous les districts' },
              ...districts.map(d => ({ value: d.name, label: d.name }))
            ]}
          />
          <Select
            label="Tribu"
            value={selectedTribute}
            onChange={(e) => setSelectedTribute(e.target.value)}
            options={[
              { value: '', label: 'Toutes les tribus' },
              ...tributes.map(t => ({ value: t.name, label: t.name }))
            ]}
          />
          <Select
            label="Statut"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'active', label: 'Membres actifs' },
              { value: 'inactive', label: 'Membres inactifs' }
            ]}
          />
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase">Total membres</p>
            <AiOutlineTeam className="text-brand-primary" size={20} />
          </div>
          <p className="text-2xl font-black">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase">Membres actifs</p>
            <AiOutlineRise className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-black text-green-600">{stats.active}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase">Travailleurs</p>
            <AiOutlineUser className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-black text-blue-600">{stats.workers}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-b-8 border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[8px] font-black text-gray-400 uppercase">Étudiants</p>
            <AiOutlineUser className="text-orange-500" size={20} />
          </div>
          <p className="text-2xl font-black text-orange-600">{stats.students}</p>
        </div>
      </div>

      {/* Répartitions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Par district */}
        <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6">
          <h2 className="text-sm font-black mb-6 flex items-center gap-2">
            <AiOutlineGlobal className="text-brand-primary" />
            RÉPARTITION PAR DISTRICT
          </h2>
          <div className="space-y-3">
            {stats.districtStats.map((stat) => (
              <div key={stat.district} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <span className="font-black text-xs">{stat.district}</span>
                <span className="bg-brand-primary text-white px-3 py-1 rounded-full font-black text-[10px]">
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Par tribu */}
        <div className="bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6">
          <h2 className="text-sm font-black mb-6 flex items-center gap-2">
            <AiOutlineTeam className="text-orange-500" />
            RÉPARTITION PAR TRIBU
          </h2>
          <div className="space-y-3">
            {stats.tributeStats.map((stat) => (
              <div key={stat.tribute} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <span className="font-black text-xs">{stat.tribute}</span>
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full font-black text-[10px]">
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Par âge */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-b-8 border-gray-100 p-6">
          <h2 className="text-sm font-black mb-6">RÉPARTITION PAR ÂGE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.ageGroups).map(([group, count]) => (
              <div key={group} className="text-center p-4 bg-gray-50 rounded-2xl">
                <p className="text-[8px] font-black text-gray-400 uppercase mb-2">{group} ans</p>
                <p className="text-2xl font-black">{count}</p>
                <p className="text-[8px] font-bold text-gray-400 mt-1">
                  {((count / stats.total) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberReport;