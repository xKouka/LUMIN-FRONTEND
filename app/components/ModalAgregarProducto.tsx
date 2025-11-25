'use client';

import { useState } from 'react';
import api from '../lib/api';
import { X, AlertCircle } from 'lucide-react';

interface ModalAgregarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalAgregarProducto({
  isOpen,
  onClose,
  onSuccess,
}: ModalAgregarProductoProps) {
  const [formData, setFormData] = useState({
    nombre_producto: '',
    tipo: '',
    cantidad: '',
    cantidad_minima: '5',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre_producto.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    if (!formData.tipo.trim()) {
      setError('El tipo es requerido');
      return;
    }

    if (!formData.cantidad || parseInt(formData.cantidad) < 0) {
      setError('La cantidad debe ser un número válido');
      return;
    }

    setCargando(true);

    try {
      await api.post('/inventario', {
        nombre_producto: formData.nombre_producto,
        tipo: formData.tipo,
        cantidad: parseInt(formData.cantidad),
        cantidad_minima: parseInt(formData.cantidad_minima) || 5,
      });

      setFormData({
        nombre_producto: '',
        tipo: '',
        cantidad: '',
        cantidad_minima: '5',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar producto');
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Agregar Producto</h2>
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

          {/* Nombre Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.nombre_producto}
              onChange={(e) =>
                setFormData({ ...formData, nombre_producto: e.target.value })
              }
              placeholder="Tubo de ensayo estéril"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="material">Material de laboratorio</option>
              <option value="reactivo">Reactivo químico</option>
              <option value="equipo">Equipo</option>
              <option value="consumible">Consumible</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad *
            </label>
            <input
              type="number"
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: e.target.value })
              }
              placeholder="100"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
              required
            />
          </div>

          {/* Cantidad Mínima */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad Mínima
            </label>
            <input
              type="number"
              value={formData.cantidad_minima}
              onChange={(e) =>
                setFormData({ ...formData, cantidad_minima: e.target.value })
              }
              placeholder="5"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-600 mt-1">
              Se alertará cuando la cantidad sea menor
            </p>
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
              {cargando ? 'Agregando...' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}