'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ModalReportes from '@/app/components/ModalReportes';
import ModalCrearAdmin from '@/app/components/ModalCrearAdmin';
import ModalEditarAdmin from '@/app/components/ModalEditarAdmin';
import api from '@/app/lib/api';
import { Users, Droplets, Package, TrendingUp, AlertCircle, FileText, UserPlus, Edit, Trash2, Shield } from 'lucide-react';

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
    muestrasPendientes: 0,
    productosInventario: 0,
    resultadosHoy: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalReportesAbierto, setModalReportesAbierto] = useState(false);
  
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

  const obtenerEstadisticas = async () => {
    try {
      setLoading(true);
      
      const [pacientesRes, muestrasRes, inventarioRes] = await Promise.all([
        api.get('/pacientes'),
        api.get('/muestras'),
        api.get('/inventario'),
      ]);

      const pacientes = pacientesRes.data;
      const muestras = muestrasRes.data;
      const inventario = inventarioRes.data;

      const totalMuestras = muestras.length;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const resultadosHoy = muestras.filter((m: any) => {
        if (!m.fecha_resultado) return false;
        const fechaResultado = new Date(m.fecha_resultado);
        fechaResultado.setHours(0, 0, 0, 0);
        return fechaResultado.getTime() === hoy.getTime();
      }).length;

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

  const obtenerUsuariosAdmin = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await api.get('/usuarios/admins');
      setUsuariosAdmin(response.data);
    } catch (err: any) {
      console.error('Error al obtener usuarios admin:', err);
    } finally {
      setLoadingUsuarios(false);
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

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="space-y-6">
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
                  onClick={() => router.push('/dashboard/admin/inventario')}
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

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard/admin/muestras')}
                className="w-full bg-brand-500 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Droplets className="w-5 h-5" />
                <span>Registrar Nueva Muestra</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/admin/pacientes')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Users className="w-5 h-5" />
                <span>Agregar Paciente</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/admin/inventario')}
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

          {/* Resumen Rápido */}
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

        {/* Gestión de Usuarios Admin */}
        <div className="bg-white rounded-lg shadow">
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
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            usuario.rol === 'super_admin' 
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
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white z-50 animate-slide-up ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
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
