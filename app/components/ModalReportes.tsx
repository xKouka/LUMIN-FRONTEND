'use client';

import { useState, useRef } from 'react';
import { X, Download, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import api from '@/app/lib/api';
import { showError, showSuccess, showWarning } from '@/app/utils/sweetalert';
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ModalReportesProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportData {
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

const COLORS = ['#4B9B6E', '#6BBF8A', '#A8D5BA', '#2E7D5C', '#1B5E3A'];

export default function ModalReportes({ isOpen, onClose }: ModalReportesProps) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const obtenerReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      showWarning('Fechas requeridas', 'Por favor selecciona fecha de inicio y fin');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      showWarning('Fechas inválidas', 'La fecha de inicio debe ser anterior a la fecha fin');
      return;
    }

    try {
      setCargando(true);

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

      setReportData({
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
      });

      showSuccess('Reporte generado', 'Los datos se han cargado correctamente');
    } catch (err: any) {
      showError('Error al generar reporte', err.response?.data?.error || 'No se pudo obtener los datos');
    } finally {
      setCargando(false);
    }
  };

  const exportarPDF = async () => {
    if (!reportData) {
      showWarning('Sin datos', 'Primero genera el reporte');
      return;
    }

    try {
      setCargando(true);
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

      yPosition = (pdf as any).lastAutoTable.finalY + 10;

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

        yPosition = (pdf as any).lastAutoTable.finalY + 10;
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

        yPosition = (pdf as any).lastAutoTable.finalY + 10;
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
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            <h2 className="text-2xl font-bold text-gray-900">Reportes del Laboratorio</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-brand-50 rounded-lg p-4 border border-brand-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              Seleccionar Período
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    min={fechaInicio || undefined}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={obtenerReporte}
                  disabled={cargando}
                  className="w-full md:w-auto bg-brand-500 text-white px-8 py-3 rounded-lg hover:bg-brand-700 transition-colors font-medium disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {cargando ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      <span>Generar Reporte</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {reportData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-100 text-sm font-medium">Total Pacientes</p>
                      <p className="text-4xl font-bold mt-2">{reportData.estadisticas.totalPacientes}</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Muestras</p>
                      <p className="text-4xl font-bold mt-2">{reportData.estadisticas.totalMuestras}</p>
                    </div>
                    <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                      <PieChart className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              </div>

              <div ref={chartsRef} className="space-y-6 bg-white p-4 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900">Análisis Gráfico</h3>

                {reportData.estadisticas.muestrasPorTipo.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Muestras por Tipo</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.estadisticas.muestrasPorTipo}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="tipo" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="cantidad" fill="#4B9B6E" name="Cantidad" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {reportData.estadisticas.muestrasPorEstado.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Estado</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPie>
                        <Pie
                          data={reportData.estadisticas.muestrasPorEstado}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="cantidad"
                        >
                          {reportData.estadisticas.muestrasPorEstado.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                )}

                {reportData.estadisticas.muestrasPorDia.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Tendencia Diaria</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.estadisticas.muestrasPorDia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cantidad" stroke="#4B9B6E" strokeWidth={2} name="Muestras" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={exportarPDF}
                  disabled={cargando}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:bg-gray-400"
                >
                  <Download className="w-5 h-5" />
                  <span>Exportar a PDF</span>
                </button>
              </div>
            </>
          )}

          {!reportData && !cargando && (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Selecciona un rango de fechas y genera el reporte
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
