import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from '../lib/helper';

interface ReceiptData {
    memberName: string;
    memberId: string;
    year: number;
    amount: number;
    totalPaid: number;
    remaining: number;
    status: string;
    paymentDate: string;
    generatedBy: string;
}

export const generateContributionReceipt = async (data: ReceiptData) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const primaryColor: [number, number, number] = [229, 26, 26];
    const secondaryColor: [number, number, number] = [100, 116, 139];
    const white: [number, number, number] = [255, 255, 255];
    const black: [number, number, number] = [31, 41, 55];

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 20, 'F');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('FIZANAKARA', 20, 12);

    doc.setFontSize(8);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('Reçu de cotisation', pageWidth - 20, 12, { align: 'right' });

    // Titre
    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFontSize(14);
    doc.text('REÇU DE COTISATION', pageWidth / 2, 35, { align: 'center' });

    // Ligne
    doc.setDrawColor(200, 200, 200);
    doc.line(40, 40, pageWidth - 40, 40);

    // Informations du membre
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Membre:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(data.memberName, 50, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text('ID:', 20, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(data.memberId, 50, 62);

    // Détails de la cotisation
    doc.setFont('helvetica', 'bold');
    doc.text('Année:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(data.year.toString(), 50, 75);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Montant total:', 20, 82);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(formatCurrency(data.amount), 50, 82);

    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Montant payé:', 20, 89);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(34, 197, 94);
    doc.text(formatCurrency(data.totalPaid), 50, 89);

    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Reste à payer:', 20, 96);
    doc.setFont('helvetica', 'normal');
    // Correction: utiliser if/else pour les couleurs
    if (data.remaining > 0) {
        doc.setTextColor(245, 158, 11);
    } else {
        doc.setTextColor(34, 197, 94);
    }
    doc.text(formatCurrency(data.remaining), 50, 96);
    
    doc.setTextColor(black[0], black[1], black[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Statut:', 20, 103);
    doc.setFont('helvetica', 'normal');
    const statusText = data.status === 'PAID' ? 'Payé' : data.status === 'PARTIAL' ? 'Partiel' : 'En attente';
    doc.text(statusText, 50, 103);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date du paiement:', 20, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(data.paymentDate, 'long'), 50, 110);
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 125, pageWidth - 20, 125);
    
    // Message de remerciement
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Merci pour votre contribution !', pageWidth / 2, 138, { align: 'center' });
    
    // Signature
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Fait à Fianarantsoa, le ' + formatDate(new Date().toISOString(), 'long'), 20, 155);
    doc.text('Signature de l\'administrateur:', 20, 170);
    doc.line(70, 168, 120, 168);
    
    // Pied de page
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
    doc.setFontSize(6);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text('Fizanakara - Reçu officiel', pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Sauvegarder le PDF
    doc.save(`recu_${data.memberId}_${data.year}.pdf`);
};