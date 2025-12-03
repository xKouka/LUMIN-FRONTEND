'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, AlertCircle } from 'lucide-react';

interface ModalEditarPacienteProps {
  isOpen: boolean;
  paciente: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarPaciente({
  isOpen,
  paciente,
  onClose,
  onSuccess,
}: ModalEditarPacienteProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    fecha_nacimiento: '',
    genero: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (paciente && isOpen) {
      setFormData({
        nombre: paciente.nombre || '',
        apellido: paciente.apellido || '',
        cedula: paciente.cedula || paciente.rut || '',
        fecha_nacimiento: paciente.fecha_nacimiento || '',
        genero: paciente.genero || '',
        telefono: paciente.telefono || '',
        direccion: paciente.direccion || '',
      });
    }
  }, [paciente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que el nombre solo contenga letras, espacios y Ñ
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (formData.nombre && !nombreRegex.test(formData.nombre)) {
      setError('El nombre solo puede contener letras y espacios');
      return;
    }

    // Validar que el apellido solo contenga letras, espacios y Ñ
    const apellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (formData.apellido && !apellidoRegex.test(formData.apellido)) {
      setError('El apellido solo puede contener letras y espacios');
      return;
    }

    // Validar género si está presente
    if (formData.genero && !['masculino', 'femenino'].includes(formData.genero)) {
      setError('El género debe ser masculino o femenino');
      return;
    }

    // Validar teléfono si está presente
    if (formData.telefono && !/^[0-9+\s-]+$/.test(formData.telefono)) {
      setError('El teléfono solo puede contener números, espacios, + y -');
      return;
    }

    setCargando(true);

    try {
      await api.put(`/pacientes/${paciente.id}`, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        rut: formData.cedula,
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero,
        telefono: formData.telefono,
        direccion: formData.direccion,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar paciente');
    } finally {
      setCargando(false);
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (!isOpen || !paciente) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Editar Paciente</h2>
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

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) =>
                setFormData({ ...formData, apellido: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Cédula de Identidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cédula de Identidad *
            </label>
            <input
              type="text"
              value={formData.cedula}
              onChange={(e) =>
                setFormData({ ...formData, cedula: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) =>
                setFormData({ ...formData, fecha_nacimiento: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
            />
            {formData.fecha_nacimiento && (
              <p className="text-xs text-gray-600 mt-1">
                Edad: {calcularEdad(formData.fecha_nacimiento)} años
              </p>
            )}
          </div>

          {/* Género */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <select
              value={formData.genero}
              onChange={(e) =>
                setFormData({ ...formData, genero: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            >
              <option value="">Selecciona...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
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
              className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-400"
            >
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}