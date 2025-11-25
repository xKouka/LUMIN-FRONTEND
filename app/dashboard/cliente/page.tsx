'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ModalCrearCliente from '@/app/components/ModalAgregarPaciente';
import api from '@/app/lib/api';
import { Plus, AlertCircle, Trash2 } from 'lucide-react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoEliminar, setCargandoEliminar] = useState<number | null>(null);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      setCargando(true);
      // Obtener todos los usuarios con rol 'cliente'
      const response = await api.get('/pacientes');
      setClientes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar clientes');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        setCargandoEliminar(id);
        await api.delete(`/pacientes/${id}`);
        obtenerClientes();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al eliminar cliente');
      } finally {
        setCargandoEliminar(null);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
            <p className="text-gray-600 mt-2">
              Total de clientes: {clientes.length}
            </p>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Crear Cliente</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {cargando && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
          </div>
        )}

        {/* Clientes Table */}
        {!cargando && clientes.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      RUT
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {cliente.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cliente.rut || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cliente.edad || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {cliente.telefono || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEliminar(cliente.id)}
                          disabled={cargandoEliminar === cliente.id}
                          className="text-red-600 hover:text-red-700 font-medium disabled:text-gray-400"
                        >
                          {cargandoEliminar === cliente.id ? (
                            <span className="inline-flex items-center">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminando...
                            </span>
                          ) : (
                            <span className="inline-flex items-center">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!cargando && clientes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No hay clientes registrados</p>
            <button
              onClick={() => setModalAbierto(true)}
              className="inline-flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primer Cliente</span>
            </button>
          </div>
        )}

        {/* Modal */}
        <ModalCrearCliente
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSuccess={() => obtenerClientes()}
        />
      </div>
    </ProtectedRoute>
  );
}