'use client';

import { useState } from 'react';
import api from '../lib/api';
import { Loader2, Package } from 'lucide-react';

// ShadCN UI
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ModalAgregarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalAgregarProducto({
  isOpen,
  onClose,
  onSuccess,
}: ModalAgregarProductoProps) {
  const [formData, setFormData] = useState({
    nombre_producto: '',
    tipo: '',
    cantidad: '',
    cantidad_minima: '5',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre_producto.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }

    if (!formData.tipo.trim()) {
      setError('El tipo es requerido');
      return;
    }

    if (!formData.cantidad || parseInt(formData.cantidad) < 0) {
      setError('La cantidad debe ser un número válido');
      return;
    }

    setCargando(true);

    try {
      await api.post('/inventario', {
        nombre_producto: formData.nombre_producto,
        tipo: formData.tipo,
        cantidad: parseInt(formData.cantidad),
        cantidad_minima: parseInt(formData.cantidad_minima) || 5,
      });

      setFormData({
        nombre_producto: '',
        tipo: '',
        cantidad: '',
        cantidad_minima: '5',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al agregar producto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          <DialogDescription>
            Registra un nuevo material o equipo en el inventario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Producto</Label>
            <div className="relative">
              <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="nombre"
                value={formData.nombre_producto}
                onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })}
                placeholder="Ej. Jeringas 5ml"
                className="pl-8"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="material">Material de laboratorio</SelectItem>
                <SelectItem value="reactivo">Reactivo químico</SelectItem>
                <SelectItem value="equipo">Equipo</SelectItem>
                <SelectItem value="consumible">Consumible</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad Inicial</Label>
              <Input
                id="cantidad"
                type="number"
                min="0"
                placeholder="0"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimo">Stock Mínimo</Label>
              <Input
                id="minimo"
                type="number"
                min="1"
                placeholder="5"
                value={formData.cantidad_minima}
                onChange={(e) => setFormData({ ...formData, cantidad_minima: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando} className="bg-brand-500 hover:bg-brand-600">
              {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cargando ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}