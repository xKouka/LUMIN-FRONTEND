'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import SearchBar from '@/app/components/SearchBar';
import Pagination from '@/app/components/Pagination';
import ModalMuestraAvanzada from '@/app/components/ModalMuestraAvanzada';
import ModalEditarMuestra from '@/app/components/ModalEditarMuestra';
import api from '@/app/lib/api';
import { Plus, AlertCircle, Filter, Trash2, FileText, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { showConfirm, showError, showSuccess } from '@/app/utils/sweetalert';

export default function MuestrasAdminPage() {
  const [muestras, setMuestras] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any>(null);
  const [cargandoEliminar, setCargandoEliminar] = useState<number | null>(null);
  const [cargandoPago, setCargandoPago] = useState<number | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    obtenerMuestras();
  }, []);

  const obtenerMuestras = async () => {
    try {
      setCargando(true);
      const response = await api.get('/muestras');
      setMuestras(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar muestras');
    } finally {
      setCargando(false);
    }
  };

  const muestrasFiltradas = muestras.filter((muestra) => {
    const query = searchQuery.toLowerCase();

    // Filtro por tipo de muestra
    if (filtro !== 'todos') {
      const tieneTipo = muestra.tipos_muestras?.some((t: any) => t.tipo_muestra === filtro);
      if (!tieneTipo) return false;
    }

    // Buscar en tipos de muestras
    const tiposString = muestra.tipos_muestras
      ? muestra.tipos_muestras.map((t: any) => t.tipo_muestra).join(' ')
      : '';

    const matchesSearch =
      muestra.paciente_nombre.toLowerCase().includes(query) ||
      muestra.cedula.includes(query) ||
      tiposString.toLowerCase().includes(query) ||
      muestra.id.toString().includes(query);

    const fechaMuestra = new Date(muestra.fecha_toma);
    const matchesFechaInicio = !fechaInicio || fechaMuestra >= new Date(fechaInicio);
    const matchesFechaFin = !fechaFin || fechaMuestra <= new Date(new Date(fechaFin).setHours(23, 59, 59));

    return matchesSearch && matchesFechaInicio && matchesFechaFin;
  });

  const totalPages = Math.ceil(muestrasFiltradas.length / itemsPerPage);
  const currentMuestras = muestrasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const eliminarMuestra = async (id: number) => {
    const result = await showConfirm(
      '¿Eliminar muestra?',
      '¿Estás seguro de que deseas eliminar esta muestra? Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!result.isConfirmed) return;

    try {
      setCargandoEliminar(id);
      await api.delete(`/muestras/${id}`);
      setMuestras(muestras.filter((m) => m.id !== id));
      showSuccess('Muestra eliminada', 'La muestra ha sido eliminada correctamente');
    } catch (err: any) {
      showError('Error al eliminar', err.response?.data?.error || 'No se pudo eliminar la muestra');
    } finally {
      setCargandoEliminar(null);
    }
  };

  const togglePagado = async (id: number, pagadoActual: boolean) => {
    try {
      setCargandoPago(id);
      await api.put(`/muestras/${id}`, { pagado: !pagadoActual });

      // Actualizar el estado local
      setMuestras(muestras.map(m =>
        m.id === id ? { ...m, pagado: !pagadoActual } : m
      ));

      showSuccess(
        pagadoActual ? 'Marcada como NO pagada' : 'Marcada como PAGADA',
        `El estado de pago de la muestra ha sido actualizado`
      );
    } catch (err: any) {
      showError('Error', err.response?.data?.error || 'No se pudo actualizar el estado de pago');
    } finally {
      setCargandoPago(null);
    }
  };

  const tiposExamen = [
    { label: 'Todos', value: 'todos' },
    { label: 'Sangre', value: 'sangre' },
    { label: 'Orina', value: 'orina' },
    { label: 'Heces', value: 'heces' },
  ];

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtro, searchQuery, fechaInicio, fechaFin]);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="max-w-[1900px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Muestras</h1>
            <p className="text-gray-600 mt-2">
              Mostrando {muestrasFiltradas.length} de {muestras.length} muestras
            </p>
          </div>

          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Muestra</span>
          </button>
        </div>

        {/* Filtro por tipo */}
        <div className="flex gap-2 flex-wrap">
          {tiposExamen.map((tipo) => (
            <button
              key={tipo.value}
              onClick={() => setFiltro(tipo.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtro === tipo.value
                  ? 'bg-brand-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-300'
                }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              {tipo.label}
            </button>
          ))}
        </div>

        {/* Buscador + fechas */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <SearchBar
            placeholder="Buscar por paciente, cédula o ID..."
            value={searchQuery}
            onSearch={setSearchQuery}
            className="placeholder-gray-700"
          />

          <div className="flex flex-wrap gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="block w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="block w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipos de Muestras</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado de Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cargando ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : currentMuestras.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron muestras
                    </td>
                  </tr>
                ) : (
                  currentMuestras.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{m.id.toString().padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{m.paciente_nombre}</div>
                        <div className="text-sm text-gray-500">{m.cedula}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {m.tipos_muestras && m.tipos_muestras.length > 0 ? (
                            m.tipos_muestras.map((t: any) => (
                              <span
                                key={t.id}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                  ${t.tipo_muestra === 'sangre' ? 'bg-red-100 text-red-800' :
                                    t.tipo_muestra === 'orina' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-amber-100 text-amber-800'}`}
                              >
                                {t.tipo_muestra}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm italic">Sin detalles</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(m.fecha_toma).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePagado(m.id, m.pagado)}
                          disabled={cargandoPago === m.id}
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${m.pagado
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={m.pagado ? 'Click para marcar como NO pagada' : 'Click para marcar como PAGADA'}
                        >
                          {cargandoPago === m.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1.5"></div>
                              Actualizando...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-3.5 h-3.5 mr-1" />
                              {m.pagado ? 'Pagada' : 'No Pagada'}
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/dashboard/admin/muestras/${m.id}`}
                            className="text-brand-600 hover:text-brand-900"
                            title="Ver detalles"
                          >
                            <FileText className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setMuestraSeleccionada(m);
                              setModalEditarAbierto(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => eliminarMuestra(m.id)}
                            disabled={cargandoEliminar === m.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Eliminar"
                          >
                            {cargandoEliminar === m.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {muestrasFiltradas.length > itemsPerPage && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Modal Crear */}
        <ModalMuestraAvanzada
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSuccess={() => obtenerMuestras()}
        />

        {/* Modal Editar */}
        <ModalEditarMuestra
          isOpen={modalEditarAbierto}
          muestra={muestraSeleccionada}
          onClose={() => setModalEditarAbierto(false)}
          onSuccess={() => {
            obtenerMuestras();
            setModalEditarAbierto(false);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
