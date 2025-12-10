'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, AlertCircle, Save, Loader2, TestTube, Beaker, Package } from 'lucide-react';
import FormSangre from './FormSangre';
import FormOrina from './FormOrina';
import FormHeces from './FormHeces';

// ShadCN UI
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ModalEditarMuestraProps {
  isOpen: boolean;
  muestra: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalEditarMuestra({
  isOpen,
  muestra,
  onClose,
  onSuccess,
}: ModalEditarMuestraProps) {
  const [formData, setFormData] = useState({
    observaciones: '',
    pagado: false,
  });
  const [detalles, setDetalles] = useState<any[]>([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar detalles completos cuando se abre el modal
  useEffect(() => {
    if (muestra && isOpen) {
      setFormData({
        observaciones: muestra.observaciones || '',
        pagado: muestra.pagado || false,
      });
      cargarDetalles(muestra.id);
    }
  }, [muestra, isOpen]);

  const cargarDetalles = async (id: number) => {
    try {
      setLoadingDetalles(true);
      const response = await api.get(`/muestras/${id}`);
      setDetalles(response.data.detalles || []);
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      setError('No se pudieron cargar los detalles de la muestra.');
    } finally {
      setLoadingDetalles(false);
    }
  };

  const handleDetalleChange = (index: number, field: string, value: any) => {
    const newDetalles = [...detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setDetalles(newDetalles);
  };

  const handleResultadosChange = (index: number, nuevosResultados: any) => {
    const newDetalles = [...detalles];
    newDetalles[index] = {
      ...newDetalles[index],
      resultados: { ...newDetalles[index].resultados, ...nuevosResultados }
    };
    setDetalles(newDetalles);
  };

  const handleSubmit = async () => {
    setError('');
    setCargando(true);

    try {
      const payload = {
        ...formData,
        detalles: detalles
      };

      await api.put(`/muestras/${muestra.id}`, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error al actualizar:', err);
      setError(err.response?.data?.error || 'Error al actualizar muestra');
    } finally {
      setCargando(false);
    }
  };

  if (!muestra) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden sm:h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">Editar Muestra #{muestra.id}</DialogTitle>
          <DialogDescription>
            Paciente: {muestra.paciente_nombre}
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

            {/* Pagado */}
            <div className="flex items-center space-x-2 border p-3 rounded-lg bg-gray-50 mb-4">
              <input
                type="checkbox"
                id="pagado"
                checked={formData.pagado}
                onChange={(e) => setFormData({ ...formData, pagado: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="pagado"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Marcar como Pagada
                </Label>
                <p className="text-xs text-muted-foreground">
                  Si se marca, el resultado será visible inmediatamente para el paciente.
                </p>
              </div>
            </div>

            {/* Observaciones Generales */}
            <div className="space-y-2">
              <Label>Observaciones Generales</Label>
              <Textarea
                placeholder="Notas generales..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados por Tipo de Muestra</h3>

              {loadingDetalles ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
                </div>
              ) : detalles.length === 0 ? (
                <p className="text-gray-500 italic">No hay detalles asociados a esta muestra.</p>
              ) : (
                <div className="space-y-8">
                  {detalles.map((detalle, index) => (
                    <div key={detalle.id || index} className="border rounded-xl p-5 bg-white shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b pb-3">
                        <Badge className={cn("text-base px-3 py-1 capitalize",
                          detalle.tipo_muestra === 'sangre' ? 'bg-red-600 hover:bg-red-700' :
                            detalle.tipo_muestra === 'orina' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-amber-600 hover:bg-amber-700'
                        )}>
                          {detalle.tipo_muestra}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex-1">Editar resultados técnicos</span>
                      </div>

                      {/* Renderizar formulario específico según tipo */}
                      <div className="pl-2 border-l-2 border-gray-100">
                        {detalle.tipo_muestra === 'sangre' && (
                          <FormSangre
                            resultados={detalle.resultados || {}}
                            onChange={(field, value) => handleResultadosChange(index, { [field]: value })}
                          />
                        )}
                        {detalle.tipo_muestra === 'orina' && (
                          <FormOrina
                            resultados={detalle.resultados || {}}
                            onChange={(field, value) => handleResultadosChange(index, { [field]: value })}
                          />
                        )}
                        {detalle.tipo_muestra === 'heces' && (
                          <FormHeces
                            resultados={detalle.resultados || {}}
                            onChange={(field, value) => handleResultadosChange(index, { [field]: value })}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Observaciones de {detalle.tipo_muestra}</Label>
                        <Textarea
                          rows={2}
                          placeholder={`Observaciones específicas de ${detalle.tipo_muestra}...`}
                          value={detalle.observaciones || ''}
                          onChange={(e) => handleDetalleChange(index, 'observaciones', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-20">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={cargando || loadingDetalles}
            className="bg-brand-500 hover:bg-brand-600 min-w-[140px]"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}