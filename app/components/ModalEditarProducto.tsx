'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, AlertCircle } from 'lucide-react';

interface ModalEditarProductoProps {
  isOpen: boolean;
  producto: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarProducto({
  isOpen,
  producto,
  onClose,
  onSuccess,
}: ModalEditarProductoProps) {
  const [formData, setFormData] = useState({
    nombre_producto: '',
    tipo: '',
    cantidad: '',
    cantidad_minima: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        nombre_producto: producto.nombre_producto || '',
        tipo: producto.tipo || '',
        cantidad: producto.cantidad || '',
        cantidad_minima: producto.cantidad_minima || '5',
      });
    }
  }, [producto, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await api.put(`/inventario/${producto.id}`, {
        cantidad: parseInt(formData.cantidad),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar producto');
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Editar Producto</h2>
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

          {/* Nombre Producto (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={formData.nombre_producto}
              disabled
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 outline-none"
            />
          </div>

          {/* Tipo (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <input
              type="text"
              value={formData.tipo}
              disabled
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 outline-none"
            />
          </div>

          {/* Cantidad Mínima (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad Mínima
            </label>
            <input
              type="number"
              value={formData.cantidad_minima}
              disabled
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 outline-none"
            />
          </div>

          {/* Cantidad (editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Cantidad *
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
            <p className="text-xs text-gray-600 mt-1">
              Cantidad actual: {producto.cantidad} unidades
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
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}