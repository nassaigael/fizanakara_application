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

// Format spécifique pour le PDF (Ar)
const formatAr = (amount: number): string => {
    return amount.toLocaleString('fr-FR') + ' Ar';
};

export const generateContributionReport = async (options: ReportOptions) => {
    const { title, year, data, totalDue, totalPaid, totalRemaining, generatedBy } = options;
    
    // Créer un nouveau document PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Couleurs
    const primaryColor: [number, number, number] = [229, 26, 26];
    const secondaryColor: [number, number, number] = [100, 116, 139];
    const accentColor: [number, number, number] = [34, 197, 94];
    const warningColor: [number, number, number] = [245, 158, 11];
    const lightGray: [number, number, number] = [249, 250, 251];
    const borderColor: [number, number, number] = [229, 231, 235];
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [31, 41, 55];
    
    // ==================== HEADER ====================
    // Ligne colorée en haut
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 8, 'F');
    
    // Titre principal
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('FIZANAKARA', 20, 22);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Rapport des cotisations', 20, 30);
    
    // Date de génération
    const currentDate = formatDate(new Date().toISOString(), 'long');
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(currentDate, pageWidth - 20, 22, { align: 'right' });
    
    // ==================== TITRE DU RAPPORT ====================
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(title, pageWidth / 2, 45, { align: 'center' });
    
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.3);
    doc.line(40, 50, pageWidth - 40, 50);
    
    // ==================== INFORMATIONS ====================
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(black[0], black[1], black[2]);
    
    doc.text(`Année: ${year}`, 20, 60);
    doc.text(`Généré par: ${generatedBy}`, 20, 66);
    doc.text(`Nombre de membres: ${data.length}`, pageWidth - 20, 60, { align: 'right' });
    
    // ==================== STATISTIQUES ====================
    const statsY = 80;
    const cardWidth = (pageWidth - 40) / 3;
    
    const statsCards = [
        { title: 'Total Dû', value: formatAr(totalDue), color: primaryColor },
        { title: 'Total Payé', value: formatAr(totalPaid), color: accentColor },
        { title: 'Reste à Payer', value: formatAr(totalRemaining), color: warningColor }
    ];
    
    statsCards.forEach((card, index) => {
        const x = 20 + (index * cardWidth);
        const y = statsY;
        
        // Fond de la carte
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(x, y, cardWidth - 2, 28, 'F');
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(x, y, cardWidth - 2, 28, 'S');
        
        // Titre
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(card.title, x + 5, y + 8);
        
        // Valeur
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.text(card.value, x + 5, y + 20);
    });
    
    // ==================== TAUX DE RECOUVREMENT ====================
    const recoveryRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
    const recoveryY = statsY + 38;
    
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(20, recoveryY, pageWidth - 40, 15, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('Taux de recouvrement', 30, recoveryY + 10);
    
    // Valeur du taux avec couleur
    const rateColor = recoveryRate >= 80 ? accentColor : recoveryRate >= 50 ? warningColor : primaryColor;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(rateColor[0], rateColor[1], rateColor[2]);
    doc.text(`${recoveryRate.toFixed(1)}%`, pageWidth - 45, recoveryY + 10, { align: 'right' });
    
    // ==================== TABLEAU DES CONTRIBUTIONS ====================
    const tableStartY = recoveryY + 25;
    
    // En-tête du tableau
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('Détail des cotisations', 20, tableStartY);
    
    // Préparer les données du tableau avec format Ar
    const tableData: any[][] = data.map(item => [
        item.memberName,
        item.year.toString(),
        formatAr(item.amount),
        formatAr(item.totalPaid),
        formatAr(item.remaining),
        item.status
    ]);
    
    if (tableData.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Aucune cotisation enregistrée', pageWidth / 2, tableStartY + 20, { align: 'center' });
    } else {
        autoTable(doc, {
            startY: tableStartY + 5,
            head: [['Membre', 'Année', 'Montant', 'Payé', 'Reste', 'Statut']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: primaryColor,
                textColor: white,
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center',
                valign: 'middle'
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 4,
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: lightGray
            },
            columnStyles: {
                0: { cellWidth: 45, halign: 'left' },
                1: { cellWidth: 18, halign: 'center' },
                2: { cellWidth: 28, halign: 'right' },
                3: { cellWidth: 28, halign: 'right' },
                4: { cellWidth: 28, halign: 'right' },
                5: { cellWidth: 25, halign: 'center' }
            },
            margin: { left: 20, right: 20 },
            didDrawCell: (data) => {
                // Colorer les cellules de statut
                if (data.column.index === 5 && data.row.section === 'body') {
                    const status = Array.isArray(data.cell.text) ? data.cell.text[0] : data.cell.text as string;
                    let color: [number, number, number] = [209, 250, 229];
                    let textColor: [number, number, number] = [6, 95, 70];
                    
                    if (status === 'Partiel') {
                        color = [254, 243, 199];
                        textColor = [180, 83, 9];
                    } else if (status === 'En attente') {
                        color = [254, 226, 226];
                        textColor = [185, 28, 28];
                    }
                    
                    const ctx = (doc as any).context;
                    if (ctx) {
                        ctx.save();
                        ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                        ctx.fillRect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
                        ctx.fillStyle = `rgb(${textColor[0]}, ${textColor[1]}, ${textColor[2]})`;
                        ctx.font = 'bold 8px helvetica';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(status, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2);
                        ctx.restore();
                    }
                }
            }
        });
    }
    
    // ==================== PIED DE PAGE ====================
    const finalY = (doc as any).lastAutoTable?.finalY || pageHeight - 30;
    const footerY = Math.min(finalY + 15, pageHeight - 15);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY - 3, pageWidth - 20, footerY - 3);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Fizanakara - Rapport des cotisations', pageWidth / 2, footerY, { align: 'center' });
    
    // Numéro de page
    let pageCount = 1;
    try {
        pageCount = (doc as any).internal?.getNumberOfPages?.() || 1;
    } catch {
        pageCount = 1;
    }
    
    for (let i = 1; i <= pageCount; i++) {
        try {
            doc.setPage(i);
        } catch {
            // Ignorer
        }
        doc.setFontSize(7);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`Page ${i} / ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }
    
    // Télécharger le PDF
    const fileName = `fizanakara_rapport_${year}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};