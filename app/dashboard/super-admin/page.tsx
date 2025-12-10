'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ModalReportes from '@/app/components/ModalReportes';
import ModalCrearAdmin from '@/app/components/ModalCrearAdmin';
import ModalEditarAdmin from '@/app/components/ModalEditarAdmin';
import api from '@/app/lib/api';
import { Users, Droplets, Package, TrendingUp, AlertCircle, FileText, UserPlus, Edit, Trash2, Shield, Database, Download, AlertTriangle } from 'lucide-react';
import { SectionCards } from "@/app/components/section-cards";
import { QuickSummary } from "@/app/components/quick-summary";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  usuario: string | null;
  rol: string;
  created_at?: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalMuestras: 0,
    productosInventario: 0,
    resultadosHoy: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalReportesAbierto, setModalReportesAbierto] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // Estados para gestión de usuarios admin
  const [usuariosAdmin, setUsuariosAdmin] = useState<Usuario[]>([]);
  const [modalCrearAdmin, setModalCrearAdmin] = useState(false);
  const [modalEditarAdmin, setModalEditarAdmin] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  useEffect(() => {
    obtenerEstadisticas();
    obtenerUsuariosAdmin();
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
      setLoading(true);

      const [pacientesRes, muestrasRes, inventarioRes] = await Promise.all([
        api.get('/pacientes'),
        api.get('/muestras'),
        api.get('/inventario'),
      ]);

      const pacientes = pacientesRes.data || [];
      const muestras = muestrasRes.data || [];
      const inventario = inventarioRes.data || [];

      const totalMuestras = muestras.length;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const resultadosHoy = muestras.filter((m: any) => {
        if (!m.fecha_resultado) return false;
        const fechaResultado = new Date(m.fecha_resultado);
        const hoyDate = new Date();
        return fechaResultado.getDate() === hoyDate.getDate() &&
          fechaResultado.getMonth() === hoyDate.getMonth() &&
          fechaResultado.getFullYear() === hoyDate.getFullYear();
      }).length;

      const lowStock = inventario.filter((item: any) => item.cantidad <= (item.cantidad_minima || 5));
      setLowStockItems(lowStock);

      setStats({
        totalPacientes: pacientes.length,
        totalMuestras: totalMuestras,
        productosInventario: inventario.length,
        resultadosHoy,
      });

      // Process chart data
      const processedData = processChartData(muestras, pacientes);
      setChartData(processedData);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const obtenerUsuariosAdmin = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await api.get('/usuarios/admins');
      setUsuariosAdmin(response.data);
    } catch (err: any) {
      console.error('Error al obtener usuarios admin:', err);
      const errorMessage = err.response?.data?.error || 'Error al obtener usuarios admin';
      showToast(errorMessage, 'error');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setDownloadingBackup(true);
      const response = await api.get('/backup', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'backup.sql';
      if (contentDisposition) {
        const matches = /filename=([^;]+)/ig.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].trim();
        }
      }
      if (filename === 'backup.sql') {
        const date = new Date().toISOString().split('T')[0];
        filename = `backup-${date}.sql`;
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Respaldo descargado exitosamente', 'success');

    } catch (err) {
      console.error('Error downloading backup:', err);
      showToast('Error al descargar el respaldo', 'error');
    } finally {
      setDownloadingBackup(false);
    }
  };

  const handleEliminarAdmin = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/usuarios/admin/${id}`);
      showToast('Usuario eliminado exitosamente', 'success');
      obtenerUsuariosAdmin();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Error al eliminar usuario', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSuccessCrear = () => {
    showToast('Usuario admin creado exitosamente', 'success');
    obtenerUsuariosAdmin();
  };

  const handleSuccessEditar = () => {
    showToast('Usuario actualizado exitosamente', 'success');
    obtenerUsuariosAdmin();
  };

  const handleEditarAdmin = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalEditarAdmin(true);
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
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-brand-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Super Admin</h1>
            <p className="text-gray-600 mt-1">
              Panel de administración completo del laboratorio
            </p>
          </div>
        </div>

        {/* Stats Grid */}
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
              <div className="h-[250px] w-full min-w-0">
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

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 shadow-sm animate-pulse-slow">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-semibold">Alerta de Inventario</AlertTitle>
            <AlertDescription className="text-red-700 mt-1">
              Hay {lowStockItems.length} productos con stock crítico. Revisa el inventario para reabastecer:
              <span className="font-medium ml-1">
                {lowStockItems.slice(0, 3).map(p => p.nombre_producto).join(', ')}
                {lowStockItems.length > 3 && '...'}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Acceso rápido a funciones principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push('/dashboard/admin/muestras')}
                className="w-full bg-brand-500 hover:bg-brand-700 text-white justify-start h-auto py-3"
                size="lg"
              >
                <Droplets className="mr-2 h-5 w-5" />
                Registrar Nueva Muestra
              </Button>
              <Button
                onClick={() => router.push('/dashboard/admin/pacientes')}
                className="w-full bg-green-600 hover:bg-green-700 text-white justify-start h-auto py-3"
                size="lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Agregar Paciente
              </Button>
              <Button
                onClick={() => router.push('/dashboard/admin/inventario')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start h-auto py-3"
                size="lg"
              >
                <Package className="mr-2 h-5 w-5" />
                Actualizar Inventario
              </Button>
              <Button
                onClick={() => setModalReportesAbierto(true)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white justify-start h-auto py-3"
                size="lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                Generar Reportes
              </Button>
              <Button
                onClick={handleDownloadBackup}
                disabled={downloadingBackup}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start h-auto py-3"
                size="lg"
              >
                {downloadingBackup ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                ) : (
                  <Database className="mr-2 h-5 w-5" />
                )}
                {downloadingBackup ? 'Descargando...' : 'Descargar Respaldo BDD'}
              </Button>
            </CardContent>
          </Card>

          {/* Resumen Rápido */}
          <QuickSummary
            totalPacientes={stats.totalPacientes}
            totalMuestras={stats.totalMuestras}
            productosInventario={stats.productosInventario}
          />
        </div>

        {/* Gestión de Usuarios Admin */}
        <div className="bg-white rounded-xl shadow border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-brand-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Gestión de Usuarios Admin
                </h3>
              </div>
              <button
                onClick={() => setModalCrearAdmin(true)}
                className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors font-medium flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Nuevo Admin</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {loadingUsuarios ? (
              <div className="text-center py-8 text-gray-500">
                Cargando usuarios...
              </div>
            ) : usuariosAdmin.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay usuarios admin registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre Completo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuario</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosAdmin.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">
                          {usuario.nombre} {usuario.apellido || ''}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{usuario.email}</td>
                        <td className="py-3 px-4 text-gray-600">{usuario.usuario || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${usuario.rol === 'super_admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {usuario.rol === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditarAdmin(usuario)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminarAdmin(usuario.id, `${usuario.nombre} ${usuario.apellido || ''}`.trim())}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modales */}
      <ModalReportes
        isOpen={modalReportesAbierto}
        onClose={() => setModalReportesAbierto(false)}
      />
      <ModalCrearAdmin
        isOpen={modalCrearAdmin}
        onClose={() => setModalCrearAdmin(false)}
        onSuccess={handleSuccessCrear}
      />
      <ModalEditarAdmin
        isOpen={modalEditarAdmin}
        onClose={() => {
          setModalEditarAdmin(false);
          setUsuarioSeleccionado(null);
        }}
        onSuccess={handleSuccessEditar}
        usuario={usuarioSeleccionado}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white z-50 animate-slide-up ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
          <div className="flex items-center space-x-3">
            {toast.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
