'use client';

import { useState } from 'react';
import api from '../lib/api';
import { X, AlertCircle, Eye, EyeOff, Copy, Check, CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ModalAgregarPacienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalAgregarPaciente({
  isOpen,
  onClose,
  onSuccess,
}: ModalAgregarPacienteProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    fecha_nacimiento: undefined as Date | undefined,
    genero: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exitoModal, setExitoModal] = useState(false);
  const [datosCreados, setDatosCreados] = useState<any>(null);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.apellido.trim()) {
      setError('El apellido es requerido');
      return;
    }

    if (!formData.cedula.trim()) {
      setError('La cédula de identidad es requerida');
      return;
    }

    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }

    if (!formData.fecha_nacimiento) {
      setError('La fecha de nacimiento es requerida');
      return;
    }

    setCargando(true);

    try {
      const response = await api.post('/pacientes', {
        ...formData,
        fecha_nacimiento: formData.fecha_nacimiento ? format(formData.fecha_nacimiento, 'yyyy-MM-dd') : null,
      });

      setDatosCreados({
        paciente: response.data.paciente,
        usuario: response.data.usuario,
      });
      setExitoModal(true);

      setFormData({
        nombre: '',
        apellido: '',
        cedula: '',
        email: '',
        fecha_nacimiento: undefined,
        genero: '',
        telefono: '',
        direccion: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar paciente');
    } finally {
      setCargando(false);
    }
  };

  const handleCopiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleCerrar = () => {
    if (exitoModal) {
      setExitoModal(false);
      onSuccess();
      onClose();
    } else {
      onClose();
    }
  };

  const calcularEdad = (fecha: Date | undefined) => {
    if (!fecha) return '';
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  };

  if (exitoModal) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && handleCerrar()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <span>¡Paciente Creado!</span>
            </DialogTitle>
            <DialogDescription className="text-center">
              El paciente y su usuario han sido registrados exitosamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Credenciales de Usuario */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                🔐 Credenciales de Acceso
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <Label className="text-xs text-gray-600">Usuario (Cédula)</Label>
                  <div className="flex gap-2">
                    <div className="bg-white px-3 py-2 rounded border flex-1 font-mono text-sm">
                      {datosCreados?.usuario?.usuario}
                    </div>
                    <Button size="icon" variant="outline" onClick={() => handleCopiar(datosCreados?.usuario?.usuario)}>
                      {copiado ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Contraseña</Label>
                  <div className="flex gap-2">
                    <div className="bg-white px-3 py-2 rounded border flex-1 font-mono text-sm flex justify-between items-center">
                      <span>
                        {mostrarContraseña ? datosCreados?.usuario?.contraseña : '••••••••'}
                      </span>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setMostrarContraseña(!mostrarContraseña)}>
                      {mostrarContraseña ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => handleCopiar(datosCreados?.usuario?.contraseña)}>
                      {copiado ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-xs text-yellow-800">
                ⚠️ Comparte estas credenciales con el paciente inmediatamente.
              </p>
            </div>

            <Button onClick={handleCerrar} className="w-full bg-green-600 hover:bg-green-700">
              Entendido, cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Paciente</DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo paciente en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Juan"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido *</Label>
              <Input
                id="apellido"
                placeholder="Pérez"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula de Identidad *</Label>
              <Input
                id="cedula"
                placeholder="12345678"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Fecha de Nacimiento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !formData.fecha_nacimiento && "text-muted-foreground"
                    )}
                  >
                    {formData.fecha_nacimiento ? (
                      format(formData.fecha_nacimiento, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.fecha_nacimiento}
                    onSelect={(date) => setFormData({ ...formData, fecha_nacimiento: date })}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1920}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              {formData.fecha_nacimiento && (
                <p className="text-xs text-muted-foreground">
                  Edad calculada: {calcularEdad(formData.fecha_nacimiento)} años
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Género</Label>
              <Select
                value={formData.genero}
                onValueChange={(value) => setFormData({ ...formData, genero: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="+56 9 1234 5678"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                placeholder="Av. Principal 123"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando} className="bg-brand-500 hover:bg-brand-700">
              {cargando ? 'Guardando...' : 'Guardar Paciente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}