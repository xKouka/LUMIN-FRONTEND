'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface ModalEditarPacienteProps {
  isOpen: boolean;
  paciente: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarPaciente({
  isOpen,
  paciente,
  onClose,
  onSuccess,
}: ModalEditarPacienteProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    fecha_nacimiento: '',
    genero: '',
    telefono: '',
    direccion: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (paciente && isOpen) {
      setFormData({
        nombre: paciente.nombre || '',
        apellido: paciente.apellido || '',
        cedula: paciente.cedula || paciente.rut || '',
        fecha_nacimiento: paciente.fecha_nacimiento || '',
        genero: paciente.genero || '',
        telefono: paciente.telefono || '',
        direccion: paciente.direccion || '',
      });
    }
  }, [paciente, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que el nombre solo contenga letras, espacios y Ñ
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (formData.nombre && !nombreRegex.test(formData.nombre)) {
      setError('El nombre solo puede contener letras y espacios');
      return;
    }

    // Validar que el apellido solo contenga letras, espacios y Ñ
    const apellidoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (formData.apellido && !apellidoRegex.test(formData.apellido)) {
      setError('El apellido solo puede contener letras y espacios');
      return;
    }

    // Validar género si está presente
    if (formData.genero && !['masculino', 'femenino'].includes(formData.genero)) {
      setError('El género debe ser masculino o femenino');
      return;
    }

    // Validar teléfono si está presente
    if (formData.telefono && !/^[0-9+\s-]+$/.test(formData.telefono)) {
      setError('El teléfono solo puede contener números, espacios, + y -');
      return;
    }

    setCargando(true);

    try {
      await api.put(`/pacientes/${paciente.id}`, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        rut: formData.cedula,
        fecha_nacimiento: formData.fecha_nacimiento,
        genero: formData.genero,
        telefono: formData.telefono,
        direccion: formData.direccion,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar paciente');
    } finally {
      setCargando(false);
    }
  };

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apellido" className="text-right">
                Apellido *
              </Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) =>
                  setFormData({ ...formData, apellido: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cedula" className="text-right">
                Cédula *
              </Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) =>
                  setFormData({ ...formData, cedula: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fecha_nacimiento" className="text-right">
                Fecha Nac. *
              </Label>
              <div className="col-span-3">
                <DatePicker
                  date={
                    formData.fecha_nacimiento && !isNaN(Date.parse(formData.fecha_nacimiento))
                      ? new Date(formData.fecha_nacimiento + 'T00:00:00')
                      : undefined
                  }
                  setDate={(date) =>
                    setFormData({
                      ...formData,
                      fecha_nacimiento: date ? format(date, 'yyyy-MM-dd') : '',
                    })
                  }
                />
                {formData.fecha_nacimiento && (
                  <p className="text-xs text-gray-500 mt-1">
                    Edad: {calcularEdad(formData.fecha_nacimiento)} años
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genero" className="text-right">
                Género
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.genero}
                  onValueChange={(value) =>
                    setFormData({ ...formData, genero: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">
                Teléfono
              </Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direccion" className="text-right">
                Dirección
              </Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}