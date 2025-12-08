'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  Check,
  ChevronsUpDown,
  AlertCircle,
  Beaker,
  TestTube
} from 'lucide-react';
import api from '@/app/lib/api';
import FormSangre from './FormSangre';
import FormOrina from './FormOrina';
import FormHeces from './FormHeces';
import { cn } from "@/lib/utils"

// Shadcn UI Components
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

  // Form State
  const [pacienteId, setPacienteId] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any>(null);
  const [openCombobox, setOpenCombobox] = useState(false);

  const [observacionesGenerales, setObservacionesGenerales] = useState('');
  const [pagado, setPagado] = useState(false);
  const [detalles, setDetalles] = useState<DetalleMuestra[]>([]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Info General, 2: Detalles Exámenes

  useEffect(() => {
    if (isOpen) {
      obtenerPacientes();
      obtenerInventario();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setPacienteId('');
    setPacienteSeleccionado(null);
    setObservacionesGenerales('');
    setPagado(false);
    setDetalles([]);
    setError('');
    setStep(1);
  };

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



  const toggleTipoMuestra = (tipo: string) => {
    const existe = detalles.some(d => d.tipo_muestra === tipo);
    if (existe) {
      setDetalles(detalles.filter(d => d.tipo_muestra !== tipo));
    } else {
      setDetalles([
        ...detalles,
        {
          tipo_muestra: tipo,
          resultados: {},
          observaciones: '',
          productos: [],
        },
      ]);
    }
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

    if (producto.cantidad <= 0) {
      setError(`El producto ${producto.nombre_producto} no tiene stock disponible.`);
      return;
    }

    const nuevosDetalles = [...detalles];
    const yaExiste = nuevosDetalles[detalleIndex].productos.find(
      p => p.producto_id === parseInt(productoId)
    );

    if (yaExiste) {
      setError(`El producto ${producto.nombre_producto} ya está en la lista.`);
      return;
    }

    nuevosDetalles[detalleIndex].productos.push({
      producto_id: parseInt(productoId),
      nombre: producto.nombre_producto,
      cantidad: 1,
      stock: producto.cantidad,
    });

    setError(''); // Clear previous errors
    setDetalles(nuevosDetalles);
  };

  const eliminarProducto = (detalleIndex: number, productoIndex: number) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[detalleIndex].productos.splice(productoIndex, 1);
    setDetalles(nuevosDetalles);
    setError('');
  };

  const actualizarCantidadProducto = (detalleIndex: number, productoIndex: number, cantidad: number) => {
    const nuevosDetalles = [...detalles];
    const producto = nuevosDetalles[detalleIndex].productos[productoIndex];

    if (cantidad < 1) cantidad = 1;

    if (cantidad > producto.stock) {
      setError(`Stock insuficiente para ${producto.nombre}. Máximo disponible: ${producto.stock}`);
      cantidad = producto.stock;
    } else {
      setError('');
    }

    nuevosDetalles[detalleIndex].productos[productoIndex].cantidad = cantidad;
    setDetalles(nuevosDetalles);
  };

  const handleSubmit = async () => {
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
      console.error('❌ Error al crear muestra:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error desconocido al crear muestra';
      setError(`${errorMsg} (Código: ${err.response?.status})`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden sm:h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Registrar Nueva Muestra</DialogTitle>
          <DialogDescription>
            Paso {step} de 2:info {step === 1 ? 'Selección de Paciente y Tipos' : 'Detalles de Análisis'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 pb-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm border border-red-200">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                {/* Selección de Paciente */}
                <div className="space-y-2">
                  <Label>Seleccionar Paciente *</Label>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between"
                      >
                        {pacienteSeleccionado
                          ? `${pacienteSeleccionado.nombre} (${pacienteSeleccionado.cedula})`
                          : "Buscar paciente por nombre o cédula..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar paciente..." />
                        <CommandList>
                          <CommandEmpty>No se encontró el paciente.</CommandEmpty>
                          <CommandGroup>
                            {pacientes.map((paciente) => (
                              <CommandItem
                                key={paciente.id}
                                value={`${paciente.nombre} ${paciente.cedula}`}
                                onSelect={() => {
                                  setPacienteId(paciente.id.toString());
                                  setPacienteSeleccionado(paciente);
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    pacienteId === paciente.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{paciente.nombre}</span>
                                  <span className="text-xs text-muted-foreground">{paciente.cedula}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Selección de Tipos de Muestra */}
                <div className="space-y-3">
                  <Label>Tipos de Análisis a Realizar *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['sangre', 'orina', 'heces'].map((tipo) => {
                      const isSelected = detalles.some(d => d.tipo_muestra === tipo);
                      return (
                        <div
                          key={tipo}
                          onClick={() => toggleTipoMuestra(tipo)}
                          className={cn(
                            "cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center gap-2 transition-all hover:border-brand-300",
                            isSelected
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-gray-200 bg-white text-gray-600"
                          )}
                        >
                          {tipo === 'sangre' && <TestTube className="w-8 h-8" />}
                          {tipo === 'orina' && <Beaker className="w-8 h-8" />}
                          {tipo === 'heces' && <Package className="w-8 h-8" />}
                          <span className="font-semibold capitalize">{tipo}</span>
                          {isSelected && <Check className="w-4 h-4 mt-1 text-brand-600" />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Observaciones Generales */}
                <div className="space-y-2">
                  <Label>Observaciones Generales</Label>
                  <Textarea
                    placeholder="Notas importantes sobre la toma de muestra..."
                    value={observacionesGenerales}
                    onChange={(e) => setObservacionesGenerales(e.target.value)}
                  />
                </div>

                {/* Pago */}
                <div className="flex items-center space-x-2 border p-3 rounded-lg bg-gray-50">
                  <Checkbox
                    id="pagado"
                    checked={pagado}
                    onCheckedChange={(checked) => setPagado(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="pagado"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Marcar como Pagada
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Si se marca, el resultado será visible inmediatamente para el paciente.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-8">
                {detalles.map((detalle, index) => (
                  <div key={detalle.tipo_muestra} className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
                    <div className="flex items-center gap-3 border-b pb-3">
                      <Badge className="text-base px-3 py-1 capitalize bg-brand-600">
                        {detalle.tipo_muestra}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex-1">Complete los detalles técnicos</span>
                    </div>

                    {/* Sub-Formularios Específicos */}
                    <div className="pl-2 border-l-2 border-gray-100">
                      {detalle.tipo_muestra === 'sangre' && (
                        <FormSangre
                          resultados={detalle.resultados}
                          onChange={(field, value) => actualizarResultados(index, field, value)}
                        />
                      )}
                      {detalle.tipo_muestra === 'orina' && (
                        <FormOrina
                          resultados={detalle.resultados}
                          onChange={(field, value) => actualizarResultados(index, field, value)}
                        />
                      )}
                      {detalle.tipo_muestra === 'heces' && (
                        <FormHeces
                          resultados={detalle.resultados}
                          onChange={(field, value) => actualizarResultados(index, field, value)}
                        />
                      )}
                    </div>

                    {/* Selección de Productos */}
                    <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                      <Label className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> Materiales Utilizados
                      </Label>

                      <div className="flex gap-2">
                        <Select onValueChange={(val) => agregarProducto(index, val)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Agregar material..." />
                          </SelectTrigger>
                          <SelectContent>
                            {inventario.filter(p => p.cantidad > 0).map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nombre_producto} (Stock: {p.cantidad})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {detalle.productos.length > 0 ? (
                        <div className="space-y-2 mt-2">
                          {detalle.productos.map((prod, pIndex) => (
                            <div key={prod.producto_id} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                              <span className="font-medium">{prod.nombre}</span>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Cant:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max={prod.stock}
                                    value={prod.cantidad}
                                    onChange={(e) => actualizarCantidadProducto(index, pIndex, parseInt(e.target.value) || 1)}
                                    className="w-12 border rounded px-1 text-center"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => eliminarProducto(index, pIndex)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No se han registrado materiales.</p>
                      )}
                    </div>

                    {/* Observaciones Específicas */}
                    <div className="space-y-2">
                      <Label>Observaciones de {detalle.tipo_muestra}</Label>
                      <Textarea
                        rows={2}
                        placeholder={`Notas específicas para ${detalle.tipo_muestra}...`}
                        value={detalle.observaciones}
                        onChange={(e) => actualizarObservaciones(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Atrás
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>

            {step === 1 ? (
              <Button
                className="bg-brand-600 hover:bg-brand-700"
                onClick={() => {
                  if (!pacienteId) { setError('Seleccione un paciente'); return; }
                  if (detalles.length === 0) { setError('Seleccione al menos un tipo de examen'); return; }
                  setError('');
                  setStep(2);
                }}
              >
                Siguiente: Detalles
              </Button>
            ) : (
              <Button
                className="bg-brand-600 hover:bg-brand-700 min-w-[150px]"
                onClick={handleSubmit}
                disabled={cargando}
              >
                {cargando ? 'Guardando...' : 'Finalizar y Guardar'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
