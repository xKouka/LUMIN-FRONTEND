'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import api from '@/app/lib/api';
import Cookies from 'js-cookie';
import { Download, AlertCircle, FileText, User, Mail, Calendar, ArrowRight, Eye, X } from 'lucide-react';

export default function ClienteDashboardPage() {
  const router = useRouter();
  const [muestras, setMuestras] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const usuario = Cookies.get('usuario') ? JSON.parse(Cookies.get('usuario')!) : null;

  useEffect(() => {
    obtenerMuestrasRecientes();
  }, []);

  const obtenerMuestrasRecientes = async () => {
    try {
      setCargando(true);
      const response = await api.get('/muestras/mis-muestras');
      // Obtener solo las últimas 5 muestras
      setMuestras(response.data.slice(0, 5));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar muestras');
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPDF = async (muestraId: number) => {
    try {
      const response = await api.get(`/muestras/${muestraId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `muestra_${muestraId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error al descargar PDF:', err);
    }
  };

  const handleVerMuestra = async (muestra: any) => {
    try {
      setCargandoDetalle(true);
      const response = await api.get(`/muestras/${muestra.id}`);
      setMuestraSeleccionada(response.data);
      setModalAbierto(true);
    } catch (err: any) {
      console.error('Error al cargar muestra:', err);
    } finally {
      setCargandoDetalle(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="cliente">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-brand-500 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            ¡Bienvenido, {usuario?.nombre}!
          </h1>
          <p className="text-brand-100">
            Accede a tus muestras y resultados de laboratorio
          </p>
        </div>

        {/* Client Info Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-brand-600" />
            Mi Información
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{usuario?.nombre}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Correo</p>
                <p className="font-medium">{usuario?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Usuario</p>
                <p className="font-medium">{usuario?.usuario}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Tipo de cuenta</p>
                <p className="font-medium capitalize">{usuario?.rol}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-brand-100 p-3 rounded-lg">
                <FileText className="w-8 h-8 text-brand-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ver Todas Mis Muestras</h3>
                <p className="text-sm text-gray-600">Accede a tu historial completo de análisis</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/cliente/muestras')}
              className="bg-brand-500 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors flex items-center space-x-2 font-medium"
            >
              <FileText className="w-5 h-5" />
              <span>Ver Muestras</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Samples Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-brand-600" />
                Mis Muestras Recientes
              </h2>
              <p className="text-sm text-gray-900 mt-1">
                Últimas 5 muestras registradas
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading */}
          {cargando && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
            </div>
          )}

          {/* Samples Table */}
          {!cargando && muestras.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Fecha de Toma
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Muestras
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {muestras.map((muestra) => (
                    <tr key={muestra.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(muestra.fecha_toma).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {muestra.tipos_muestras && muestra.tipos_muestras.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {muestra.tipos_muestras.map((tipo: any, idx: number) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-brand-100 text-brand-800 rounded text-xs capitalize"
                              >
                                {tipo.tipo_muestra}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 text-sm space-x-3">
                        <button
                          onClick={() => handleVerMuestra(muestra)}
                          className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver</span>
                        </button>
                        <button
                          onClick={() => handleDescargarPDF(muestra.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!cargando && muestras.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No tienes muestras registradas aún</p>
              <p className="text-gray-500 text-sm mt-2">
                Tus resultados de laboratorio aparecerán aquí cuando estén disponibles
              </p>
            </div>
          )}
        </div>

        {/* Modal Ver Muestra */}
        {modalAbierto && muestraSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">
                  Detalles de la Muestra
                </h2>
                <button
                  onClick={() => {
                    setModalAbierto(false);
                    setMuestraSeleccionada(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Información General */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Información General</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Paciente</p>
                      <p className="font-medium text-gray-900">{muestraSeleccionada.paciente_nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Toma</p>
                      <p className="font-medium text-gray-900">
                        {new Date(muestraSeleccionada.fecha_toma).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {muestraSeleccionada.observaciones && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">Observaciones</p>
                      <p className="font-medium text-gray-900">{muestraSeleccionada.observaciones}</p>
                    </div>
                  )}
                </div>

                {/* Detalles de Muestras */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Resultados de Análisis</h3>
                  <div className="space-y-4">
                    {muestraSeleccionada.detalles && muestraSeleccionada.detalles.length > 0 ? (
                      muestraSeleccionada.detalles.map((detalle: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
                          <h4 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2 mb-4">
                            {detalle.tipo_muestra === 'sangre' && '🩸'}
                            {detalle.tipo_muestra === 'orina' && '💧'}
                            {detalle.tipo_muestra === 'heces' && '🧻'}
                            {detalle.tipo_muestra}
                          </h4>
                          {detalle.resultados && Object.keys(detalle.resultados).length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {Object.entries(detalle.resultados).map(([key, value]: [string, any]) => (
                                <div key={key} className="border border-gray-200 rounded p-3">
                                  <p className="text-xs text-gray-600 uppercase mb-1">
                                    {key.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {value !== null && value !== undefined && value !== '' ? String(value) : '-'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No hay resultados registrados</p>
                          )}
                          {detalle.observaciones && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm text-gray-600 mb-1">Observaciones</p>
                              <p className="text-gray-900">{detalle.observaciones}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No hay detalles disponibles</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => {
                    setModalAbierto(false);
                    setMuestraSeleccionada(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleDescargarPDF(muestraSeleccionada.id)}
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}