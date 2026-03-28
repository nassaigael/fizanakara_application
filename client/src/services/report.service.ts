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

// Fonction pour dessiner le logo avec un cercle et du texte
const drawLogo = (doc: jsPDF, x: number, y: number, size: number) => {
    // Cercle de fond
    doc.setFillColor(229, 26, 26);
    doc.circle(x + size / 2, y + size / 2, size / 2, 'F');

    // Lettre F stylisée
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(size * 0.6);
    doc.setFont('helvetica', 'bold');
    doc.text('F', x + size / 2, y + size / 2 + size * 0.2, { align: 'center' });
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
    // Fond coloré en haut
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo et titre
    drawLogo(doc, 15, 10, 15);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('FIZANAKARA', 35, 25);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('Système de gestion des cotisations', 35, 33);

    // Date de génération en haut à droite
    const currentDate = formatDate(new Date().toISOString(), 'long');
    doc.setFontSize(8);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text(`Généré le: ${currentDate}`, pageWidth - 20, 20, { align: 'right' });
    doc.text(`Document officiel`, pageWidth - 20, 27, { align: 'right' });

    // ==================== TITRE DU RAPPORT ====================
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 60, { align: 'center' });

    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.line(40, 65, pageWidth - 40, 65);

    // ==================== INFORMATIONS ====================
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Boîte d'informations
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(20, 72, pageWidth - 40, 25, 'F');
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.rect(20, 72, pageWidth - 40, 25, 'S');

    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(`Année de référence: ${year}`, 30, 82);
    doc.text(`Généré par: ${generatedBy}`, 30, 90);
    doc.text(`Nombre de membres: ${data.length}`, pageWidth - 40, 82, { align: 'right' });
    doc.text(`Statut: Rapport final`, pageWidth - 40, 90, { align: 'right' });

    // ==================== STATISTIQUES ====================
    const statsY = 107;
    const cardWidth = (pageWidth - 40) / 3;

    const statsCards = [
        { title: 'Total Dû', value: formatCurrency(totalDue), color: primaryColor, icon: '💰' },
        { title: 'Total Payé', value: formatCurrency(totalPaid), color: accentColor, icon: '✅' },
        { title: 'Reste à Payer', value: formatCurrency(totalRemaining), color: warningColor, icon: '⚠️' }
    ];

    statsCards.forEach((card, index) => {
        const x = 20 + (index * cardWidth);
        const y = statsY;

        // Fond de la carte
        doc.setFillColor(white[0], white[1], white[2]);
        doc.rect(x, y, cardWidth - 2, 35, 'F');
        doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        doc.rect(x, y, cardWidth - 2, 35, 'S');

        // Icône
        doc.setFontSize(14);
        doc.text(card.icon, x + 5, y + 12);

        // Titre
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(card.title, x + 12, y + 10);

        // Valeur
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.text(card.value, x + 12, y + 25);
    });

    // Taux de recouvrement
    const recoveryRate = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;
    const recoveryY = statsY + 45;

    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(20, recoveryY, pageWidth - 40, 18, 'F');

    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Taux de recouvrement', 30, recoveryY + 11);

    // Barre de progression
    const barX = 80;
    const barWidth = pageWidth - 100;
    const barHeight = 6;

    doc.setFillColor(229, 231, 235);
    doc.rect(barX, recoveryY + 6, barWidth, barHeight, 'F');

    const progressColor = recoveryRate >= 80 ? accentColor : recoveryRate >= 50 ? warningColor : primaryColor;
    doc.setFillColor(progressColor[0], progressColor[1], progressColor[2]);
    doc.rect(barX, recoveryY + 6, barWidth * (recoveryRate / 100), barHeight, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(progressColor[0], progressColor[1], progressColor[2]);
    doc.text(`${recoveryRate.toFixed(1)}%`, pageWidth - 25, recoveryY + 11, { align: 'right' });

    // ==================== TABLEAU DES CONTRIBUTIONS ====================
    const tableStartY = recoveryY + 30;

    // En-tête du tableau
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('Détail des cotisations', 20, tableStartY - 5);

    // Préparer les données du tableau
    const tableData: any[][] = data.map(item => [
        item.memberName,
        item.year.toString(),
        formatCurrency(item.amount),
        formatCurrency(item.totalPaid),
        formatCurrency(item.remaining),
        item.status
    ]);

    // Ajouter un message si aucune donnée
    if (tableData.length === 0) {
        doc.setFontSize(10);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Aucune cotisation enregistrée pour cette période', pageWidth / 2, tableStartY + 20, { align: 'center' });
    } else {
        autoTable(doc, {
            startY: tableStartY,
            head: [['Membre', 'Année', 'Montant', 'Payé', 'Reste', 'Statut']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: primaryColor,
                textColor: white,
                fontStyle: 'bold',
                fontSize: 9,
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
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right' },
                5: { cellWidth: 25, halign: 'center' }
            },
            margin: { left: 20, right: 20 },
            didDrawCell: (data) => {
                // Colorer les cellules de statut
                if (data.column.index === 5 && data.row.section === 'body') {
                    // Récupérer le texte de la cellule correctement
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

                    // Appliquer les couleurs via le contexte canvas
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
    const finalY = (doc as any).lastAutoTable?.finalY || pageHeight - 40;
    const footerY = Math.min(finalY + 20, pageHeight - 20);

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    // Texte du pied de page
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Fizanakara - Système de gestion des cotisations', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Document généré le ${currentDate} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, footerY + 5, { align: 'center' });
    doc.text('Ce document fait foi pour la gestion des cotisations', pageWidth / 2, footerY + 10, { align: 'center' });

    // Numéro de page - Utiliser une méthode alternative
    let pageCount = 1;
    try {
        // Essayer d'obtenir le nombre de pages via internal
        pageCount = (doc as any).internal?.getNumberOfPages?.() || 1;
    } catch {
        pageCount = 1;
    }

    for (let i = 1; i <= pageCount; i++) {
        try {
            doc.setPage(i);
        } catch {
            // Si setPage échoue, continuer
        }
        doc.setFontSize(7);
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    // Télécharger le PDF
    const fileName = `fizanakara_rapport_cotisations_${year}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};