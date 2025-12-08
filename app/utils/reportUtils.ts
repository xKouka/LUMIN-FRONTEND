
import api from '@/app/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { showError, showSuccess } from '@/app/utils/sweetalert';

export interface ReportData {
    pacientes: any[];
    muestras: any[];
    estadisticas: {
        totalPacientes: number;
        totalMuestras: number;
        muestrasPorTipo: { tipo: string; cantidad: number }[];
        muestrasPorEstado: { estado: string; cantidad: number }[];
        muestrasPorDia: { fecha: string; cantidad: number }[];
    };
}

export const fetchReportData = async (fechaInicio: string, fechaFin: string): Promise<ReportData> => {
    const [pacientesRes, muestrasRes] = await Promise.all([
        api.get('/pacientes'),
        api.get('/muestras'),
    ]);

    const pacientes = pacientesRes.data;
    const todasMuestras = muestrasRes.data;

    const muestrasFiltradas = todasMuestras.filter((m: any) => {
        const fechaMuestra = new Date(m.fecha_toma);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        return fechaMuestra >= inicio && fechaMuestra <= fin;
    });

    const muestrasPorTipo: { [key: string]: number } = {};
    const muestrasPorEstado: { [key: string]: number } = {};
    const muestrasPorDia: { [key: string]: number } = {};

    muestrasFiltradas.forEach((m: any) => {
        if (m.tipos_muestras && m.tipos_muestras.length > 0) {
            m.tipos_muestras.forEach((t: any) => {
                const tipo = t.tipo_muestra;
                muestrasPorTipo[tipo] = (muestrasPorTipo[tipo] || 0) + 1;
            });
        }

        const estado = m.estado;
        muestrasPorEstado[estado] = (muestrasPorEstado[estado] || 0) + 1;

        const fecha = new Date(m.fecha_toma).toLocaleDateString('es-ES');
        muestrasPorDia[fecha] = (muestrasPorDia[fecha] || 0) + 1;
    });

    return {
        pacientes,
        muestras: muestrasFiltradas,
        estadisticas: {
            totalPacientes: pacientes.length,
            totalMuestras: muestrasFiltradas.length,
            muestrasPorTipo: Object.entries(muestrasPorTipo).map(([tipo, cantidad]) => ({
                tipo,
                cantidad,
            })),
            muestrasPorEstado: Object.entries(muestrasPorEstado).map(([estado, cantidad]) => ({
                estado: estado === 'en_proceso' ? 'En Proceso' : estado.charAt(0).toUpperCase() + estado.slice(1),
                cantidad,
            })),
            muestrasPorDia: Object.entries(muestrasPorDia)
                .map(([fecha, cantidad]) => ({ fecha, cantidad }))
                .sort((a, b) => new Date(a.fecha.split('/').reverse().join('-')).getTime() - new Date(b.fecha.split('/').reverse().join('-')).getTime()),
        },
    };
};

export const generateReportPDF = (reportData: ReportData, fechaInicio: string, fechaFin: string) => {
    try {
        console.log('Iniciando generación de PDF...');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 20;

        // Título
        pdf.setFontSize(20);
        pdf.setTextColor(75, 155, 110);
        pdf.text('Reporte de Laboratorio', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Período: ${fechaInicio} a ${fechaFin}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Resumen General', 14, yPosition);
        yPosition += 8;

        const statsData = [
            ['Total de Pacientes', reportData.estadisticas.totalPacientes.toString()],
            ['Total de Muestras', reportData.estadisticas.totalMuestras.toString()],
        ];

        console.log('Agregando tabla de estadísticas...');
        autoTable(pdf, {
            startY: yPosition,
            head: [['Métrica', 'Valor']],
            body: statsData,
            theme: 'grid',
            headStyles: { fillColor: [75, 155, 110] },
            margin: { left: 14, right: 14 },
        });

        yPosition = (pdf as any).lastAutoTable?.finalY || yPosition + 10;
        yPosition += 10; // Extra spacing

        // Muestras por tipo
        if (reportData.estadisticas.muestrasPorTipo.length > 0) {
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = 20;
            }

            console.log('Agregando tabla de muestras por tipo...');
            pdf.setFontSize(14);
            pdf.text('Muestras por Tipo', 14, yPosition);
            yPosition += 8;

            const tipoData = reportData.estadisticas.muestrasPorTipo.map(t => [
                t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1),
                t.cantidad.toString(),
            ]);

            autoTable(pdf, {
                startY: yPosition,
                head: [['Tipo de Muestra', 'Cantidad']],
                body: tipoData,
                theme: 'grid',
                headStyles: { fillColor: [75, 155, 110] },
                margin: { left: 14, right: 14 },
            });

            yPosition = (pdf as any).lastAutoTable?.finalY || yPosition + 10;
            yPosition += 10;
        }

        // Muestras por estado
        if (reportData.estadisticas.muestrasPorEstado.length > 0) {
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = 20;
            }

            console.log('Agregando tabla de muestras por estado...');
            pdf.setFontSize(14);
            pdf.text('Muestras por Estado', 14, yPosition);
            yPosition += 8;

            const estadoData = reportData.estadisticas.muestrasPorEstado.map(e => [
                e.estado,
                e.cantidad.toString(),
            ]);

            autoTable(pdf, {
                startY: yPosition,
                head: [['Estado', 'Cantidad']],
                body: estadoData,
                theme: 'grid',
                headStyles: { fillColor: [75, 155, 110] },
                margin: { left: 14, right: 14 },
            });

            yPosition = (pdf as any).lastAutoTable?.finalY || yPosition + 10;
            yPosition += 10;
        }

        // Muestras por día (tabla)
        if (reportData.estadisticas.muestrasPorDia.length > 0) {
            if (yPosition > pageHeight - 60) {
                pdf.addPage();
                yPosition = 20;
            }

            console.log('Agregando tabla de tendencia diaria...');
            pdf.setFontSize(14);
            pdf.text('Tendencia Diaria', 14, yPosition);
            yPosition += 8;

            const diaData = reportData.estadisticas.muestrasPorDia.map(d => [
                d.fecha,
                d.cantidad.toString(),
            ]);

            autoTable(pdf, {
                startY: yPosition,
                head: [['Fecha', 'Cantidad de Muestras']],
                body: diaData,
                theme: 'grid',
                headStyles: { fillColor: [75, 155, 110] },
                margin: { left: 14, right: 14 },
            });
        }

        // Guardar PDF
        console.log('Guardando PDF...');
        const fileName = `Reporte_Laboratorio_${fechaInicio}_${fechaFin}.pdf`;
        pdf.save(fileName);

        showSuccess('PDF generado', 'El reporte se ha descargado correctamente');
    } catch (err: any) {
        console.error('Error completo al generar PDF:', err);
        console.error('Stack trace:', err.stack);
        const errorMessage = err.message || 'Error desconocido';
        showError('Error al exportar', `No se pudo generar el PDF: ${errorMessage}`);
        throw err; // Re-throw so caller knows it failed
    }
};
