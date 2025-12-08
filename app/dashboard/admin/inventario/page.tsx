'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Pagination from '@/app/components/Pagination';
import ModalAgregarProducto from '@/app/components/ModalAgregarProducto';
import ModalEditarProducto from '@/app/components/ModalEditarProducto';
import api from '@/app/lib/api';
import { Plus, AlertTriangle, Trash2, Search, Package, ArrowUpDown, Settings2 } from 'lucide-react';
import { showConfirm, showError, showSuccess } from '@/app/utils/sweetalert';

// ShadCN UI
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function InventarioPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
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

  const getBajoStock = (producto: any) => {
    return producto.cantidad <= (producto.cantidad_minima || 5);
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter((producto) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      producto.nombre_producto.toLowerCase().includes(query) ||
      producto.tipo.toLowerCase().includes(query);

    const matchesTipo = filterTipo === 'todos' || producto.tipo === filterTipo;

    let matchesEstado = true;
    if (filterEstado === 'bajo') {
      matchesEstado = getBajoStock(producto);
    } else if (filterEstado === 'normal') {
      matchesEstado = !getBajoStock(producto);
    }

    return matchesSearch && matchesTipo && matchesEstado;
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
      <div className="flex flex-col gap-6 max-w-[1900px] mx-auto w-full p-4 md:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventario</h1>
            <p className="text-muted-foreground mt-1">
              Gestión de materiales, reactivos y equipos
            </p>
          </div>
          <Button
            onClick={() => setModalAgregarAbierto(true)}
            className="bg-brand-500 hover:bg-brand-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {/* Alerts */}
        {productosBajoStock.length > 0 && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-semibold">Alerta de Stock Bajo</AlertTitle>
            <AlertDescription className="text-red-700 mt-1">
              Hay {productosBajoStock.length} productos con existencias por debajo del mínimo:
              <span className="font-medium ml-1">
                {productosBajoStock.slice(0, 5).map(p => p.nombre_producto).join(', ')}
                {productosBajoStock.length > 5 && '... y más'}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Content */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Listado de Productos</CardTitle>
                <CardDescription>Total registrados: {productos.length}</CardDescription>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="reactivo">Reactivo</SelectItem>
                  <SelectItem value="equipo">Equipo</SelectItem>
                  <SelectItem value="consumible">Consumible</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bajo">Bajo Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
              </div>
            ) : productosPaginados.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>{searchQuery ? 'No se encontraron productos' : 'No hay productos registrados'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cantidad Actual</TableHead>
                      <TableHead>Mínimo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosPaginados.map((producto) => {
                      const isLowStock = getBajoStock(producto);
                      return (
                        <TableRow key={producto.id} className={isLowStock ? "bg-red-50/50 hover:bg-red-50" : ""}>
                          <TableCell className="font-medium text-gray-900">
                            {producto.nombre_producto}
                          </TableCell>
                          <TableCell className="capitalize text-muted-foreground">
                            {producto.tipo}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {producto.cantidad}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {producto.cantidad_minima || 5}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isLowStock ? "destructive" : "secondary"} className={
                              isLowStock ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"
                            }>
                              {isLowStock ? 'Bajo Stock' : 'Normal'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditar(producto)}
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Settings2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Gestionar Stock</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEliminar(producto.id)}
                              disabled={cargandoEliminar === producto.id}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              {cargandoEliminar === producto.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {productosFiltrados.length > itemsPerPage && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </CardContent>
        </Card>

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
    </ProtectedRoute >
  );
}