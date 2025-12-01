'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import SearchBar from '@/app/components/SearchBar';
import Pagination from '@/app/components/Pagination';
import ModalAgregarProducto from '@/app/components/ModalAgregarProducto';
import ModalEditarProducto from '@/app/components/ModalEditarProducto';
import api from '@/app/lib/api';
import { Plus, AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { showConfirm, showError, showSuccess } from '@/app/utils/sweetalert';

export default function InventarioPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [cargandoEliminar, setCargandoEliminar] = useState<number | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    obtenerInventario();
  }, []);

  const obtenerInventario = async () => {
    try {
      setCargando(true);
      const response = await api.get('/inventario');
      setProductos(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar inventario');
    } finally {
      setCargando(false);
    }
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter((producto) => {
    const query = searchQuery.toLowerCase();
    return (
      producto.nombre_producto.toLowerCase().includes(query) ||
      producto.tipo.toLowerCase().includes(query)
    );
  });

  // Calcular paginación
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productosPaginados = productosFiltrados.slice(startIndex, endIndex);

  // Resetear página si no hay resultados
  if (productosFiltrados.length > 0 && currentPage > totalPages) {
    setCurrentPage(1);
  }

  const getBajoStock = (producto: any) => {
    return producto.cantidad <= producto.cantidad_minima;
  };

  const productosBajoStock = productos.filter(getBajoStock);

  const handleEditar = (producto: any) => {
    setProductoSeleccionado(producto);
    setModalEditarAbierto(true);
  };

  const handleEliminar = async (id: number) => {
    const result = await showConfirm(
      '¿Eliminar producto?',
      '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!result.isConfirmed) return;

    try {
      setCargandoEliminar(id);
      await api.delete(`/inventario/${id}`);
      obtenerInventario();
      showSuccess('Producto eliminado', 'El producto ha sido eliminado correctamente');
    } catch (err: any) {
      showError('Error al eliminar', err.response?.data?.error || 'No se pudo eliminar el producto');
    } finally {
      setCargandoEliminar(null);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-600 mt-2">
              Total de productos: {productos.length}
            </p>
          </div>
          <button
            onClick={() => setModalAgregarAbierto(true)}
            className="flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Agregar Producto</span>
          </button>
        </div>

        {/* Alert - Bajo Stock */}
        {productosBajoStock.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">
                {productosBajoStock.length} producto(s) con stock bajo
              </p>
              <p className="text-sm text-red-800 mt-1">
                {productosBajoStock.map((p) => p.nombre_producto).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4">
          <SearchBar
            placeholder="Buscar por nombre o tipo..."
            value={searchQuery}
            onSearch={setSearchQuery}
          />
          <p className="text-sm text-gray-600 mt-2">
            Resultados: {productosFiltrados.length} productos
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {cargando && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          </div>
        )}

        {/* Productos Table */}
        {!cargando && productosPaginados.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Mínimo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {productosPaginados.map((producto) => (
                    <tr
                      key={producto.id}
                      className={`hover:bg-gray-50 ${
                        getBajoStock(producto) ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {producto.nombre_producto}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {producto.tipo}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {producto.cantidad}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {producto.cantidad_minima}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            getBajoStock(producto)
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {getBajoStock(producto) ? 'Bajo' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-3">
                        <button
                          onClick={() => handleEditar(producto)}
                          className="text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Gestionar
                        </button>
                        <button
                          onClick={() => handleEliminar(producto.id)}
                          disabled={cargandoEliminar === producto.id}
                          className="text-red-600 hover:text-red-700 font-medium disabled:text-gray-400"
                        >
                          {cargandoEliminar === producto.id ? (
                            <span className="inline-flex items-center">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminando...
                            </span>
                          ) : (
                            <span className="inline-flex items-center">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!cargando && productosFiltrados.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">
              {searchQuery ? 'No se encontraron productos' : 'No hay productos en el inventario'}
            </p>
            <button
              onClick={() => setModalAgregarAbierto(true)}
              className="inline-flex items-center space-x-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar Primer Producto</span>
            </button>
          </div>
        )}

        {/* Paginación */}
        {productosFiltrados.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Modal Agregar */}
        <ModalAgregarProducto
          isOpen={modalAgregarAbierto}
          onClose={() => setModalAgregarAbierto(false)}
          onSuccess={() => obtenerInventario()}
        />

        {/* Modal Editar */}
        <ModalEditarProducto
          isOpen={modalEditarAbierto}
          producto={productoSeleccionado}
          onClose={() => {
            setModalEditarAbierto(false);
            setProductoSeleccionado(null);
          }}
          onSuccess={() => {
            obtenerInventario();
            setModalEditarAbierto(false);
            setProductoSeleccionado(null);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}