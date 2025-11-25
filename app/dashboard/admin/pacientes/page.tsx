'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import SearchBar from '@/app/components/SearchBar';
import Pagination from '@/app/components/Pagination';
import ModalAgregarPaciente from '@/app/components/ModalAgregarPaciente';
import ModalEditarPaciente from '@/app/components/ModalEditarPaciente';
import api from '@/app/lib/api';
import { Plus, AlertCircle, Trash2 } from 'lucide-react';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [cargandoEliminar, setCargandoEliminar] = useState<number | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    obtenerPacientes();
  }, []);

  const obtenerPacientes = async () => {
    try {
      setCargando(true);
      const response = await api.get('/pacientes');
      setPacientes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar pacientes');
    } finally {
      setCargando(false);
    }
  };

  // Filtrar pacientes por búsqueda
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const query = searchQuery.toLowerCase();
    return (
      paciente.nombre.toLowerCase().includes(query) ||
      (paciente.cedula && paciente.cedula.toLowerCase().includes(query)) ||
      (paciente.rut && paciente.rut.toLowerCase().includes(query)) ||
      (paciente.telefono && paciente.telefono.toLowerCase().includes(query))
    );
  });

  // Calcular paginación
  const totalPages = Math.ceil(pacientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pacientesPaginados = pacientesFiltrados.slice(startIndex, endIndex);

  // Resetear página si no hay resultados
  if (pacientesFiltrados.length > 0 && currentPage > totalPages) {
    setCurrentPage(1);
  }

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleEditar = (paciente: any) => {
    setPacienteSeleccionado(paciente);
    setModalEditarAbierto(true);
  };

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      try {
        setCargandoEliminar(id);
        await api.delete(`/pacientes/${id}`);
        obtenerPacientes();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error al eliminar paciente');
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
            <p className="text-gray-600 mt-2">
              Total de pacientes: {pacientes.length}
            </p>
          </div>
          <button
            onClick={() => setModalAgregarAbierto(true)}
            className="flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Paciente</span>
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4">
          <SearchBar
            placeholder="Buscar por nombre, cédula, RUT o teléfono..."
            value={searchQuery}
            onSearch={setSearchQuery}
          />
          <p className="text-sm text-gray-600 mt-2">
            Resultados: {pacientesFiltrados.length} pacientes
          </p>
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

        {/* Pacientes Table */}
        {!cargando && pacientesPaginados.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Cédula
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Fecha Nacimiento
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Género
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
                  {pacientesPaginados.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {paciente.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {paciente.cedula || paciente.rut || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {paciente.fecha_nacimiento
                          ? new Date(paciente.fecha_nacimiento).toLocaleDateString('es-ES')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {calcularEdad(paciente.fecha_nacimiento)} años
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {paciente.genero || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {paciente.telefono || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button
                          onClick={() => handleEditar(paciente)}
                          className="text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(paciente.id)}
                          disabled={cargandoEliminar === paciente.id}
                          className="text-red-600 hover:text-red-700 font-medium disabled:text-gray-400"
                        >
                          {cargandoEliminar === paciente.id ? (
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
        {!cargando && pacientesFiltrados.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">
              {searchQuery ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
            </p>
            <button
              onClick={() => setModalAgregarAbierto(true)}
              className="inline-flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Primer Paciente</span>
            </button>
          </div>
        )}

        {/* Paginación */}
        {pacientesFiltrados.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Modal Agregar */}
        <ModalAgregarPaciente
          isOpen={modalAgregarAbierto}
          onClose={() => setModalAgregarAbierto(false)}
          onSuccess={() => obtenerPacientes()}
        />

        {/* Modal Editar */}
        <ModalEditarPaciente
          isOpen={modalEditarAbierto}
          paciente={pacienteSeleccionado}
          onClose={() => {
            setModalEditarAbierto(false);
            setPacienteSeleccionado(null);
          }}
          onSuccess={() => {
            obtenerPacientes();
            setModalEditarAbierto(false);
            setPacienteSeleccionado(null);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}