'use client';

import { useState, useEffect } from 'react';
import { SectionCards } from "@/app/components/section-cards"
import { ChartAreaInteractive } from "@/app/components/chart-area-interactive"
import { DataTable } from "@/app/components/data-table"
import { QuickActions } from "@/app/components/quick-actions"
import { QuickSummary } from "@/app/components/quick-summary"
import ModalReportes from '@/app/components/ModalReportes';
import api from '@/app/lib/api';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';

export default function AdminDashboardPage() {
  const [modalReportesAbierto, setModalReportesAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalMuestras: 0,
    productosInventario: 0,
    resultadosHoy: 0,
  });
  const [stockBajo, setStockBajo] = useState<any[]>([]);
  const [muestrasData, setMuestrasData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      await obtenerEstadisticas();
      setLoading(false);
    };
    fetchInitial();

    const intervalId = setInterval(() => {
      obtenerEstadisticas();
    }, 10000); // Poll every 10 seconds for "real-time" feel

    return () => clearInterval(intervalId);
  }, []);

  const processChartData = (muestras: any[], pacientes: any[]) => {
    const days = 7;
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });

      // Count samples for this day
      const muestrasCount = muestras.filter(m => {
        const mDate = m.fecha_toma ? new Date(m.fecha_toma).toISOString().split('T')[0] : '';
        return mDate === dateStr;
      }).length;

      // Count new patients for this day
      const pacientesCount = pacientes.filter(p => {
        const pDate = p.fecha_creacion ? new Date(p.fecha_creacion).toISOString().split('T')[0] : '';
        return pDate === dateStr;
      }).length;

      data.push({
        name: dayName,
        fecha: dateStr,
        muestras: muestrasCount,
        pacientes: pacientesCount
      });
    }
    return data;
  };

  const obtenerEstadisticas = async () => {
    try {
      const [pacientesRes, muestrasRes, inventarioRes] = await Promise.all([
        api.get('/pacientes'),
        api.get('/muestras'),
        api.get('/inventario'),
      ]);

      const inventario = inventarioRes.data || [];
      const muestras = muestrasRes.data || [];
      const pacientes = pacientesRes.data || [];
      const bajos = inventario.filter((p: any) => p.cantidad <= (p.cantidad_minima || 5));

      const hoy = new Date();
      const resultadosHoy = muestras.filter((m: any) => {
        // Check if sample has results
        const tieneResultados = m.tipos_muestras?.some((t: any) => t.tiene_resultados);
        if (!tieneResultados) return false;

        // Check if updated today (assuming results update timestamp)
        if (!m.fecha_resultado) return false;
        const fechaResultado = new Date(m.fecha_resultado);
        return fechaResultado.getDate() === hoy.getDate() &&
          fechaResultado.getMonth() === hoy.getMonth() &&
          fechaResultado.getFullYear() === hoy.getFullYear();
      }).length;

      setMuestrasData(muestras);
      setStockBajo(bajos);
      setStats({
        totalPacientes: pacientes.length,
        totalMuestras: muestras.length,
        productosInventario: inventario.length,
        resultadosHoy,
      });

      // Process chart data
      const processedData = processChartData(muestras, pacientes);
      setChartData(processedData);

    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name === 'muestras' ? 'Muestras Realizadas: ' : 'Nuevos Pacientes: '}
              <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 w-full max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general del laboratorio</p>
      </div>

      <SectionCards loading={loading} stats={stats} />

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Muestras Chart */}
        <Card className="shadow-sm border-brand-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-800">Muestras Recientes</CardTitle>
                <CardDescription>Volumen de muestras últimos 7 días</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMuestras" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4B9B6E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4B9B6E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
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
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="muestras"
                      stroke="#4B9B6E"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorMuestras)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clients Chart */}
        <Card className="shadow-sm border-indigo-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-800">Nuevos Pacientes</CardTitle>
                <CardDescription>Registros en los últimos 7 días</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-indigo-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
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
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="pacientes"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {stockBajo.length > 0 && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 shadow-sm animate-pulse-slow">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 font-semibold">Alerta de Inventario</AlertTitle>
          <AlertDescription className="text-red-700 mt-1">
            Hay {stockBajo.length} productos con stock crítico. Revisa el inventario para reabastecer:
            <span className="font-medium ml-1">
              {stockBajo.slice(0, 3).map(p => p.nombre_producto).join(', ')}
              {stockBajo.length > 3 && '...'}
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <QuickActions onOpenReportes={() => setModalReportesAbierto(true)} />
        <QuickSummary
          totalPacientes={stats.totalPacientes}
          totalMuestras={stats.totalMuestras}
          productosInventario={stats.productosInventario}
        />
      </div>

      <DataTable data={muestrasData} loading={loading} />

      <ModalReportes
        isOpen={modalReportesAbierto}
        onClose={() => setModalReportesAbierto(false)}
      />
    </div>
  );
}