'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, AlertCircle, Save, Loader2 } from 'lucide-react';
import FormSangre from './FormSangre';
import FormOrina from './FormOrina';
import FormHeces from './FormHeces';

interface ModalEditarMuestraProps {
  isOpen: boolean;
  muestra: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarMuestra({
  isOpen,
  muestra,
  onClose,
  onSuccess,
}: ModalEditarMuestraProps) {
  const [formData, setFormData] = useState({
    observaciones: '',
  });
  const [detalles, setDetalles] = useState<any[]>([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar detalles completos cuando se abre el modal
  useEffect(() => {
    if (muestra && isOpen) {
      setFormData({
        observaciones: muestra.observaciones || '',
      });
      cargarDetalles(muestra.id);
    }
  }, [muestra, isOpen]);

  const cargarDetalles = async (id: number) => {
    try {
      setLoadingDetalles(true);
      const response = await api.get(`/muestras/${id}`);
      setDetalles(response.data.detalles || []);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      setError('No se pudieron cargar los detalles de la muestra.');
    } finally {
      setLoadingDetalles(false);
    }
  };

  const handleDetalleChange = (index: number, field: string, value: any) => {
    const newDetalles = [...detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setDetalles(newDetalles);
  };

  const handleResultadosChange = (index: number, nuevosResultados: any) => {
    const newDetalles = [...detalles];
    newDetalles[index] = { 
      ...newDetalles[index], 
      resultados: { ...newDetalles[index].resultados, ...nuevosResultados } 
    };
    setDetalles(newDetalles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const payload = {
        ...formData,
        detalles: detalles
      };

      await api.put(`/muestras/${muestra.id}`, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar muestra');
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen || !muestra) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Editar Muestra #{muestra.id}</h2>
            <p className="text-sm text-gray-500">{muestra.paciente_nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Observaciones Generales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones Generales
            </label>
            <input
              type="text"
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              placeholder="Notas generales..."
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados por Tipo de Muestra</h3>
            
            {loadingDetalles ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              </div>
            ) : detalles.length === 0 ? (
              <p className="text-gray-500 italic">No hay detalles asociados a esta muestra.</p>
            ) : (
              <div className="space-y-8">
                {detalles.map((detalle, index) => (
                  <div key={detalle.id || index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-bold text-gray-800 capitalize flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 
                          ${detalle.tipo_muestra === 'sangre' ? 'bg-red-500' : 
                            detalle.tipo_muestra === 'orina' ? 'bg-yellow-500' : 'bg-amber-600'}`}>
                        </span>
                        {detalle.tipo_muestra}
                      </h4>
                    </div>

                    {/* Renderizar formulario específico según tipo */}
                    <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                      {detalle.tipo_muestra === 'sangre' && (
                        <FormSangre 
                          resultados={detalle.resultados || {}} 
                          onChange={(field, value) => handleResultadosChange(index, { [field]: value })} 
                        />
                      )}
                      {detalle.tipo_muestra === 'orina' && (
                        <FormOrina 
                          resultados={detalle.resultados || {}} 
                          onChange={(field, value) => handleResultadosChange(index, { [field]: value })} 
                        />
                      )}
                      {detalle.tipo_muestra === 'heces' && (
                        <FormHeces 
                          resultados={detalle.resultados || {}} 
                          onChange={(field, value) => handleResultadosChange(index, { [field]: value })} 
                        />
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones para {detalle.tipo_muestra}
                      </label>
                      <textarea
                        value={detalle.observaciones || ''}
                        onChange={(e) => handleDetalleChange(index, 'observaciones', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                        rows={2}
                        placeholder={`Observaciones específicas de ${detalle.tipo_muestra}...`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={cargando || loadingDetalles}
            className="flex items-center space-x-2 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}