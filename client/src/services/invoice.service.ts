import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '../lib/helper';

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

// Fonction pour générer le numéro de facture
const generateInvoiceNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}${day}-${random}`;
};

// Dessiner le logo
const drawLogo = (doc: jsPDF, x: number, y: number, size: number) => {
    doc.setFillColor(229, 26, 26);
    doc.circle(x + size / 2, y + size / 2, size / 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(size * 0.55);
    doc.setFont('helvetica', 'bold');
    doc.text('F', x + size / 2, y + size / 2 + size * 0.18, { align: 'center' });
};

export const generatePaymentInvoice = async (data: InvoiceData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Couleurs
    const primary: [number, number, number] = [229, 26, 26];
    const secondary: [number, number, number] = [100, 116, 139];
    const success: [number, number, number] = [34, 197, 94];
    const lightGray: [number, number, number] = [249, 250, 251];
    const border: [number, number, number] = [229, 231, 235];
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [31, 41, 55];

    // ==================== HEADER ====================
    // Bandeau rouge
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Logo
    drawLogo(doc, 15, 8, 12);

    // Titre
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('FIZANAKARA', 32, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Système de gestion des cotisations', 32, 25);

    // Numéro de facture
    const invoiceNumber = data.invoiceNumber || generateInvoiceNumber();
    doc.setFontSize(9);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text(`Facture N°: ${invoiceNumber}`, pageWidth - 20, 15, { align: 'right' });
    doc.text(`Date: ${formatDate(data.paymentDate, 'long')}`, pageWidth - 20, 22, { align: 'right' });

    // ==================== TITRE FACTURE ====================
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REÇU DE PAIEMENT', pageWidth / 2, 50, { align: 'center' });

    doc.setDrawColor(border[0], border[1], border[2]);
    doc.line(40, 55, pageWidth - 40, 55);

    // ==================== INFORMATIONS MEMBRE ====================
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('Informations du membre', 20, 68);

    doc.setDrawColor(border[0], border[1], border[2]);
    doc.line(20, 70, 70, 70);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.text('Nom complet:', 20, 80);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(data.memberName, 60, 80);

    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.text('ID Membre:', 20, 87);
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text(data.memberId, 60, 87);

    if (data.memberPhone) {
        doc.setTextColor(secondary[0], secondary[1], secondary[2]);
        doc.text('Téléphone:', 20, 94);
        doc.setTextColor(black[0], black[1], black[2]);
        doc.text(data.memberPhone, 60, 94);
    }

    if (data.memberEmail) {
        doc.setTextColor(secondary[0], secondary[1], secondary[2]);
        doc.text('Email:', 20, 101);
        doc.setTextColor(black[0], black[1], black[2]);
        doc.text(data.memberEmail, 60, 101);
    }

    // ==================== DÉTAILS COTISATION ====================
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('Détails de la cotisation', 20, 115);

    doc.setDrawColor(border[0], border[1], border[2]);
    doc.line(20, 117, 70, 117);

    const tableData = [
        ['Période', `Année ${data.year}`],
        ['Montant total', formatCurrency(data.amount)],
        ['Montant payé', formatCurrency(data.paidAmount)],
        ['Reste à payer', formatCurrency(data.remaining)],
        ['Statut', data.paymentStatus === 'PAID' ? 'Payé' : data.paymentStatus === 'PARTIAL' ? 'Partiel' : 'En attente']
    ];

    autoTable(doc, {
        startY: 122,
        body: tableData,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 5,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', textColor: secondary },
            1: { cellWidth: 80, textColor: black }
        },
        margin: { left: 20 }
    });

    // ==================== DÉTAILS PAIEMENT ====================
    const tableStartY = (doc as any).lastAutoTable?.finalY || 140;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(black[0], black[1], black[2]);
    doc.text('Détails du paiement', 20, tableStartY + 8);

    doc.setDrawColor(border[0], border[1], border[2]);
    doc.line(20, tableStartY + 10, 70, tableStartY + 10);

    const paymentTableData = [
        ['Date du paiement', formatDate(data.paymentDate, 'long')],
        ['Mode de paiement', data.paymentMethod],
        ['Référence cotisation', data.contributionId],
        ['Reçu par', data.generatedBy]
    ];

    autoTable(doc, {
        startY: tableStartY + 15,
        body: paymentTableData,
        theme: 'plain',
        styles: {
            fontSize: 9,
            cellPadding: 5,
            valign: 'middle'
        },
        columnStyles: {
            0: { cellWidth: 45, fontStyle: 'bold', textColor: secondary },
            1: { cellWidth: 80, textColor: black }
        },
        margin: { left: 20 }
    });

    // ==================== MESSAGE DE REMERCIEMENT ====================
    const finalY = (doc as any).lastAutoTable?.finalY || 200;

    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(20, finalY + 12, pageWidth - 40, 25, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(success[0], success[1], success[2]);
    doc.text('✓ Paiement enregistré avec succès', pageWidth / 2, finalY + 24, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.text('Merci pour votre contribution !', pageWidth / 2, finalY + 33, { align: 'center' });

    // ==================== PIED DE PAGE ====================
    doc.setDrawColor(border[0], border[1], border[2]);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(secondary[0], secondary[1], secondary[2]);
    doc.text('Fizanakara - Reçu officiel', pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text('Ce document fait foi pour la gestion des cotisations', pageWidth / 2, pageHeight - 7, { align: 'center' });

    // Télécharger le PDF
    const fileName = `facture_${data.memberId}_${data.year}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};