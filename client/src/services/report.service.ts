import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '../lib/helper';

interface ContributionData {
    memberName: string;
    year: number;
    amount: number;
    totalPaid: number;
    remaining: number;
    status: string;
}

interface ReportOptions {
    title: string;
    year: number;
    data: ContributionData[];
    totalDue: number;
    totalPaid: number;
    totalRemaining: number;
    generatedBy: string;
}

export const generateContributionReport = (options: ReportOptions) => {
    const { title, year, data, totalDue, totalPaid, totalRemaining, generatedBy } = options;
    
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Couleurs au format RGB pour jsPDF (doivent être des tableaux de 3 nombres)
    const primaryColor: [number, number, number] = [229, 26, 26]; // #E51A1A
    const secondaryColor: [number, number, number] = [100, 116, 139]; // #64748B
    const lightGray: [number, number, number] = [245, 245, 247];
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [0, 0, 0];
    
    // Header avec logo
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FIZANAKARA', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Contribution Management Report', 20, 33);
    
    // Titre du rapport
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 55, { align: 'center' });
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(10);
    doc.text(`Année: ${year}`, 20, 70);
    doc.text(`Généré le: ${formatDate(new Date().toISOString(), 'long')}`, 20, 77);
    doc.text(`Généré par: ${generatedBy}`, 20, 84);
    
    // Statistiques
    const statsY = 100;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(20, statsY - 5, pageWidth - 40, 35, 'F');
    
    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    doc.text('Total Dû', 30, statsY + 8);
    doc.text('Total Payé', pageWidth / 2 - 30, statsY + 8);
    doc.text('Reste à Payer', pageWidth - 50, statsY + 8);
    
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(formatCurrency(totalDue), 30, statsY + 18);
    doc.text(formatCurrency(totalPaid), pageWidth / 2 - 30, statsY + 18);
    doc.text(formatCurrency(totalRemaining), pageWidth - 50, statsY + 18);
    
    // Taux de recouvrement
    const recoveryRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(9);
    doc.text(`Taux de recouvrement: ${recoveryRate.toFixed(1)}%`, 20, statsY + 30);
    
    // Tableau des contributions
    const tableData = data.map(item => [
        item.memberName,
        item.year.toString(),
        formatCurrency(item.amount),
        formatCurrency(item.totalPaid),
        formatCurrency(item.remaining),
        item.status
    ]);
    
    autoTable(doc, {
        startY: statsY + 45,
        head: [['Membre', 'Année', 'Montant', 'Payé', 'Reste', 'Statut']],
        body: tableData,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: white,
            fontStyle: 'bold',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8
        },
        alternateRowStyles: {
            fillColor: lightGray
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 25 },
            2: { cellWidth: 35 },
            3: { cellWidth: 35 },
            4: { cellWidth: 35 },
            5: { cellWidth: 30 }
        },
        margin: { left: 20, right: 20 }
    });
    
    // Pied de page
    const finalY = (doc as any).lastAutoTable?.finalY || pageHeight - 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, finalY + 10, pageWidth - 20, finalY + 10);
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(8);
    doc.text('Fizanakara - Système de gestion des cotisations', pageWidth / 2, finalY + 20, { align: 'center' });
    doc.text(`Page 1 sur 1`, pageWidth - 20, finalY + 20, { align: 'right' });
    
    // Télécharger le PDF
    doc.save(`contribution_report_${year}_${formatDate(new Date().toISOString(), 'short').replace(/\//g, '-')}.pdf`);
};