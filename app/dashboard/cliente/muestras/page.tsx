'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import api from '@/app/lib/api';
import { Download, Eye, AlertCircle, FileText, Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function MuestrasClientePage() {
  const [muestras, setMuestras] = useState<any[]>([]);
  const [muestrasFiltradas, setMuestrasFiltradas] = useState<any[]>([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('todas');
  const [fechaEspecifica, setFechaEspecifica] = useState<Date | undefined>(undefined);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any>(null);

  useEffect(() => {
    obtenerMuestras();
  }, []);

  useEffect(() => {
    filtrarMuestras();
  }, [filtroTipo, filtroFecha, fechaEspecifica, muestras]);

  const obtenerMuestras = async () => {
    try {
      setCargando(true);
      const response = await api.get('/muestras/mis-muestras');
      setMuestras(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar muestras');
    } finally {
      setCargando(false);
    }
  };

  const filtrarMuestras = () => {
    let filtradas = [...muestras];

    // Filter by exam type
    if (filtroTipo !== 'todos') {
      filtradas = filtradas.filter(m =>
        m.tipos_muestras?.some((t: any) => t.tipo_muestra === filtroTipo)
      );
    }

    // Filter by specific date (takes priority)
    if (fechaEspecifica) {
      filtradas = filtradas.filter(m => {
        const fechaMuestra = new Date(m.fecha_toma);
        const fechaSeleccionada = new Date(fechaEspecifica);
        return fechaMuestra.toDateString() === fechaSeleccionada.toDateString();
      });
    } else if (filtroFecha !== 'todas') {
      // Filter by date range only if no specific date is selected
      const hoy = new Date();
      filtradas = filtradas.filter(m => {
        const fechaMuestra = new Date(m.fecha_toma);
        const diffTime = hoy.getTime() - fechaMuestra.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filtroFecha) {
          case 'ultima_semana':
            return diffDays <= 7;
          case 'ultimo_mes':
            return diffDays <= 30;
          case 'ultimos_3_meses':
            return diffDays <= 90;
          case 'ultimo_año':
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    setMuestrasFiltradas(filtradas);
  };

  const handleVerMuestra = async (muestra: any) => {
    try {
      const response = await api.get(`/muestras/${muestra.id}`);
      setMuestraSeleccionada(response.data);
      setModalAbierto(true);
    } catch (err: any) {
      console.error('Error al cargar muestra:', err);
    }
  };

  const handleDescargarPDF = async (muestraId: number) => {
    try {
      const response = await api.get(`/muestras/${muestraId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `muestra_${muestraId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error al descargar PDF:', err);
    }
  };

  const tiposExamen = [
    { value: 'todos', label: 'Todos los tipos' },
    { value: 'sangre', label: 'Sangre' },
    { value: 'orina', label: 'Orina' },
    { value: 'heces', label: 'Heces' },
  ];

  const rangosFecha = [
    { value: 'todas', label: 'Todas las fechas' },
    { value: 'ultima_semana', label: 'Última semana' },
    { value: 'ultimo_mes', label: 'Último mes' },
    { value: 'ultimos_3_meses', label: 'Últimos 3 meses' },
    { value: 'ultimo_año', label: 'Último año' },
  ];

  return (
    <ProtectedRoute requiredRole="cliente">
      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1400px] mx-auto w-full">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mis Muestras</h1>
          <p className="text-muted-foreground mt-1">
            Historial completo de tus análisis de laboratorio · Total: {muestras.length}
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filtro-tipo" className="text-sm font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Tipo de Examen
            </Label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger id="filtro-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposExamen.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-fecha" className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Rango de Fecha
            </Label>
            <Select
              value={filtroFecha}
              onValueChange={(value) => {
                setFiltroFecha(value);
                if (value !== 'todas') setFechaEspecifica(undefined);
              }}
              disabled={!!fechaEspecifica}
            >
              <SelectTrigger id="filtro-fecha">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rangosFecha.map((rango) => (
                  <SelectItem key={rango.value} value={rango.value}>
                    {rango.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Fecha Específica
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!fechaEspecifica && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaEspecifica ? fechaEspecifica.toLocaleDateString('es-ES') : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaEspecifica}
                  onSelect={(date) => {
                    setFechaEspecifica(date);
                    if (date) setFiltroFecha('todas');
                  }}
                  initialFocus
                />
                {fechaEspecifica && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setFechaEspecifica(undefined)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar fecha
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
          </div>
        ) : muestrasFiltradas.length > 0 ? (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Resultados</CardTitle>
              <CardDescription>
                Mostrando {muestrasFiltradas.length} {muestrasFiltradas.length === 1 ? 'examen' : 'exámenes'}
                {filtroTipo !== 'todos' && ` · Tipo: ${tiposExamen.find(t => t.value === filtroTipo)?.label}`}
                {fechaEspecifica && ` · Fecha: ${fechaEspecifica.toLocaleDateString('es-ES')}`}
                {!fechaEspecifica && filtroFecha !== 'todas' && ` · ${rangosFecha.find(r => r.value === filtroFecha)?.label}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-3 bg-gray-50 p-3 text-sm font-medium text-gray-500 border-b">
                  <div>Tipo de Examen</div>
                  <div>Fecha</div>
                  <div className="text-right">Acciones</div>
                </div>
                {muestrasFiltradas.map((muestra) => (
                  <div key={muestra.id} className="grid grid-cols-3 p-4 items-center gap-4 border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-wrap gap-1">
                      {muestra.tipos_muestras && muestra.tipos_muestras.length > 0 ? (
                        muestra.tipos_muestras.map((tipo: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="capitalize bg-white">
                            {tipo.tipo_muestra}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">Sin especificar</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {new Date(muestra.fecha_toma).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(muestra.fecha_toma).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerMuestra(muestra)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDescargarPDF(muestra.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">
                {filtroTipo === 'todos' && filtroFecha === 'todas' && !fechaEspecifica
                  ? 'No hay muestras registradas'
                  : 'No hay muestras que coincidan con los filtros seleccionados'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal Ver Muestra */}
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle de Resultados</DialogTitle>
              <DialogDescription>
                Resultados completos para la muestra del {muestraSeleccionada && new Date(muestraSeleccionada.fecha_toma).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            {muestraSeleccionada && (
              <div className="space-y-6">
                {/* Info Header */}
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Paciente</h4>
                    <p className="font-medium">{muestraSeleccionada.paciente_nombre}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">ID Muestra</h4>
                    <p className="font-mono text-sm">#{muestraSeleccionada.id}</p>
                  </div>
                  {muestraSeleccionada.observaciones && (
                    <div className="col-span-2 pt-2 border-t border-dashed border-gray-200">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Observaciones Generales</h4>
                      <p className="text-sm italic text-gray-700">{muestraSeleccionada.observaciones}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Results List */}
                <div className="space-y-4">
                  {muestraSeleccionada.detalles?.map((detalle: any, idx: number) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-semibold capitalize flex items-center gap-2">
                          {detalle.tipo_muestra === 'sangre' && '🩸'}
                          {detalle.tipo_muestra === 'orina' && '💧'}
                          {detalle.tipo_muestra === 'heces' && '🧻'}
                          {detalle.tipo_muestra}
                        </h4>
                      </div>
                      <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {detalle.resultados && Object.entries(detalle.resultados).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-slate-50 p-3 rounded border border-slate-100">
                            <p className="text-xs text-muted-foreground uppercase mb-1 font-medium tracking-wide">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {value !== null && value !== '' ? String(value) : '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                      {detalle.observaciones && (
                        <div className="px-4 py-3 bg-yellow-50/50 text-sm text-yellow-800 border-t border-yellow-100">
                          <span className="font-semibold mr-1">Nota:</span> {detalle.observaciones}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
              <Button onClick={() => handleDescargarPDF(muestraSeleccionada.id)}>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}