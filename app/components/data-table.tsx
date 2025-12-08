'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ModalInfoPaciente from '@/app/components/ModalInfoPaciente';

interface Muestra {
    id: number;
    paciente_nombre: string;
    fecha_toma: string;
    pagado: boolean;
    tipos_muestras?: any[];
    cedula?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
}

interface DataTableProps {
    data: Muestra[];
    loading?: boolean;
}

export function DataTable({ data, loading = false }: DataTableProps) {
    const [modalInfoAbierto, setModalInfoAbierto] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

    // Filter to last 10 samples
    const recentMuestras = data ? data.slice(0, 10) : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Últimas Muestras</CardTitle>
                <CardDescription>
                    Muestras recientes procesadas en el laboratorio
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Paciente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipos</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-4 bg-muted rounded w-12 animate-pulse"></div></TableCell>
                                        <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse"></div></TableCell>
                                        <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse"></div></TableCell>
                                        <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></TableCell>
                                        <TableCell className="text-right"><div className="h-6 bg-muted rounded w-16 animate-pulse ml-auto"></div></TableCell>
                                    </TableRow>
                                ))
                            ) : recentMuestras.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        No hay muestras registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentMuestras.map((muestra) => (
                                    <TableRow
                                        key={muestra.id}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            setClienteSeleccionado(muestra);
                                            setModalInfoAbierto(true);
                                        }}
                                    >
                                        <TableCell className="font-medium">#{muestra.id}</TableCell>
                                        <TableCell className="font-medium">{muestra.paciente_nombre}</TableCell>
                                        <TableCell>
                                            {new Date(muestra.fecha_toma).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {muestra.tipos_muestras && muestra.tipos_muestras.length > 0
                                                ? muestra.tipos_muestras.map((t: any) => t.tipo_muestra).join(', ')
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant={muestra.pagado ? "default" : "secondary"}
                                                className={muestra.pagado ? "bg-brand-600 hover:bg-brand-700" : ""}
                                            >
                                                {muestra.pagado ? "Pagado" : "Pendiente"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <ModalInfoPaciente
                isOpen={modalInfoAbierto}
                onClose={() => setModalInfoAbierto(false)}
                cliente={clienteSeleccionado}
            />
        </Card>
    );
}

