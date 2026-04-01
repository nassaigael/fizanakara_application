import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../lib/helper';

// ================= FORMAT ARIARY (espace comme séparateur) =================
const formatAr = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '0 Ar';
    }
    return amount
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ar';
};

// ================= TYPES =================
interface InvoiceData {
    invoiceNumber: string;
    memberName: string;
    memberId: string;
    memberPhone?: string;
    memberEmail?: string;
    contributionId: string;
    year: number;
    amount: number;
    paidAmount: number;
    remaining: number;
    paymentDate: string;
    paymentMethod: string;
    paymentStatus: string;
    generatedBy: string;
}

// ================= MAIN =================
export const generatePaymentInvoice = async (data: InvoiceData) => {
    // Utiliser le format A4 pour plus de fiabilité
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Log pour déboguer
    console.log('Invoice data received:', {
        amount: data.amount,
        paidAmount: data.paidAmount,
        remaining: data.remaining,
        memberId: data.memberId,
        year: data.year,
        memberName: data.memberName
    });

    // Formater l'ID du membre
    const formattedMemberId = data.memberId && data.memberId !== 'N/A' && data.memberId !== 'INCONNU'
        ? (data.memberId.startsWith('MBR') ? data.memberId : `MBR${data.memberId}`)
        : 'MBR00000000';

    // Valeurs par défaut pour les montants
    const amount = data.amount || 0;
    const paidAmount = data.paidAmount || 0;
    const remaining = data.remaining !== undefined ? data.remaining : (amount - paidAmount);
    const year = data.year || new Date().getFullYear();
    const memberName = data.memberName || 'Membre non spécifié';

    // Couleurs
    const primary: [number, number, number] = [220, 38, 38];
    const border: [number, number, number] = [200, 200, 200];
    const lightBg: [number, number, number] = [248, 250, 252];
    const textDark: [number, number, number] = [30, 30, 30];
    const muted: [number, number, number] = [100, 100, 100];

    // ================= HEADER =================
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('FIZANAKARA', 20, 18);

    doc.setFontSize(9);
    doc.text('Système de gestion des cotisations', 20, 26);

    doc.setFontSize(10);
    doc.text(`Facture N°: ${data.invoiceNumber}`, pageWidth - 20, 15, { align: 'right' });
    doc.text(`Date: ${formatDate(data.paymentDate, 'long')}`, pageWidth - 20, 23, { align: 'right' });

    // ================= TITRE =================
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REÇU DE PAIEMENT', pageWidth / 2, 48, { align: 'center' });

    // ================= TABLEAU 1 - INFORMATIONS DU MEMBRE =================
    const memberInfoBody: Array<[string, string]> = [
        ['Nom complet:', memberName],
        ['ID Membre:', formattedMemberId]
    ];
    
    if (data.memberPhone) {
        memberInfoBody.push(['Téléphone:', data.memberPhone]);
    }
    
    if (data.memberEmail) {
        memberInfoBody.push(['Email:', data.memberEmail]);
    }

    autoTable(doc, {
        startY: 58,
        head: [['Informations du membre']],
        body: memberInfoBody,
        theme: 'plain',
        headStyles: {
            fillColor: lightBg,
            textColor: textDark,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left',
            cellPadding: 5
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: textDark,
            lineColor: border,
            lineWidth: 0.2
        },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 'auto' }
        },
        margin: { left: 20, right: 20 }
    });

    // ================= TABLEAU 2 - DÉTAILS DE LA COTISATION =================
    const cotisationY = (doc as any).lastAutoTable.finalY + 8;

    autoTable(doc, {
        startY: cotisationY,
        head: [['Détails de la cotisation']],
        body: [
            ['Période', `Année ${year}`],
            ['Montant total', formatAr(amount)],
            ['Montant payé', formatAr(paidAmount)],
            ['Reste à payer', formatAr(remaining)],
            ['Statut', data.paymentStatus === 'PAID' ? 'Payé' : data.paymentStatus === 'PARTIAL' ? 'Partiel' : 'En attente']
        ],
        theme: 'plain',
        headStyles: {
            fillColor: lightBg,
            textColor: textDark,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left',
            cellPadding: 5
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: textDark,
            lineColor: border,
            lineWidth: 0.2
        },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
    });

    // ================= TABLEAU 3 - DÉTAILS DU PAIEMENT =================
    const paiementY = (doc as any).lastAutoTable.finalY + 8;

    autoTable(doc, {
        startY: paiementY,
        head: [['Détails du paiement']],
        body: [
            ['Date du paiement', formatDate(data.paymentDate, 'long')],
            ['Mode de paiement', data.paymentMethod || 'Espèces / Virement'],
            ['Référence cotisation', data.contributionId || 'COT2026-001'],
            ['Reçu par', data.generatedBy || 'Administrateur']
        ],
        theme: 'plain',
        headStyles: {
            fillColor: lightBg,
            textColor: textDark,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'left',
            cellPadding: 5
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: textDark,
            lineColor: border,
            lineWidth: 0.2
        },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { halign: 'right' }
        },
        margin: { left: 20, right: 20 }
    });

    // ================= MESSAGE SUCCÈS =================
    const successY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFontSize(10);
    doc.setTextColor(0, 150, 80);
    doc.text('✓ Paiement enregistré avec succès', pageWidth / 2, successY, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text('Ce document fait foi pour la gestion des cotisations', pageWidth / 2, successY + 6, { align: 'center' });
    doc.text('Merci pour votre contribution !', pageWidth / 2, successY + 12, { align: 'center' });

    // ================= FOOTER =================
    const footerY = Math.min(successY + 22, pageHeight - 15);

    doc.setDrawColor(border[0], border[1], border[2]);
    doc.setLineWidth(0.3);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text('Fizanakara - Reçu officiel', 20, footerY + 6);
    doc.text('Document officiel • Système de gestion des cotisations', pageWidth - 20, footerY + 6, { align: 'right' });

    // Sauvegarde
    const safeMemberId = formattedMemberId.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `fizanakara_recu_${safeMemberId}_${year}.pdf`;
    console.log('Saving invoice:', fileName);
    doc.save(fileName);
};