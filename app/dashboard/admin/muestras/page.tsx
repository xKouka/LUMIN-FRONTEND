'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Pagination from '@/app/components/Pagination';
import ModalMuestraAvanzada from '@/app/components/ModalMuestraAvanzada';
import ModalEditarMuestra from '@/app/components/ModalEditarMuestra';
import ModalVerMuestra from '@/app/components/ModalVerMuestra';
import ModalInfoPaciente from '@/app/components/ModalInfoPaciente';
import api from '@/app/lib/api';
import {
  Plus,
  Search,
  Trash2,
  FileText,
  DollarSign,
  Edit2,
  Calendar as CalendarIcon,
  Beaker,
  TestTube
} from 'lucide-react';
import Link from 'next/link';
import { showConfirm, showError, showSuccess } from '@/app/utils/sweetalert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Shadcn UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DatePicker } from '@/components/ui/date-picker';

export default function MuestrasAdminPage() {
  const [muestras, setMuestras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPago, setFiltroPago] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals & Actions
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [modalInfoAbierto, setModalInfoAbierto] = useState(false);
  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
  const [muestraVerId, setMuestraVerId] = useState<number | null>(null);
  const [cargandoEliminar, setCargandoEliminar] = useState<number | null>(null);
  const [cargandoPago, setCargandoPago] = useState<number | null>(null);

  useEffect(() => {
    obtenerMuestras();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroTipo, filtroPago, searchQuery, fechaInicio, fechaFin]);

  const obtenerMuestras = async () => {
    try {
      setLoading(true);
      const response = await api.get('/muestras');
      setMuestras(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar muestras');
    } finally {
      setLoading(false);
    }
  };

  const muestrasFiltradas = muestras.filter((muestra) => {
    const query = searchQuery.toLowerCase();

    // Filtro por tipo de muestra
    if (filtroTipo !== 'todos') {
      const tieneTipo = muestra.tipos_muestras?.some((t: any) => t.tipo_muestra === filtroTipo);
      if (!tieneTipo) return false;
    }

    // Filtro por estado de pago
    if (filtroPago !== 'todos') {
      const esPagado = filtroPago === 'pagado';
      if (muestra.pagado !== esPagado) return false;
    }

    // Buscar en tipos de muestras
    const tiposString = muestra.tipos_muestras
      ? muestra.tipos_muestras.map((t: any) => t.tipo_muestra).join(' ')
      : '';

    const matchesSearch =
      muestra.paciente_nombre.toLowerCase().includes(query) ||
      muestra.cedula.includes(query) ||
      tiposString.toLowerCase().includes(query) ||
      muestra.id.toString().includes(query);

    const fechaMuestra = new Date(muestra.fecha_toma);
    // Ajuste de fechas para incluir el día completo
    const fInicio = fechaInicio ? new Date(fechaInicio) : null;
    if (fInicio) fInicio.setHours(0, 0, 0, 0);

    const fFin = fechaFin ? new Date(fechaFin) : null;
    if (fFin) fFin.setHours(23, 59, 59, 999);

    const matchesFechaInicio = !fInicio || fechaMuestra >= fInicio;
    const matchesFechaFin = !fFin || fechaMuestra <= fFin;

    return matchesSearch && matchesFechaInicio && matchesFechaFin;
  });

  const totalPages = Math.ceil(muestrasFiltradas.length / itemsPerPage);
  const paginatedMuestras = muestrasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const eliminarMuestra = async (id: number) => {
    const result = await showConfirm(
      '¿Eliminar muestra?',
      '¿Estás seguro de que deseas eliminar esta muestra? Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!result.isConfirmed) return;

    try {
      setCargandoEliminar(id);
      await api.delete(`/muestras/${id}`);
      setMuestras(muestras.filter((m) => m.id !== id));
      showSuccess('Muestra eliminada', 'La muestra ha sido eliminada correctamente');
    } catch (err: any) {
      showError('Error al eliminar', err.response?.data?.error || 'No se pudo eliminar la muestra');
    } finally {
      setCargandoEliminar(null);
    }
  };

  const togglePagado = async (id: number, pagadoActual: boolean) => {
    try {
      setCargandoPago(id);
      await api.put(`/muestras/${id}`, { pagado: !pagadoActual });

      // Actualizar el estado local
      setMuestras(muestras.map(m =>
        m.id === id ? { ...m, pagado: !pagadoActual } : m
      ));

      showSuccess(
        pagadoActual ? 'Marcada como NO pagada' : 'Marcada como PAGADA',
        `El estado de pago de la muestra ha sido actualizado`
      );
    } catch (err: any) {
      showError('Error', err.response?.data?.error || 'No se pudo actualizar el estado de pago');
    } finally {
      setCargandoPago(null);
    }
  };

  const getBadgeColor = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'sangre': return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'orina': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'heces': return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex flex-col gap-6 max-w-[1900px] mx-auto w-full p-4 md:p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Muestras</h1>
            <p className="text-muted-foreground mt-1">
              Registro y control de análisis de laboratorio
            </p>
          </div>
          <Button
            onClick={() => setModalAbierto(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Muestra
          </Button>
        </div>

        {/* Filters & Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Muestras</CardTitle>
            <CardDescription>
              Total registradas: {muestras.length} | Mostrando: {muestrasFiltradas.length}
            </CardDescription>

            {/* Filters Toolbar */}
            <div className="flex flex-col xl:flex-row gap-4 mt-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, cédula o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Type Filter */}
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full xl:w-[180px]">
                  <SelectValue placeholder="Tipo de Muestra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="sangre">Sangre</SelectItem>
                  <SelectItem value="orina">Orina</SelectItem>
                  <SelectItem value="heces">Heces</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Filter */}
              <Select value={filtroPago} onValueChange={setFiltroPago}>
                <SelectTrigger className="w-full xl:w-[180px]">
                  <SelectValue placeholder="Estado de Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <DatePicker
                    date={fechaInicio && !isNaN(Date.parse(fechaInicio)) ? new Date(fechaInicio + 'T00:00:00') : undefined}
                    setDate={(date) => setFechaInicio(date ? format(date, 'yyyy-MM-dd') : '')}
                  />
                </div>
                <div className="relative">
                  <DatePicker
                    date={fechaFin && !isNaN(Date.parse(fechaFin)) ? new Date(fechaFin + 'T00:00:00') : undefined}
                    setDate={(date) => setFechaFin(date ? format(date, 'yyyy-MM-dd') : '')}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> {/* Fallback icon */}
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
              </div>
            ) : paginatedMuestras.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No se encontraron muestras que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Tipos de Muestras</TableHead>
                      <TableHead>Fecha Toma</TableHead>
                      <TableHead>Estado Pago</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMuestras.map((m) => (
                      <TableRow
                        key={m.id}
                        className="cursor-pointer hover:bg-gray-50/80 transition-colors"
                        onClick={() => {
                          setClienteSeleccionado(m);
                          setModalInfoAbierto(true);
                        }}
                      >
                        <TableCell className="font-medium">
                          #{m.id.toString().padStart(5, '0')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{m.paciente_nombre}</span>
                            <span className="text-xs text-muted-foreground">{m.cedula}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {m.tipos_muestras?.length > 0 ? (
                              m.tipos_muestras.map((t: any) => (
                                <Badge
                                  key={t.id}
                                  variant="outline"
                                  className={`capitalize ${getBadgeColor(t.tipo_muestra)}`}
                                >
                                  {t.tipo_muestra}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs italic">Sin especificar</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            {format(new Date(m.fecha_toma), 'dd/MM/yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={m.pagado ? "default" : "outline"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePagado(m.id, m.pagado);
                                  }}
                                  disabled={cargandoPago === m.id}
                                  className={`h-7 px-3 text-xs gap-1.5 rounded-full transition-colors ${m.pagado
                                    ? 'text-white border-[#2E7D5C] shadow-sm'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                                    }`}
                                  style={m.pagado ? { backgroundColor: '#2E7D5C', borderColor: '#2E7D5C', color: 'white' } : {}}
                                >
                                  {cargandoPago === m.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                                  ) : (
                                    <DollarSign className="w-3.5 h-3.5" />
                                  )}
                                  {m.pagado ? 'Pagada' : 'Pendiente'}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{m.pagado ? 'Marcar como Pendiente' : 'Marcar como Pagada'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {/* Ver Detalles */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-brand-600 hover:bg-brand-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMuestraVerId(m.id);
                                      setModalVerAbierto(true);
                                    }}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver Detalles</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Editar */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMuestraSeleccionada(m);
                                      setModalEditarAbierto(true);
                                    }}
                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar Muestra</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Eliminar */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      eliminarMuestra(m.id);
                                    }}
                                    disabled={cargandoEliminar === m.id}
                                    className="h-8 w-8 text-red-600 hover:bg-red-50"
                                  >
                                    {cargandoEliminar === m.id ? (
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Eliminar Muestra</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
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

        {/* Modals */}
        <ModalMuestraAvanzada
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSuccess={() => obtenerMuestras()}
        />

        <ModalEditarMuestra
          isOpen={modalEditarAbierto}
          muestra={muestraSeleccionada}
          onClose={() => setModalEditarAbierto(false)}
          onSuccess={() => {
            obtenerMuestras();
            setModalEditarAbierto(false);
          }}
        />

        <ModalVerMuestra
          isOpen={modalVerAbierto}
          muestraId={muestraVerId}
          onClose={() => setModalVerAbierto(false)}
        />

        <ModalInfoPaciente
          isOpen={modalInfoAbierto}
          onClose={() => setModalInfoAbierto(false)}
          cliente={clienteSeleccionado}
        />
      </div>
    </ProtectedRoute>
  );
}
