'use client';

import { useState, useRef } from 'react';
import { X, Download, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/app/lib/api';
import { showError, showSuccess, showWarning } from '@/app/utils/sweetalert';
import { fetchReportData, generateReportPDF, ReportData } from '@/app/utils/reportUtils';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"

interface ModalReportesProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate?: (data: any) => void;
}

const COLORS = ['#4B9B6E', '#6BBF8A', '#A8D5BA', '#2E7D5C', '#1B5E3A'];

export default function ModalReportes({ isOpen, onClose, onGenerate }: ModalReportesProps) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

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

      // Save to history (fire and forget or await)
      try {
        await api.post('/reportes', {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          tipo: 'general'
        });
        if (onGenerate) onGenerate({ fechaInicio, fechaFin });
      } catch (histErr) {
        console.error('Error saving report history', histErr);
      }

      const data = await fetchReportData(fechaInicio, fechaFin);
      setReportData(data);

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
      await generateReportPDF(reportData, fechaInicio, fechaFin);
    } catch (err: any) {
      // Error handled in utility
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-brand-50 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Reportes del Laboratorio</DialogTitle>
              <p className="text-sm text-muted-foreground">Genera y exporta análisis detallados de la operación</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* Selector Section */}
          <Card className="border-brand-100 bg-brand-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-brand-900">
                <Calendar className="w-5 h-5 text-brand-600" />
                Período de Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets */}
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-brand-100 px-4 py-1.5 text-sm bg-white font-normal"
                  onClick={() => {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    setFechaInicio(today);
                    setFechaFin(today);
                  }}
                >
                  Hoy
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-brand-100 px-4 py-1.5 text-sm bg-white font-normal"
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(today);
                    lastWeek.setDate(today.getDate() - 7);
                    setFechaInicio(format(lastWeek, 'yyyy-MM-dd'));
                    setFechaFin(format(today, 'yyyy-MM-dd'));
                  }}
                >
                  Últimos 7 días
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-brand-100 px-4 py-1.5 text-sm bg-white font-normal"
                  onClick={() => {
                    const today = new Date();
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    setFechaInicio(format(firstDay, 'yyyy-MM-dd'));
                    setFechaFin(format(today, 'yyyy-MM-dd'));
                  }}
                >
                  Este Mes
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fecha Inicio</Label>
                  <DatePicker
                    date={fechaInicio && !isNaN(Date.parse(fechaInicio)) ? new Date(fechaInicio + 'T00:00:00') : undefined}
                    setDate={(date) => setFechaInicio(date ? format(date, 'yyyy-MM-dd') : '')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin</Label>
                  <DatePicker
                    date={fechaFin && !isNaN(Date.parse(fechaFin)) ? new Date(fechaFin + 'T00:00:00') : undefined}
                    setDate={(date) => setFechaFin(date ? format(date, 'yyyy-MM-dd') : '')}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={obtenerReporte}
                  disabled={cargando}
                  className="w-full md:w-auto min-w-[200px] bg-brand-500 hover:bg-brand-600"
                >
                  {cargando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando Análisis...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Generar Reporte
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Results */}
          {reportData && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-brand-100 text-sm font-medium mb-1">Total Pacientes</p>
                      <p className="text-4xl font-bold">{reportData.estadisticas.totalPacientes}</p>
                    </div>
                    <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium mb-1">Total Muestras</p>
                      <p className="text-4xl font-bold">{reportData.estadisticas.totalMuestras}</p>
                    </div>
                    <div className="bg-white/20 p-2.5 rounded-lg backdrop-blur-sm">
                      <PieChart className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </div>

              {/* Charts Section */}
              <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reportData.estadisticas.muestrasPorTipo.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Muestras por Tipo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportData.estadisticas.muestrasPorTipo}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                              dataKey="tipo"
                              tick={{ fontSize: 12, fill: '#64748B' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fontSize: 12, fill: '#64748B' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              cursor={{ fill: '#F1F5F9' }}
                            />
                            <Bar dataKey="cantidad" fill="#4B9B6E" radius={[4, 4, 0, 0]} name="Cantidad" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {reportData.estadisticas.muestrasPorEstado.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Distribución por Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={reportData.estadisticas.muestrasPorEstado}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="cantidad"
                            >
                              {reportData.estadisticas.muestrasPorEstado.map((entry, index) => (
                                <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {reportData.estadisticas.muestrasPorDia.length > 0 && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Tendencia Diaria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={reportData.estadisticas.muestrasPorDia}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                              dataKey="fecha"
                              tick={{ fontSize: 12, fill: '#64748B' }}
                              axisLine={false}
                              tickLine={false}
                              dy={10}
                            />
                            <YAxis
                              tick={{ fontSize: 12, fill: '#64748B' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Line
                              type="monotone"
                              dataKey="cantidad"
                              stroke="#4B9B6E"
                              strokeWidth={3}
                              dot={{ fill: '#4B9B6E', strokeWidth: 2, r: 4, stroke: '#fff' }}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                              name="Muestras"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={exportarPDF}
                  disabled={cargando}
                  variant="destructive"
                  size="lg"
                  className="shadow-sm"
                >
                  {cargando ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Exportar Reporte PDF
                </Button>
              </div>
            </div>
          )}

          {!reportData && !cargando && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-muted-foreground bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <BarChart3 className="w-8 h-8 text-brand-200" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">Sin Análisis Generado</h4>
              <p className="max-w-xs mx-auto">Selecciona un rango de fechas arriba y haz clic en "Generar Reporte" para visualizar las estadísticas.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
