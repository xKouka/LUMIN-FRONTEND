'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Pagination from '@/app/components/Pagination';
import ModalAgregarPaciente from '@/app/components/ModalAgregarPaciente';
import ModalEditarPaciente from '@/app/components/ModalEditarPaciente';
import api from '@/app/lib/api';
import { Plus, Search, Trash2, Edit2, FileText, User } from 'lucide-react';
import { showConfirm, showError, showSuccess } from '@/app/utils/sweetalert';

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

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [generoFilter, setGeneroFilter] = useState('todos');
  const [edadFilter, setEdadFilter] = useState('todos');

  // Modal states
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [cargandoEliminar, setCargandoEliminar] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    obtenerPacientes();
  }, []);

  const obtenerPacientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pacientes');
      setPacientes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const filtrarPorEdad = (edad: number, rango: string) => {
    switch (rango) {
      case '0-18': return edad <= 18;
      case '19-30': return edad > 18 && edad <= 30;
      case '31-50': return edad > 30 && edad <= 50;
      case '51-65': return edad > 50 && edad <= 65;
      case '65+': return edad > 65;
      default: return true;
    }
  };

  // Lógica de filtrado combinada
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const edad = calcularEdad(paciente.fecha_nacimiento);
    const query = searchQuery.toLowerCase();

    // Filtro Texto
    const matchText =
      paciente.nombre.toLowerCase().includes(query) ||
      (paciente.cedula && paciente.cedula.toLowerCase().includes(query)) ||
      (paciente.rut && paciente.rut.toLowerCase().includes(query)) ||
      (paciente.telefono && paciente.telefono.toLowerCase().includes(query));

    // Filtro Género
    const matchGenero = generoFilter === 'todos' || paciente.genero?.toLowerCase() === generoFilter;

    // Filtro Edad
    const matchEdad = edadFilter === 'todos' || filtrarPorEdad(edad, edadFilter);

    return matchText && matchGenero && matchEdad;
  });

  // Paginación
  const totalPages = Math.ceil(pacientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPacientes = pacientesFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleEditar = (paciente: any) => {
    setPacienteSeleccionado(paciente);
    setModalEditarAbierto(true);
  };

  const handleEliminar = async (id: number) => {
    const result = await showConfirm(
      '¿Eliminar paciente?',
      '¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!result.isConfirmed) return;

    try {
      setCargandoEliminar(id);
      await api.delete(`/pacientes/${id}`);
      obtenerPacientes();
      showSuccess('Paciente eliminado', 'El paciente ha sido eliminado correctamente');
    } catch (err: any) {
      showError('Error al eliminar', err.response?.data?.error || 'No se pudo eliminar el paciente');
    } finally {
      setCargandoEliminar(null);
    }
  };

  const getGeneroBadgeColor = (genero: string) => {
    switch (genero?.toLowerCase()) {
      case 'masculino': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'femenino': return 'bg-pink-100 text-pink-700 hover:bg-pink-200';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex flex-col gap-6 max-w-[1900px] mx-auto w-full p-4 md:p-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Pacientes</h1>
            <p className="text-muted-foreground mt-1">
              Administra la base de datos de pacientes de la clínica
            </p>
          </div>
          <Button
            onClick={() => setModalAgregarAbierto(true)}
            className="bg-brand-500 hover:bg-brand-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Paciente
          </Button>
        </div>

        {/* Filters & Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Pacientes</CardTitle>
            <CardDescription>
              Total registrados: {pacientes.length} | Mostrando: {pacientesFiltrados.length}
            </CardDescription>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, RUT o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={generoFilter} onValueChange={setGeneroFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los géneros</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
              <Select value={edadFilter} onValueChange={setEdadFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Rango de Edad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las edades</SelectItem>
                  <SelectItem value="0-18">0 - 18 años</SelectItem>
                  <SelectItem value="19-30">19 - 30 años</SelectItem>
                  <SelectItem value="31-50">31 - 50 años</SelectItem>
                  <SelectItem value="51-65">51 - 65 años</SelectItem>
                  <SelectItem value="65+">Más de 65</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
              </div>
            ) : paginatedPacientes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No se encontraron pacientes con los filtros seleccionados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cédula / RUT</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Género</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPacientes.map((paciente) => (
                      <TableRow key={paciente.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{paciente.nombre}</span>
                            <span className="text-xs text-muted-foreground md:hidden">
                              {new Date(paciente.fecha_nacimiento).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{paciente.cedula || paciente.rut || '-'}</TableCell>
                        <TableCell>{calcularEdad(paciente.fecha_nacimiento)} años</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getGeneroBadgeColor(paciente.genero)}>
                            {paciente.genero || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{paciente.telefono || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditar(paciente)}
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar Paciente</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEliminar(paciente.id)}
                                    disabled={cargandoEliminar === paciente.id}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Eliminar Paciente</p>
                                </TooltipContent>
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
        <ModalAgregarPaciente
          isOpen={modalAgregarAbierto}
          onClose={() => setModalAgregarAbierto(false)}
          onSuccess={() => obtenerPacientes()}
        />

        <ModalEditarPaciente
          isOpen={modalEditarAbierto}
          paciente={pacienteSeleccionado}
          onClose={() => {
            setModalEditarAbierto(false);
            setPacienteSeleccionado(null);
          }}
          onSuccess={() => {
            obtenerPacientes();
            setModalEditarAbierto(false);
            setPacienteSeleccionado(null);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}