'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import api from '@/app/lib/api';
import ModalUsuarioAdmin from '@/app/components/ModalUsuarioAdmin';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Shield, MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { showConfirm, showSuccess, showError } from '@/app/utils/sweetalert';
import type { User } from 'lucide-react';

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [usuarioEditar, setUsuarioEditar] = useState<any>(null);

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    const obtenerUsuarios = async () => {
        try {
            setLoading(true);
            const res = await api.get('/usuarios/admins');
            setUsuarios(res.data);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setUsuarioEditar(null);
        setModalOpen(true);
    };

    const handleEdit = (user: any) => {
        setUsuarioEditar(user);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const result = await showConfirm(
            '¿Eliminar usuario?',
            'Esta acción no se puede deshacer. El usuario perderá el acceso inmediatamente.'
        );

        if (result.isConfirmed) {
            try {
                await api.delete(`/usuarios/admin/${id}`);
                showSuccess('Usuario eliminado');
                obtenerUsuarios();
            } catch (err: any) {
                showError('Error', err.response?.data?.error || 'No se pudo eliminar el usuario');
            }
        }
    };

    const handleToggleEstado = async (user: any) => {
        const nuevoEstado = user.estado === 'activo' ? 'inactivo' : 'activo';
        try {
            await api.put(`/usuarios/admin/${user.id}`, { estado: nuevoEstado });
            showSuccess(`Usuario ${nuevoEstado === 'activo' ? 'habilitado' : 'deshabilitado'}`);
            obtenerUsuarios(); // Refresh to show update
        } catch (err: any) {
            showError('Error', err.response?.data?.error || 'No se pudo cambiar el estado');
        }
    };

    return (
        <ProtectedRoute requiredRole="super_admin">
            <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full p-4 md:p-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Administradores</h1>
                        <p className="text-muted-foreground mt-1">
                            Control de acceso y gestión de usuarios administrativos
                        </p>
                    </div>
                    <Button
                        onClick={handleCreate}
                        className="bg-brand-500 hover:bg-brand-600 text-white"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Nuevo Usuario
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-brand-600" />
                            <CardTitle>Usuarios del Sistema</CardTitle>
                        </div>
                        <CardDescription>
                            Listado de administradores y super administradores activos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usuarios.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{user.nombre} {user.apellido}</span>
                                                    <span className="text-xs text-muted-foreground">{user.usuario || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.rol === 'super_admin' ? 'default' : 'secondary'} className={user.rol === 'super_admin' ? 'bg-purple-600 hover:bg-purple-700' : ''}>
                                                    {user.rol === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${user.estado === 'activo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleEstado(user)}>
                                                            {user.estado === 'activo' ? (
                                                                <>
                                                                    <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                                                                    Deshabilitar
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                    Habilitar
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {usuarios.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No se encontraron usuarios.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <ModalUsuarioAdmin
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSaved={obtenerUsuarios}
                    usuarioEditar={usuarioEditar}
                />
            </div>
        </ProtectedRoute>
    );
}
