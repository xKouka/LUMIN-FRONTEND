'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import api from '@/app/lib/api';
import { Download, Filter, AlertCircle } from 'lucide-react';

export default function MuestrasClientePage() {
  const [muestras, setMuestras] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerMuestras();
  }, [filtro]);

  const obtenerMuestras = async () => {
    try {
      setCargando(true);
      const url =
        filtro === 'todos'
          ? '/muestras'
          : `/muestras/filtro/${filtro}`;
      const response = await api.get(url);
      setMuestras(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar muestras');
    } finally {
      setCargando(false);
    }
  };

  const tiposExamen = [
    { value: 'todos', label: 'Todas' },
    { value: 'sangre', label: 'Sangre' },
    { value: 'orina', label: 'Orina' },
    { value: 'heces', label: 'Heces' },
  ];

  const getEstadoBadge = (estado: string) => {
    const badges: any = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      completado: 'bg-green-100 text-green-800',
      procesando: 'bg-brand-100 text-brand-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedRoute requiredRole="cliente">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Muestras</h1>
            <p className="text-gray-600 mt-2">
              Total de muestras registradas: {muestras.length}
            </p>
          </div>
        </div>

        {/* Filtro */}
        <div className="flex gap-2 flex-wrap">
          {tiposExamen.map((tipo) => (
            <button
              key={tipo.value}
              onClick={() => setFiltro(tipo.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === tipo.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-brand-300'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-2" />
              {tipo.label}
            </button>
          ))}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          </div>
        )}

        {/* Muestras Table */}
        {!cargando && muestras.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Tipo de Examen
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {muestras.map((muestra) => (
                    <tr key={muestra.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {muestra.tipo_examen}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(muestra.fecha_toma).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(
                            muestra.estado
                          )}`}
                        >
                          {muestra.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-brand-600 hover:text-brand-700 flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>Descargar</span>
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
        {!cargando && muestras.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay muestras registradas</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}