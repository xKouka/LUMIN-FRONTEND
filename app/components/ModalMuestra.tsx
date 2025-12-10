'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ModalMuestraProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalMuestra({ isOpen, onClose, onSuccess }: ModalMuestraProps) {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    tipo_examen: 'sangre',
    observaciones: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoPacientes, setCargandoPacientes] = useState(true);

  useEffect(() => {
    if (isOpen) {
      obtenerPacientes();
    }
  }, [isOpen]);

  const obtenerPacientes = async () => {
    try {
      setCargandoPacientes(true);
      const response = await api.get('/pacientes');
      setPacientes(response.data);
    } catch (err: any) {
      setError('Error al cargar pacientes');
    } finally {
      setCargandoPacientes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Transformar el formato para que coincida con lo que espera el backend
      const response = await api.post('/muestras', {
        paciente_id: parseInt(formData.paciente_id),
        observaciones: formData.observaciones || null,
        detalles: [{
          tipo_muestra: formData.tipo_examen,
          resultados: {},
          observaciones: ''
        }]
      });

      // Check if operation was queued (offline mode)
      if (response.data?.queued) {
        console.log('✅ Operation queued for offline sync');
        alert(response.data.message || 'Operación guardada. Se sincronizará cuando recuperes la conexión.');
      }

      setFormData({
        paciente_id: '',
        tipo_examen: 'sangre',
        observaciones: '',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear muestra');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Muestra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Paciente */}
          <div className="space-y-2">
            <Label htmlFor="paciente">Paciente *</Label>
            <Select
              value={formData.paciente_id}
              onValueChange={(value) => setFormData({ ...formData, paciente_id: value })}
              disabled={cargandoPacientes}
            >
              <SelectTrigger>
                <SelectValue placeholder={cargandoPacientes ? 'Cargando...' : 'Selecciona un paciente'} />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nombre} ({p.rut})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Examen */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Examen *</Label>
            <Select
              value={formData.tipo_examen}
              onValueChange={(value) => setFormData({ ...formData, tipo_examen: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de examen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sangre">Análisis de Sangre</SelectItem>
                <SelectItem value="orina">Análisis de Orina</SelectItem>
                <SelectItem value="heces">Análisis de Heces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Notas adicionales..."
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando} className="bg-brand-500 hover:bg-brand-600">
              {cargando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cargando ? 'Guardando...' : 'Registrar Muestra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}