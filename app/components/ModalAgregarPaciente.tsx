'use client';

import { useState } from 'react';
import api from '../lib/api';
import { X, AlertCircle, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface ModalAgregarPacienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalAgregarPaciente({
  isOpen,
  onClose,
  onSuccess,
}: ModalAgregarPacienteProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    fecha_nacimiento: '',
    genero: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exitoModal, setExitoModal] = useState(false);
  const [datosCreados, setDatosCreados] = useState<any>(null);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    // Validar que el nombre solo contenga letras, espacios y Ñ
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombreRegex.test(formData.nombre)) {
      setError('El nombre solo puede contener letras y espacios');
      return;
    }

    if (!formData.apellido.trim()) {
      setError('El apellido es requerido');
      return;
    }

    // Validar que el apellido solo contenga letras, espacios y Ñ
    const apellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!apellidoRegex.test(formData.apellido)) {
      setError('El apellido solo puede contener letras y espacios');
      return;
    }

    if (!formData.cedula.trim()) {
      setError('La cédula de identidad es requerida');
      return;
    }

    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El correo electrónico no es válido');
      return;
    }

    if (!formData.fecha_nacimiento) {
      setError('La fecha de nacimiento es requerida');
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
      const response = await api.post('/pacientes', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        email: formData.email,
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero || null,
        telefono: formData.telefono || null,
        direccion: formData.direccion || null,
      });

      setDatosCreados({
        paciente: response.data.paciente,
        usuario: response.data.usuario,
      });
      setExitoModal(true);

      setFormData({
        nombre: '',
        apellido: '',
        cedula: '',
        email: '',
        fecha_nacimiento: '',
        genero: '',
        telefono: '',
        direccion: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar paciente');
    } finally {
      setCargando(false);
    }
  };

  const handleCopiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCerrar = () => {
    if (exitoModal) {
      setExitoModal(false);
      onSuccess();
      onClose();
    } else {
      onClose();
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

  if (!isOpen) return null;

  if (exitoModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              ¡Paciente Creado!
            </h2>
            <button
              onClick={handleCerrar}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-gray-700 mb-2">
                Se ha creado correctamente el paciente y su cuenta de usuario.
              </p>
            </div>

            {/* Datos del Paciente */}
            <div className="bg-brand-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-bold text-brand-900 mb-3">
                📋 Datos del Paciente:
              </p>
              <div className="space-y-2 text-sm">
                <div className="bg-white p-2 rounded border border-brand-200">
                  <p className="text-xs text-gray-600">Nombre</p>
                  <p className="font-semibold text-gray-900">
                    {datosCreados?.paciente?.nombre}
                  </p>
                </div>
                <div className="bg-white p-2 rounded border border-brand-200">
                  <p className="text-xs text-gray-600">Cédula</p>
                  <p className="font-semibold text-gray-900">
                    {datosCreados?.paciente?.cedula}
                  </p>
                </div>
              </div>
            </div>

            {/* Credenciales de Usuario */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-bold text-green-900 mb-3">
                🔐 Credenciales de Usuario:
              </p>
              <div className="space-y-3 text-sm">
                {/* Usuario */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Usuario (Cédula)</p>
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded border border-green-300 flex-1">
                      <p className="font-mono font-semibold text-gray-900">
                        {datosCreados?.usuario?.usuario}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleCopiar(datosCreados?.usuario?.usuario)
                      }
                      className="p-2 hover:bg-green-100 rounded transition-colors"
                      title="Copiar"
                    >
                      {copiado ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Contraseña</p>
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded border border-green-300 flex-1 flex items-center">
                      <input
                        type={mostrarContraseña ? 'text' : 'password'}
                        value={datosCreados?.usuario?.contraseña}
                        readOnly
                        className="font-mono font-semibold text-gray-900 bg-transparent w-full outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setMostrarContraseña(!mostrarContraseña)}
                      className="p-2 hover:bg-green-100 rounded transition-colors"
                      title="Mostrar/Ocultar"
                    >
                      {mostrarContraseña ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleCopiar(datosCreados?.usuario?.contraseña)
                      }
                      className="p-2 hover:bg-green-100 rounded transition-colors"
                      title="Copiar"
                    >
                      {copiado ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-xs text-yellow-900 font-semibold mb-2">
                ⚠️ Importante:
              </p>
              <p className="text-xs text-yellow-800">
                Comparte estas credenciales con el paciente. Podrá ingresar al portal usando el usuario (cédula) O el email, junto con la contraseña mostrada.
              </p>
            </div>

            <button
              onClick={handleCerrar}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Agregar Paciente</h2>
          <button
            onClick={handleCerrar}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
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
              placeholder="Juan"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
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
              placeholder="Pérez"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-600 mt-1">
              Se usará para generar la contraseña
            </p>
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
              placeholder="1234567890"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-600 mt-1">
              Será usada como usuario de acceso
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="paciente@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-600 mt-1">
              Se usará como credencial alternativa de acceso
            </p>
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
              placeholder="+56 9 1234 5678"
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
              placeholder="Calle Principal 123, Apto 4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCerrar}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={cargando}
              className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:bg-gray-400"
            >
              {cargando ? 'Agregando...' : 'Agregar Paciente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}