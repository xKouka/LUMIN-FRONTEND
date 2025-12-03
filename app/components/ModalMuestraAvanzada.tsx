'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import api from '@/app/lib/api';
import FormSangre from './FormSangre';
import FormOrina from './FormOrina';
import FormHeces from './FormHeces';

interface ModalMuestraAvanzadaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ProductoUsado {
  producto_id: number;
  nombre: string;
  cantidad: number;
  stock: number;
}

interface DetalleMuestra {
  tipo_muestra: string;
  resultados: any;
  observaciones: string;
  productos: ProductoUsado[];
}

export default function ModalMuestraAvanzada({
  isOpen,
  onClose,
  onSuccess,
}: ModalMuestraAvanzadaProps) {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [pacienteId, setPacienteId] = useState('');
  const [observacionesGenerales, setObservacionesGenerales] = useState('');
  const [pagado, setPagado] = useState(false);
  const [detalles, setDetalles] = useState<DetalleMuestra[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      obtenerPacientes();
      obtenerInventario();
      setPacienteId('');
      setObservacionesGenerales('');
      setPagado(false);
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

  const obtenerInventario = async () => {
    try {
      const response = await api.get('/inventario');
      setInventario(response.data);
    } catch (err) {
      console.error('Error al obtener inventario:', err);
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
        productos: [],
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

  const agregarProducto = (detalleIndex: number, productoId: string) => {
    if (!productoId) return;

    const producto = inventario.find(p => p.id === parseInt(productoId));
    if (!producto) return;

    const nuevosDetalles = [...detalles];
    const yaExiste = nuevosDetalles[detalleIndex].productos.find(
      p => p.producto_id === parseInt(productoId)
    );

    if (yaExiste) {
      alert('Este producto ya está en la lista');
      return;
    }

    nuevosDetalles[detalleIndex].productos.push({
      producto_id: parseInt(productoId),
      nombre: producto.nombre_producto,
      cantidad: 1,
      stock: producto.cantidad,
    });

    setDetalles(nuevosDetalles);
  };

  const eliminarProducto = (detalleIndex: number, productoIndex: number) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[detalleIndex].productos.splice(productoIndex, 1);
    setDetalles(nuevosDetalles);
  };

  const actualizarCantidadProducto = (detalleIndex: number, productoIndex: number, cantidad: number) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[detalleIndex].productos[productoIndex].cantidad = cantidad;
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

      // Transformar detalles para enviar solo los campos necesarios de productos
      const detallesParaEnviar = detalles.map(detalle => ({
        tipo_muestra: detalle.tipo_muestra,
        resultados: detalle.resultados,
        observaciones: detalle.observaciones,
        productos: detalle.productos.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad
        }))
      }));

      await api.post('/muestras', {
        paciente_id: parseInt(pacienteId),
        observaciones: observacionesGenerales || null,
        detalles: detallesParaEnviar,
        pagado,
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
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Información General
            </h3>

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

            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <input
                type="checkbox"
                id="pagado"
                checked={pagado}
                onChange={(e) => setPagado(e.target.checked)}
                className="w-5 h-5 text-brand-500 bg-white border-gray-300 rounded focus:ring-brand-500 focus:ring-2 cursor-pointer"
              />
              <label htmlFor="pagado" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                ✅ Muestra Pagada
              </label>
              <span className="text-xs text-gray-500">
                (Los clientes solo verán muestras marcadas como pagadas)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Tipos de Muestras
              </h3>

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

            {detalles.length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
                Agrega al menos un tipo de muestra usando los botones arriba
              </div>
            )}

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

                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      📦 Productos Utilizados en este Examen
                    </label>
                  </div>

                  <div className="mb-3">
                    <select
                      onChange={(e) => {
                        agregarProducto(index, e.target.value);
                        e.target.value = '';
                      }}
                      className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">+ Agregar Producto Usado</option>
                      {inventario.filter(p => p.cantidad > 0).map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre_producto} - Stock: {producto.cantidad}
                        </option>
                      ))}
                    </select>
                    {inventario.filter(p => p.cantidad > 0).length === 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ No hay productos con stock. Ve a Inventario para agregar productos.
                      </p>
                    )}
                  </div>

                  {detalle.productos.length === 0 ? (
                    <p className="text-sm text-gray-600 italic">Sin productos registrados</p>
                  ) : (
                    <div className="space-y-2">
                      {detalle.productos.map((producto, pIndex) => (
                        <div key={pIndex} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-200">
                          <span className="flex-1 text-sm font-medium text-gray-900">{producto.nombre}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Stock: {producto.stock}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Cant:</label>
                            <input
                              type="number"
                              min="1"
                              max={producto.stock}
                              value={producto.cantidad}
                              onChange={(e) => actualizarCantidadProducto(index, pIndex, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarProducto(index, pIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-700 disabled:bg-brand-300 disabled:cursor-not-allowed"
          >
            {cargando ? 'Registrando...' : 'Registrar Muestra'}
          </button>
        </div>
      </div>
    </div>
  );
}
