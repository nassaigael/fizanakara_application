import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../lib/helper';
import QRCode from 'qrcode';

// ================= TYPES =================
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

// ================= FORMAT AR =================
const formatAr = (amount: number): string => {
    return amount
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' Ar';
};

// ================= MAIN =================
export const generateContributionReport = async (options: ReportOptions) => {
    const { title, year, data, totalDue, totalPaid, totalRemaining, generatedBy } = options;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    //  COULEURS (typées)
    const primary: [number, number, number] = [220, 38, 38];
    const bg: [number, number, number] = [247, 247, 247];
    const border: [number, number, number] = [229, 229, 229];
    const text: [number, number, number] = [46, 46, 46];
    const muted: [number, number, number] = [138, 143, 153];

    // ================= HEADER =================
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, pageWidth, 25, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('FIZANAKARA', 20, 12);

    doc.setFontSize(9);
    doc.text('Organisation officielle - Rapport financier', 20, 18);

    const reference = `nassaigael.github.io`;

    doc.setFontSize(8);
    doc.text(`Réf: ${reference}`, pageWidth - 20, 12, { align: 'right' });
    doc.text(formatDate(new Date().toISOString(), 'long'), pageWidth - 20, 18, { align: 'right' });

    // ================= TITRE =================
    doc.setTextColor(text[0], text[1], text[2]);
    doc.setFontSize(14);
    doc.text(title, 20, 35);

    doc.setDrawColor(border[0], border[1], border[2]);
    doc.line(20, 38, pageWidth - 20, 38);

    // ================= INFOS =================
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(20, 42, pageWidth - 40, 22, 'F');

    doc.setFontSize(8);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text(`Année : ${year}`, 25, 50);
    doc.text(`Responsable : ${generatedBy}`, 25, 55);
    doc.text(`Membres : ${data.length}`, 25, 60);

    // ================= KPI =================
    const kpiY = 70;
    const cardW = (pageWidth - 40) / 3;

    const kpis = [
        { label: 'TOTAL DÛ', value: formatAr(totalDue) },
        { label: 'TOTAL PAYÉ', value: formatAr(totalPaid) },
        { label: 'RESTE', value: formatAr(totalRemaining) }
    ];

    kpis.forEach((kpi, i) => {
        const x = 20 + i * cardW;

        doc.setFillColor(255, 255, 255);
        (doc as any).roundedRect(x, kpiY, cardW - 5, 22, 2, 2, 'F');

        doc.setDrawColor(border[0], border[1], border[2]);
        (doc as any).roundedRect(x, kpiY, cardW - 5, 22, 2, 2, 'S');

        doc.setFontSize(7);
        doc.setTextColor(muted[0], muted[1], muted[2]);
        doc.text(kpi.label, x + 4, kpiY + 7);

        doc.setFontSize(10);
        doc.setTextColor(primary[0], primary[1], primary[2]);
        doc.text(kpi.value, x + 4, kpiY + 16);
    });

    // ================= TABLE =================
    const tableData: (string | number)[][] = data.map((d: ContributionData) => [
        d.memberName,
        d.year,
        formatAr(d.amount),
        formatAr(d.totalPaid),
        formatAr(d.remaining),
        d.status
    ]);

    autoTable(doc, {
        startY: 100,
        head: [['Membre', 'Année', 'Montant', 'Payé', 'Reste', 'Statut']],
        body: tableData,

        headStyles: {
            fillColor: primary,
            textColor: [255, 255, 255],
            fontSize: 7
        },

        bodyStyles: {
            fontSize: 7,
            cellPadding: 2
        },

        styles: {
            lineColor: border,
            lineWidth: 0.2
        },

        columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' }
        }
    });

    // ================= QR CODE =================
    const developerName = "Gaël RAMAHANDRISOA";

    const qrData = `
FIZANAKARA - RAPPORT OFFICIEL

Année: ${year}
Total dû: ${formatAr(totalDue)}
Total payé: ${formatAr(totalPaid)}
Reste: ${formatAr(totalRemaining)}

Membres: ${data.length}
Responsable: ${generatedBy}

Développeur: ${developerName}
Référence: ${reference}
Date: ${formatDate(new Date().toISOString(), 'short')}
`.trim();

    const qrImage = await QRCode.toDataURL(qrData);

    doc.addImage(qrImage, 'PNG', 20, pageHeight - 40, 28, 28);

    doc.setFontSize(6);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text('Scanner pour vérifier le rapport', 20, pageHeight - 8);

    // ================= FOOTER =================
    doc.setDrawColor(border[0], border[1], border[2]);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

    doc.setFontSize(6);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text('Fizanakara • Document officiel', 20, pageHeight - 10);

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(`Page ${i}/${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    doc.save(`rapport-officiel-${year}.pdf`);
};