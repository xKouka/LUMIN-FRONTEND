'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import api from '@/app/lib/api';
import { Download, AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DetallesMuestraPage() {
  const params = useParams();
  const id = params.id as string;
  const [muestra, setMuestra] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [descargandoPDF, setDescargandoPDF] = useState(false);

  useEffect(() => {
    obtenerMuestra();
  }, [id]);

  const obtenerMuestra = async () => {
    try {
      setCargando(true);
      console.log('🔍 Obteniendo muestra ID:', id);
      const response = await api.get(`/muestras/${id}`);
      console.log('✅ Respuesta recibida:', response.data);
      setMuestra(response.data);
      setError('');
    } catch (err: any) {
      console.error('❌ Error al obtener muestra:', err);
      console.error('Detalles del error:', err.response?.data);
      setError(err.response?.data?.error || 'Error al cargar muestra');
    } finally {
      setCargando(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setDescargandoPDF(true);
      
      const response = await api.get(`/muestras/${id}/pdf`, {
        responseType: 'blob',
      });

      // Nombre simple con .pdf al final
      const filename = `Reporte_Muestra_${id}.pdf`;
      
      // Crear y descargar
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error('Error al descargar PDF:', err);
      alert('Error al generar PDF');
    } finally {
      setDescargandoPDF(false);
    }
  };

  if (cargando) {
    return (
      <ProtectedRoute>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !muestra) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <Link
            href="/dashboard/admin/muestras"
            className="flex items-center space-x-2 text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error || 'Muestra no encontrada'}</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const badges: any = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_proceso: 'bg-brand-100 text-brand-800',
      completado: 'bg-green-100 text-green-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/admin/muestras"
              className="flex items-center space-x-2 text-brand-900 hover:text-brand-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Muestra #{muestra.id.toString().padStart(6, '0')}
            </h1>
          </div>
          
          <button
            onClick={descargarPDF}
            disabled={descargandoPDF || !muestra.detalles || muestra.detalles.length === 0}
            className="flex items-center space-x-2 bg-brand-900 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {descargandoPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Información General */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Paciente</p>
              <p className="text-lg font-semibold text-gray-900">{muestra.paciente_nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Registro</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(muestra.fecha_toma).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getEstadoBadge(muestra.estado)}`}>
                {muestra.estado === 'en_proceso' ? 'En Proceso' : muestra.estado}
              </span>
            </div>
          </div>

          {muestra.observaciones && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-1">Observaciones Generales</p>
              <p className="text-gray-900">{muestra.observaciones}</p>
            </div>
          )}
        </div>

        {/* Detalles de Muestras */}
        {muestra.detalles && muestra.detalles.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Tipos de Muestras</h2>
            
            {muestra.detalles.map((detalle: any, index: number) => (
              <div key={detalle.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                    {detalle.tipo_muestra === 'sangre' && '🩸'}
                    {detalle.tipo_muestra === 'orina' && '💧'}
                    {detalle.tipo_muestra === 'heces' && '🧻'}
                    {detalle.tipo_muestra}
                  </h3>
                </div>

                {/* Resultados */}
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
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <FileText className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
            <p className="text-yellow-800 font-medium">
              Esta muestra aún no tiene detalles registrados
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Los detalles se agregarán cuando se procesen las muestras
            </p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}