'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { showSuccess, showError, showWarning } from '@/app/utils/sweetalert';
import api from '@/app/lib/api';

interface ModalUsuarioAdminProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    usuarioEditar?: any;
}

export default function ModalUsuarioAdmin({ isOpen, onClose, onSaved, usuarioEditar }: ModalUsuarioAdminProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('admin');
    const [estado, setEstado] = useState('activo');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (usuarioEditar) {
            setNombre(usuarioEditar.nombre);
            setApellido(usuarioEditar.apellido);
            setEmail(usuarioEditar.email);
            setUsuario(usuarioEditar.usuario || '');
            setRol(usuarioEditar.rol);
            setEstado(usuarioEditar.estado || 'activo');
            setPassword(''); // Don't fill password on edit
        } else {
            resetForm();
        }
    }, [usuarioEditar, isOpen]);

    const resetForm = () => {
        setNombre('');
        setApellido('');
        setEmail('');
        setUsuario('');
        setPassword('');
        setRol('admin');
        setEstado('activo');
    };

    const handleSave = async () => {
        if (!nombre || !apellido || !email || !rol) {
            showWarning('Datos incompletos', 'Por favor completa los campos requeridos (*)');
            return;
        }

        if (!usuarioEditar && !password) {
            showWarning('Contraseña requerida', 'Debes asignar una contraseña al nuevo usuario');
            return;
        }

        try {
            setLoading(true);
            const payload: any = {
                nombre,
                apellido,
                email,
                usuario,
                rol,
                estado
            };

            if (password) {
                payload.contraseña = password;
            }

            if (usuarioEditar) {
                await api.put(`/usuarios/admin/${usuarioEditar.id}`, payload);
                showSuccess('Usuario actualizado', 'Los datos se han guardado correctamente');
            } else {
                await api.post('/usuarios/admin', payload);
                showSuccess('Usuario creado', 'El nuevo administrador ha sido registrado');
            }

            onSaved();
            onClose();
        } catch (err: any) {
            console.error(err);
            showError('Error', err.response?.data?.error || 'Ocurrió un error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{usuarioEditar ? 'Editar Usuario Admin' : 'Nuevo Usuario Admin'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apellido">Apellido *</Label>
                            <Input id="apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="usuario">Usuario (Cédula/Login)</Label>
                        <Input id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{usuarioEditar ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={usuarioEditar ? "Dejar en blanco para mantener actual" : ""} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select value={rol} onValueChange={setRol}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={estado} onValueChange={setEstado}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="activo">Activo</SelectItem>
                                    <SelectItem value="inactivo">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-brand-600 hover:bg-brand-700">
                        {loading ? 'Guardando...' : (usuarioEditar ? 'Actualizar' : 'Crear Usuario')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
