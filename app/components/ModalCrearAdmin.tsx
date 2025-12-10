'use client';

import { useState } from 'react';
import api from '@/app/lib/api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ModalCrearAdminProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalCrearAdmin({ isOpen, onClose, onSuccess }: ModalCrearAdminProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    usuario: '',
    contraseña: '',
    rol: 'admin',
  });
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contraseña) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await api.post('/usuarios/admin', formData);

      // Resetear formulario
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        usuario: '',
        contraseña: '',
        rol: 'admin',
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear usuario admin');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Usuario Admin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido *</Label>
            <Input
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usuario">
              Usuario (Cédula) <span className="text-muted-foreground text-xs">(Opcional)</span>
            </Label>
            <Input
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contraseña">Contraseña *</Label>
            <div className="relative">
              <Input
                id="contraseña"
                type={mostrarContraseña ? 'text' : 'password'}
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarContraseña(!mostrarContraseña)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {mostrarContraseña ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rol">Rol *</Label>
            <Select
              value={formData.rol}
              onValueChange={(value) => setFormData(prev => ({ ...prev, rol: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand-500 hover:bg-brand-600">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
