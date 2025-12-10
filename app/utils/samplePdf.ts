import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { showError, showSuccess } from '@/app/utils/sweetalert';

interface SampleData {
    id: number;
    paciente_nombre: string;
    cedula: string;
    fecha_toma: string;
    observaciones?: string;
    detalles: Array<{
        tipo_muestra: string;
        resultados: any;
        observaciones?: string;
    }>;
}

export const generateSamplePDF = (muestra: SampleData) => {
    try {
        const pdf = new jsPDF('l', 'mm', 'letter'); // Landscape, Letter size
        const pageWidth = pdf.internal.pageSize.getWidth();
        let yPosition = 20;

        // --- Header ---
        // Logo placeholder (simulated)
        // pdf.addImage(logoBase64, 'PNG', 10, 10, 30, 30); 

        pdf.setFontSize(22);
        pdf.setTextColor(37, 99, 235); // Blue
        pdf.text('Resultados de Laboratorio', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, pageWidth - 15, 10, { align: 'right' });

        // --- Patient Info Box ---
        yPosition += 10;
        pdf.setFillColor(243, 244, 246);
        pdf.rect(10, yPosition, pageWidth - 20, 25, 'F');

        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);

        const col1X = 15;
        const col2X = pageWidth / 2;

        pdf.setFont('helvetica', 'bold');
        pdf.text(`Paciente:`, col1X, yPosition + 7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(muestra.paciente_nombre, col1X + 20, yPosition + 7);

        pdf.setFont('helvetica', 'bold');
        pdf.text(`Cédula:`, col1X, yPosition + 15);
        pdf.setFont('helvetica', 'normal');
        pdf.text(muestra.cedula || 'N/A', col1X + 20, yPosition + 15);

        pdf.setFont('helvetica', 'bold');
        pdf.text(`Orden #:`, col2X, yPosition + 7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(muestra.id.toString(), col2X + 20, yPosition + 7);

        pdf.setFont('helvetica', 'bold');
        pdf.text(`Fecha Muestra:`, col2X, yPosition + 15);
        pdf.setFont('helvetica', 'normal');
        pdf.text(new Date(muestra.fecha_toma).toLocaleDateString('es-ES'), col2X + 30, yPosition + 15);

        yPosition += 35;

        // --- Title ---
        pdf.setFontSize(16);
        pdf.setTextColor(37, 99, 235);
        pdf.text(`Muestra #${muestra.id} - ${new Date(muestra.fecha_toma).toLocaleDateString('es-ES')}`, 10, yPosition);
        yPosition += 10;

        if (muestra.observaciones) {
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128); // Gray
            pdf.setFont('helvetica', 'italic');
            pdf.text(muestra.observaciones, 10, yPosition);
            pdf.setFont('helvetica', 'normal');
            yPosition += 10;
        }

        // --- Tables per Detail ---
        muestra.detalles.forEach((detalle) => {
            // Check page break
            if (yPosition > 180) {
                pdf.addPage();
                yPosition = 20;
            }

            let titulo = detalle.tipo_muestra.toUpperCase();
            switch (detalle.tipo_muestra) {
                case 'sangre': titulo = 'HEMATOLOGÍA COMPLETA'; break;
                case 'orina': titulo = 'UROANÁLISIS'; break;
                case 'heces': titulo = 'COPROLÓGICO'; break;
            }

            // Section Title
            pdf.setFontSize(12);
            pdf.setTextColor(37, 99, 235);
            pdf.setFont('helvetica', 'bold');
            pdf.text(titulo, 10, yPosition);
            yPosition += 5;

            // Table Data
            const bodyData = obtenerFilasPorTipo(detalle.tipo_muestra, detalle.resultados || {});
            const tableData = bodyData.map(row => [
                row.param,
                row.valor !== undefined && row.valor !== null && row.valor !== '' ? row.valor.toString() : '-',
                row.unidad,
                row.referencia
            ]);

            autoTable(pdf, {
                startY: yPosition,
                head: [['Parámetro', 'Resultado', 'Unidad', 'Valores de Referencia']],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [37, 99, 235],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: { fontSize: 9 },
                margin: { left: 10, right: 10 },
                columnStyles: {
                    0: { cellWidth: 60 }, // Parámetro
                    1: { cellWidth: 40, fontStyle: 'bold' }, // Resultado
                    2: { cellWidth: 30 }, // Unidad
                    3: { cellWidth: 'auto' } // Referencia
                }
            });

            yPosition = (pdf as any).lastAutoTable?.finalY || yPosition + 10;
            yPosition += 10;

            if (detalle.observaciones) {
                if (yPosition > 190) { pdf.addPage(); yPosition = 20; }

                pdf.setFontSize(9);
                pdf.setTextColor(0, 0, 0);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Observaciones:', 10, yPosition);
                yPosition += 5;

                pdf.setFont('helvetica', 'normal');
                pdf.text(detalle.observaciones, 10, yPosition);
                yPosition += 10;
            }

            yPosition += 5; // Spacing between sections
        });

        // Footer
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text(`Página ${i} de ${pageCount} - Laboratorio Clínico`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

        pdf.save(`Reporte_${muestra.paciente_nombre.replace(/\s+/g, '_')}_${muestra.id}.pdf`);
        showSuccess('PDF descargado', 'El reporte se ha generado correctamente.');

    } catch (err: any) {
        console.error('Error generando PDF:', err);
        showError('Error', 'No se pudo generar el PDF. Intenta de nuevo.');
    }
};

function obtenerFilasPorTipo(tipo: string, resultados: any) {
    switch (tipo) {
        case 'sangre':
            return [
                { param: 'Hemoglobina', valor: resultados.hemoglobina, unidad: 'g/dL', referencia: '12.0 - 18.0' },
                { param: 'Hematocrito', valor: resultados.hematocrito, unidad: '%', referencia: '36.0 - 52.0' },
                { param: 'Leucocitos', valor: resultados.leucocitos, unidad: '/mm³', referencia: '4,000 - 11,000' },
                { param: 'Plaquetas', valor: resultados.plaquetas, unidad: '/mm³', referencia: '150,000 - 400,000' },
                { param: 'Glucosa', valor: resultados.glucosa, unidad: 'mg/dL', referencia: '70 - 100' },
                { param: 'VCM', valor: resultados.vcm, unidad: 'fL', referencia: '80 - 100' },
                { param: 'HCM', valor: resultados.hcm, unidad: 'pg', referencia: '27 - 31' },
                { param: 'CHCM', valor: resultados.chcm, unidad: 'g/dL', referencia: '32 - 36' },
            ];
        case 'orina':
            return [
                { param: 'Color', valor: resultados.color, unidad: '-', referencia: 'Amarillo claro' },
                { param: 'Aspecto', valor: resultados.aspecto, unidad: '-', referencia: 'Transparente' },
                { param: 'pH', valor: resultados.ph, unidad: '-', referencia: '4.5 - 8.0' },
                { param: 'Densidad', valor: resultados.densidad, unidad: '-', referencia: '1.003 - 1.030' },
                { param: 'Glucosa', valor: resultados.glucosa, unidad: '-', referencia: 'Negativo' },
                { param: 'Proteínas', valor: resultados.proteinas, unidad: '-', referencia: 'Negativo' },
                { param: 'Sangre', valor: resultados.sangre, unidad: '-', referencia: 'Negativo' },
                { param: 'Leucocitos', valor: resultados.leucocitos, unidad: '/campo', referencia: '0 - 5' },
                { param: 'Bacterias', valor: resultados.bacterias, unidad: '-', referencia: 'Negativo' },
                { param: 'Cristales', valor: resultados.cristales, unidad: '-', referencia: 'Negativo' },
            ];
        case 'heces':
            return [
                { param: 'Consistencia', valor: resultados.consistencia, unidad: '-', referencia: 'Sólida/Blanda' },
                { param: 'Color', valor: resultados.color, unidad: '-', referencia: 'Marrón' },
                { param: 'pH', valor: resultados.ph, unidad: '-', referencia: '6.0 - 7.5' },
                { param: 'Sangre oculta', valor: resultados.sangre_oculta, unidad: '-', referencia: 'Negativo' },
                { param: 'Parásitos', valor: resultados.parasitos, unidad: '-', referencia: 'Negativo' },
                { param: 'Leucocitos', valor: resultados.leucocitos, unidad: '/campo', referencia: '0 - 3' },
                { param: 'Moco', valor: resultados.moco, unidad: '-', referencia: 'Negativo' },
                { param: 'Restos alimenticios', valor: resultados.restos_alimenticios, unidad: '-', referencia: 'Normal' },
            ];
        default:
            return [];
    }
}
