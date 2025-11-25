'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, AlertCircle } from 'lucide-react';

interface ModalMuestraProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalMuestra({ isOpen, onClose, onSuccess }: ModalMuestraProps) {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    tipo_examen: 'sangre',
    observaciones: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoPacientes, setCargandoPacientes] = useState(true);

  useEffect(() => {
    if (isOpen) {
      obtenerPacientes();
    }
  }, [isOpen]);

  const obtenerPacientes = async () => {
    try {
      setCargandoPacientes(true);
      const response = await api.get('/pacientes');
      setPacientes(response.data);
    } catch (err: any) {
      setError('Error al cargar pacientes');
    } finally {
      setCargandoPacientes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await api.post('/muestras', {
        paciente_id: parseInt(formData.paciente_id),
        tipo_examen: formData.tipo_examen,
        observaciones: formData.observaciones,
      });

      setFormData({
        paciente_id: '',
        tipo_examen: 'sangre',
        observaciones: '',
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Registrar Nueva Muestra</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Paciente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paciente *
            </label>
            <select
              value={formData.paciente_id}
              onChange={(e) =>
                setFormData({ ...formData, paciente_id: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
              disabled={cargandoPacientes}
            >
              <option value="">
                {cargandoPacientes ? 'Cargando...' : 'Selecciona un paciente'}
              </option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.rut})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Examen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Examen *
            </label>
            <select
              value={formData.tipo_examen}
              onChange={(e) =>
                setFormData({ ...formData, tipo_examen: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
            >
              <option value="sangre">Análisis de Sangre</option>
              <option value="orina">Análisis de Orina</option>
              <option value="heces">Análisis de Heces</option>
            </select>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              placeholder="Notas adicionales..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-400"
            >
              {cargando ? 'Guardando...' : 'Registrar Muestra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}