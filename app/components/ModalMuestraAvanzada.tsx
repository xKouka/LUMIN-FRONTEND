'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '@/app/lib/api';
import FormSangre from './FormSangre';
import FormOrina from './FormOrina';
import FormHeces from './FormHeces';

interface ModalMuestraAvanzadaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DetalleMuestra {
  tipo_muestra: string;
  resultados: any;
  observaciones: string;
}

export default function ModalMuestraAvanzada({
  isOpen,
  onClose,
  onSuccess,
}: ModalMuestraAvanzadaProps) {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [pacienteId, setPacienteId] = useState('');
  const [observacionesGenerales, setObservacionesGenerales] = useState('');
  const [detalles, setDetalles] = useState<DetalleMuestra[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      obtenerPacientes();
      // Reset form
      setPacienteId('');
      setObservacionesGenerales('');
      setDetalles([]);
      setError('');
    }
  }, [isOpen]);

  const obtenerPacientes = async () => {
    try {
      const response = await api.get('/pacientes');
      setPacientes(response.data);
    } catch (err) {
      console.error('Error al obtener pacientes:', err);
    }
  };

  const tiposDisponibles = () => {
    const agregados = detalles.map((d) => d.tipo_muestra);
    const todos = ['sangre', 'orina', 'heces'];
    return todos.filter((tipo) => !agregados.includes(tipo));
  };

  const agregarTipoMuestra = (tipo: string) => {
    setDetalles([
      ...detalles,
      {
        tipo_muestra: tipo,
        resultados: {},
        observaciones: '',
      },
    ]);
  };

  const eliminarTipoMuestra = (index: number) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const actualizarResultados = (index: number, field: string, value: any) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index].resultados[field] = value;
    setDetalles(nuevosDetalles);
  };

  const actualizarObservaciones = (index: number, observaciones: string) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index].observaciones = observaciones;
    setDetalles(nuevosDetalles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pacienteId) {
      setError('Debes seleccionar un paciente');
      return;
    }

    if (detalles.length === 0) {
      setError('Debes agregar al menos un tipo de muestra');
      return;
    }

    try {
      setCargando(true);

      await api.post('/muestras', {
        paciente_id: parseInt(pacienteId),
        observaciones: observacionesGenerales || null,
        detalles: detalles,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear muestra');
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Registrar Nueva Muestra
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={cargando}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Información General
            </h3>

            {/* Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente *
              </label>
              <select
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.cedula})
                  </option>
                ))}
              </select>
            </div>

            {/* Observaciones Generales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones Generales
              </label>
              <textarea
                value={observacionesGenerales}
                onChange={(e) => setObservacionesGenerales(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Observaciones que aplican a toda la prueba..."
              />
            </div>
          </div>

          {/* Tipos de Muestras */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Tipos de Muestras
              </h3>

              {/* Botones para agregar tipos */}
              {tiposDisponibles().length > 0 && (
                <div className="flex gap-2">
                  {tiposDisponibles().map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => agregarTipoMuestra(tipo)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="capitalize">{tipo}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mensaje si no hay muestras */}
            {detalles.length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                Agrega al menos un tipo de muestra usando los botones arriba
              </div>
            )}

            {/* Formularios de cada tipo */}
            {detalles.map((detalle, index) => (
              <div
                key={index}
                className="p-4 border-2 border-gray-200 rounded-lg space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold text-gray-900 capitalize">
                    {detalle.tipo_muestra === 'sangre' && '🩸 Sangre'}
                    {detalle.tipo_muestra === 'orina' && '💧 Orina'}
                    {detalle.tipo_muestra === 'heces' && '🧻 Heces'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => eliminarTipoMuestra(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Formulario específico según tipo */}
                {detalle.tipo_muestra === 'sangre' && (
                  <FormSangre
                    resultados={detalle.resultados}
                    onChange={(field, value) =>
                      actualizarResultados(index, field, value)
                    }
                  />
                )}
                {detalle.tipo_muestra === 'orina' && (
                  <FormOrina
                    resultados={detalle.resultados}
                    onChange={(field, value) =>
                      actualizarResultados(index, field, value)
                    }
                  />
                )}
                {detalle.tipo_muestra === 'heces' && (
                  <FormHeces
                    resultados={detalle.resultados}
                    onChange={(field, value) =>
                      actualizarResultados(index, field, value)
                    }
                  />
                )}

                {/* Observaciones específicas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones específicas de {detalle.tipo_muestra}
                  </label>
                  <textarea
                    value={detalle.observaciones}
                    onChange={(e) =>
                      actualizarObservaciones(index, e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Observaciones específicas..."
                  />
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={cargando}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-brand-300 disabled:cursor-not-allowed"
          >
            {cargando ? 'Registrando...' : 'Registrar Muestra'}
          </button>
        </div>
      </div>
    </div>
  );
}
