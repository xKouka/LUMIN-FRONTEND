'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, AlertCircle, Plus, Minus } from 'lucide-react';

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
  const [cantidadInput, setCantidadInput] = useState('');
  const [accion, setAccion] = useState<'sumar' | 'restar'>('sumar');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCantidadInput('');
      setAccion('sumar');
      setError('');
    }
  }, [isOpen, producto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const cantidadActual = parseInt(producto.cantidad || '0');
      const cantidadCambio = parseInt(cantidadInput);
      
      if (isNaN(cantidadCambio) || cantidadCambio <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      let nuevaCantidadTotal = cantidadActual;
      if (accion === 'sumar') {
        nuevaCantidadTotal += cantidadCambio;
      } else {
        nuevaCantidadTotal -= cantidadCambio;
      }

      if (nuevaCantidadTotal < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      await api.put(`/inventario/${producto.id}`, {
        cantidad: nuevaCantidadTotal,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Error al actualizar producto');
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen || !producto) return null;

  const cantidadActual = parseInt(producto.cantidad || '0');
  const cantidadCambio = parseInt(cantidadInput) || 0;
  const nuevaCantidadPreview = accion === 'sumar' 
    ? cantidadActual + cantidadCambio 
    : cantidadActual - cantidadCambio;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Gestionar Inventario</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">{producto.nombre_producto}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Stock Actual:</span>
              <span className="font-bold text-gray-900">{producto.cantidad} unidades</span>
            </div>
          </div>

          {/* Selector de Acción */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setAccion('sumar')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 border transition-colors ${
                accion === 'sumar'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500 ring-offset-1'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
            <button
              type="button"
              onClick={() => setAccion('restar')}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 border transition-colors ${
                accion === 'restar'
                  ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500 ring-offset-1'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>Quitar</span>
            </button>
          </div>

          {/* Cantidad Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a {accion === 'sumar' ? 'Agregar' : 'Quitar'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {accion === 'sumar' ? (
                  <Plus className="h-5 w-5 text-blue-500" />
                ) : (
                  <Minus className="h-5 w-5 text-red-500" />
                )}
              </div>
              <input
                type="number"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                placeholder="0"
                min="1"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-brand-600 focus:border-transparent outline-none"
                required
              />
            </div>
            
            {/* Preview del nuevo total */}
            <div className="mt-3 flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Nuevo Total Estimado:</span>
              <span className={`font-bold ${
                nuevaCantidadPreview < 0 ? 'text-red-600' : 
                nuevaCantidadPreview < (producto.cantidad_minima || 5) ? 'text-orange-600' : 'text-green-600'
              }`}>
                {nuevaCantidadPreview} unidades
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando || nuevaCantidadPreview < 0}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 ${
                accion === 'sumar' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {cargando ? 'Guardando...' : accion === 'sumar' ? 'Agregar Stock' : 'Quitar Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}