'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Minus, Loader2, ArrowRight } from 'lucide-react';

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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface ModalEditarProductoProps {
  isOpen: boolean;
  producto: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarProducto({
  isOpen,
  producto,
  onClose,
  onSuccess,
}: ModalEditarProductoProps) {
  const [cantidadInput, setCantidadInput] = useState('');
  const [accion, setAccion] = useState<'sumar' | 'restar'>('sumar');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCantidadInput('');
      setAccion('sumar');
      setError('');
    }
  }, [isOpen, producto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const cantidadActual = parseInt(producto.cantidad || '0');
      const cantidadCambio = parseInt(cantidadInput);

      if (isNaN(cantidadCambio) || cantidadCambio <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
      }

      let nuevaCantidadTotal = cantidadActual;
      if (accion === 'sumar') {
        nuevaCantidadTotal += cantidadCambio;
      } else {
        nuevaCantidadTotal -= cantidadCambio;
      }

      if (nuevaCantidadTotal < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      await api.put(`/inventario/${producto.id}`, {
        cantidad: nuevaCantidadTotal,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Error al actualizar producto');
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen || !producto) return null;

  const cantidadActual = parseInt(producto.cantidad || '0');
  const cantidadCambio = parseInt(cantidadInput) || 0;
  const nuevaCantidadPreview = accion === 'sumar'
    ? cantidadActual + cantidadCambio
    : cantidadActual - cantidadCambio;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Gestionar Inventario</DialogTitle>
          <DialogDescription>
            {producto.nombre_producto}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Status Card */}
          <div className="bg-slate-50 p-4 rounded-lg border flex justify-between items-center">
            <span className="text-sm text-slate-500 font-medium">Stock Actual</span>
            <span className="text-2xl font-bold text-slate-900">{cantidadActual}</span>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Seleccionar Acción</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={accion === 'sumar' ? 'default' : 'outline'}
                className={cn(
                  "h-auto py-3 flex flex-col gap-1 items-center justify-center",
                  accion === 'sumar' ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-blue-50 hover:text-blue-600 border-dashed"
                )}
                onClick={() => setAccion('sumar')}
              >
                <Plus className="h-6 w-6 mb-1" />
                <span className="font-semibold">Agregar</span>
              </Button>

              <Button
                type="button"
                variant={accion === 'restar' ? 'default' : 'outline'}
                className={cn(
                  "h-auto py-3 flex flex-col gap-1 items-center justify-center",
                  accion === 'restar' ? "bg-red-600 hover:bg-red-700" : "hover:bg-red-50 hover:text-red-600 border-dashed"
                )}
                onClick={() => setAccion('restar')}
              >
                <Minus className="h-6 w-6 mb-1" />
                <span className="font-semibold">Quitar</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cantidad a {accion === 'sumar' ? 'Ingresar' : 'Retirar'}</Label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-muted-foreground">
                {accion === 'sumar' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              </div>
              <Input
                type="number"
                min="1"
                placeholder="0"
                className="pl-9 text-lg font-medium"
                value={cantidadInput}
                onChange={(e) => setCantidadInput(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Preview Calculation */}
          {(cantidadCambio > 0) && (
            <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-md border border-gray-100">
              <span className="text-gray-500">Resultado Previsto:</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 decoration-slice line-through">{cantidadActual}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className={cn(
                  "font-bold text-lg",
                  nuevaCantidadPreview < (producto.cantidad_minima || 5) && "text-orange-600",
                  nuevaCantidadPreview < 0 && "text-red-600",
                  nuevaCantidadPreview >= (producto.cantidad_minima || 5) && "text-green-600"
                )}>
                  {nuevaCantidadPreview}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={cargando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={cargando || cantidadCambio <= 0}
              className={cn(
                accion === 'sumar' ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
              )}
            >
              {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cargando ? 'Actualizando' : 'Confirmar Cambio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}