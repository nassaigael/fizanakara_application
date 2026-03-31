import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../lib/helper';

// ================= FORMAT ARIARY (espace comme séparateur) =================
const formatAr = (amount: number): string => {
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
    // Format A3 : 297mm x 420mm
    const doc = new jsPDF({
        unit: 'mm',
        format: 'a3',
        orientation: 'portrait'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();

    // Formater l'ID du membre
    const formattedMemberId = data.memberId && data.memberId !== 'N/A' && data.memberId !== 'INCONNU'
        ? (data.memberId.startsWith('MBR') ? data.memberId : `MBR${data.memberId}`)
        : 'MBR00000000';

    // Couleurs
    const primary: [number, number, number] = [220, 38, 38];
    const border: [number, number, number] = [220, 220, 220];
    const lightBg: [number, number, number] = [248, 250, 252];
    const textDark: [number, number, number] = [30, 30, 30];
    const muted: [number, number, number] = [100, 100, 100];

    // ================= HEADER ROUGE =================
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('FIZANAKARA', 25, 22);

    doc.setFontSize(10);
    doc.text('Système de gestion des cotisations', 25, 30);

    // Facture N° et Date
    doc.setFontSize(11);
    doc.text(`Facture N°: ${data.invoiceNumber}`, pageWidth - 25, 15, { align: 'right' });
    doc.text(`Date: ${formatDate(data.paymentDate, 'long')}`, pageWidth - 25, 23, { align: 'right' });

    // ================= TITRE REÇU =================
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('REÇU DE PAIEMENT', pageWidth / 2, 58, { align: 'center' });

    // ================= TABLEAU 1 - INFORMATIONS DU MEMBRE =================
    const memberInfoBody: Array<[string, string]> = [
        ['Nom complet:', data.memberName || 'Membre non spécifié'],
        ['ID Membre:', formattedMemberId]
    ];
    
    if (data.memberPhone) {
        memberInfoBody.push(['Téléphone:', data.memberPhone]);
    }
    
    if (data.memberEmail) {
        memberInfoBody.push(['Email:', data.memberEmail]);
    }

    autoTable(doc, {
        startY: 70,
        head: [['Informations du membre']],
        body: memberInfoBody,
        theme: 'plain',
        headStyles: {
            fillColor: lightBg,
            textColor: textDark,
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'left',
            cellPadding: 6
        },
        bodyStyles: {
            fontSize: 10,
            cellPadding: 5,
            textColor: textDark,
            lineColor: border,
            lineWidth: 0.3
        },
        columnStyles: {
            0: { cellWidth: 65, fontStyle: 'bold' },
            1: { cellWidth: 0 }
        },
        margin: { left: 25, right: 25 }
    });

    // ================= TABLEAU 2 - DÉTAILS DE LA COTISATION =================
    const cotisationY = (doc as any).lastAutoTable.finalY + 12;

    autoTable(doc, {
        startY: cotisationY,
        head: [['Détails de la cotisation']],
        body: [
            ['Période', `Année ${data.year}`],
            ['Montant total', formatAr(data.amount)],
            ['Montant payé', formatAr(data.paidAmount)],
            ['Reste à payer', formatAr(data.remaining)],
            ['Statut', data.paymentStatus === 'PAID' ? 'Payé' : data.paymentStatus === 'PARTIAL' ? 'Partiel' : 'En attente']
        ],
        theme: 'plain',
        headStyles: {
            fillColor: lightBg,
            textColor: textDark,
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'left',
            cellPadding: 6
        },
        bodyStyles: {
            fontSize: 10,
            cellPadding: 5,
            textColor: textDark,
            lineColor: border,
            lineWidth: 0.3
        },
        columnStyles: {
            0: { cellWidth: 65, fontStyle: 'bold' },
            1: { halign: 'right' }
        },
        margin: { left: 25, right: 25 }
    });

    // ================= TABLEAU 3 - DÉTAILS DU PAIEMENT =================
    const paiementY = (doc as any).lastAutoTable.finalY + 12;

    autoTable(doc, {
        startY: paiementY,
        head: [['Détails du paiement']],
        body: [
            ['Date du paiement', formatDate(data.paymentDate, 'long')],
            ['Mode de paiement', data.paymentMethod],
            ['Référence cotisation', data.contributionId || 'COT2026-001'],
            ['Reçu par', data.generatedBy]
        ],
        theme: 'plain',
        headStyles: {
            fillColor: lightBg,
            textColor: textDark,
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'left',
            cellPadding: 6
        },
        bodyStyles: {
            fontSize: 10,
            cellPadding: 5,
            textColor: textDark,
            lineColor: border,
            lineWidth: 0.3
        },
        columnStyles: {
            0: { cellWidth: 65, fontStyle: 'bold' },
            1: { halign: 'right' }
        },
        margin: { left: 25, right: 25 }
    });

    // ================= MESSAGE SUCCÈS (vert) =================
    const successY = (doc as any).lastAutoTable.finalY + 18;

    doc.setFontSize(12);
    doc.setTextColor(0, 150, 80);
    doc.text('✓ Paiement enregistré avec succès', pageWidth / 2, successY, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text('Ce document fait foi pour la gestion des cotisations', pageWidth / 2, successY + 8, { align: 'center' });
    doc.text('Merci pour votre contribution !', pageWidth / 2, successY + 14, { align: 'center' });

    // ================= FOOTER =================
    const footerY = successY + 28;

    doc.setDrawColor(border[0], border[1], border[2]);
    doc.setLineWidth(0.5);
    doc.line(25, footerY, pageWidth - 25, footerY);

    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text('Fizanakara - Reçu officiel', 25, footerY + 8);
    doc.text('Document officiel • Système de gestion des cotisations', pageWidth - 25, footerY + 8, { align: 'right' });

    // Sauvegarde
    const safeMemberId = formattedMemberId.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`fizanakara_recu_${safeMemberId}_${data.year}.pdf`);
};