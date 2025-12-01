'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ModalReportes from '@/app/components/ModalReportes';
import api from '@/app/lib/api';
import { Users, Droplets, Package, TrendingUp, AlertCircle, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPacientes: 0,
    muestrasPendientes: 0,
    productosInventario: 0,
    resultadosHoy: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalReportesAbierto, setModalReportesAbierto] = useState(false);

  useEffect(() => {
    obtenerEstadisticas();
  }, []);

  const obtenerEstadisticas = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas en paralelo
      const [pacientesRes, muestrasRes, inventarioRes] = await Promise.all([
        api.get('/pacientes'),
        api.get('/muestras'),
        api.get('/inventario'),
      ]);

      const pacientes = pacientesRes.data;
      const muestras = muestrasRes.data;
      const inventario = inventarioRes.data;

      // Calcular estadísticas
      const totalMuestras = muestras.length;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const resultadosHoy = muestras.filter((m: any) => {
        if (!m.fecha_resultado) return false;
        const fechaResultado = new Date(m.fecha_resultado);
        fechaResultado.setHours(0, 0, 0, 0);
        return fechaResultado.getTime() === hoy.getTime();
      }).length;

      // Filtrar productos con stock bajo
      const lowStock = inventario.filter((item: any) => item.cantidad <= (item.cantidad_minima || 5));
      setLowStockItems(lowStock);

      setStats({
        totalPacientes: pacientes.length,
        muestrasPendientes: totalMuestras,
        productosInventario: inventario.length,
        resultadosHoy,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      label: 'Total Pacientes',
      value: stats.totalPacientes,
      icon: Users,
      color: 'bg-brand-100',
      textColor: 'text-brand-700',
      borderColor: 'border-brand-500',
    },
    {
      label: 'Total Muestras',
      value: stats.muestrasPendientes,
      icon: Droplets,
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500',
    },
    {
      label: 'Productos Inventario',
      value: stats.productosInventario,
      icon: Package,
      color: 'bg-green-100',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
    },
    {
      label: 'Resultados Hoy',
      value: stats.resultadosHoy,
      icon: TrendingUp,
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-500',
    },
  ];

  const handleRegistrarMuestra = () => {
    router.push('/dashboard/admin/muestras');
  };

  const handleAgregarPaciente = () => {
    router.push('/dashboard/admin/pacientes');
  };

  const handleActualizarInventario = () => {
    router.push('/dashboard/admin/inventario');
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido al panel de administración del laboratorio
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Low Stock Alert */}
        {!loading && lowStockItems.length > 0 && (
          <div className="bg-[#FFF8F0] border-l-[6px] border-[#FF5722] border-y border-r border-[#FFCCBC] p-4 rounded-r-lg shadow-sm mb-6">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-[#FF5722]" aria-hidden="true" />
                <h3 className="text-sm font-medium text-[#BF360C]">
                  Alerta de Inventario Bajo ({lowStockItems.length} productos)
                </h3>
              </div>
              
              <div className="ml-7">
                <ul className="list-disc space-y-1 text-sm text-[#D84315]">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <li key={item.id}>
                      <span className="font-medium">{item.nombre_producto}</span>: {item.cantidad} unidades (Mínimo: {item.cantidad_minima || 5})
                    </li>
                  ))}
                  {lowStockItems.length > 3 && (
                    <li>...y {lowStockItems.length - 3} más</li>
                  )}
                </ul>
                
                <button
                  type="button"
                  onClick={handleActualizarInventario}
                  className="mt-3 text-sm font-medium text-[#E64A19] hover:text-[#BF360C] hover:underline flex items-center"
                >
                  Ver inventario completo &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-200 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-lg shadow p-6 border-l-4 ${stat.borderColor} hover:shadow-lg transition-all hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className={`w-7 h-7 ${stat.textColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleRegistrarMuestra}
                className="w-full bg-brand-500 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Droplets className="w-5 h-5" />
                <span>Registrar Nueva Muestra</span>
              </button>
              <button
                onClick={handleAgregarPaciente}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Agregar Paciente</span>
              </button>
              <button
                onClick={handleActualizarInventario}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Package className="w-5 h-5" />
                <span>Actualizar Inventario</span>
              </button>
              <button
                onClick={() => setModalReportesAbierto(true)}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Generar Reportes</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Resumen Rápido
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-brand-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-brand-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Pacientes Registrados
                  </span>
                </div>
                <span className="text-lg font-bold text-brand-600">
                  {stats.totalPacientes}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Total Muestras
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats.muestrasPendientes}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Productos disponibles
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats.productosInventario}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Reportes */}
      <ModalReportes 
        isOpen={modalReportesAbierto} 
        onClose={() => setModalReportesAbierto(false)} 
      />
    </ProtectedRoute>
  );
}