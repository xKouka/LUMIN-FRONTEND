'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import ModalReportes from '@/app/components/ModalReportes';
import api from '@/app/lib/api';
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
import { FileText, Plus, Calendar, User, Download, History } from 'lucide-react';
import { format } from 'date-fns';
import { showError, showSuccess } from '@/app/utils/sweetalert';

import { fetchReportData, generateReportPDF } from '@/app/utils/reportUtils';

export default function ReportesPage() {
    const [modalAbierto, setModalAbierto] = useState(false);
    const [reportes, setReportes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        obtenerHistorial();
    }, []);

    const obtenerHistorial = async () => {
        try {
            setLoading(true);
            const res = await api.get('/reportes');
            setReportes(res.data);
        } catch (err) {
            console.error('Error al cargar historial:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReportGenerated = async (data: any) => {
        // Refresh history after generation
        await obtenerHistorial();
        setModalAbierto(false);
    };

    const handleDownload = async (reporte: any) => {
        try {
            // Toast or non-blocking loading would be better, but re-using global loading for now
            // or just use a toast to indicate start
            showSuccess('Generando PDF...', 'Por favor espere');

            const startDate = new Date(reporte.fecha_inicio);
            const endDate = new Date(reporte.fecha_fin);

            // Format to YYYY-MM-DD to match the utility expectations (matches ModalReportes behavior)
            const fechaInicio = startDate.toISOString().split('T')[0];
            const fechaFin = endDate.toISOString().split('T')[0];

            const data = await fetchReportData(fechaInicio, fechaFin);

            // Generate PDF
            generateReportPDF(data, fechaInicio, fechaFin);

        } catch (err) {
            console.error(err);
            showError('Error', 'No se pudo regenerar el reporte');
        }
    };

    return (
        <ProtectedRoute requiredRole="admin">
            <div className="flex flex-col gap-6 max-w-[1600px] mx-auto w-full p-4 md:p-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Reportes</h1>
                        <p className="text-muted-foreground mt-1">
                            Generación y consulta de informes del laboratorio
                        </p>
                    </div>
                    <Button
                        onClick={() => setModalAbierto(true)}
                        className="bg-brand-500 hover:bg-brand-700 text-white"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Generar Nuevo Reporte
                    </Button>
                </div>

                {/* History Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-gray-500" />
                            <CardTitle>Historial de Reportes</CardTitle>
                        </div>
                        <CardDescription>
                            Registro de reportes generados anteriormente
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
                            </div>
                        ) : reportes.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No hay reportes generados aún</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Generado Por</TableHead>
                                        <TableHead>Período del Reporte</TableHead>
                                        <TableHead>Fecha Generación</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportes.map((reporte) => (
                                        <TableRow key={reporte.id}>
                                            <TableCell className="font-medium">#{reporte.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {reporte.generado_por_nombre || 'Usuario'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {format(new Date(reporte.fecha_inicio), 'dd/MM/yyyy')} - {format(new Date(reporte.fecha_fin), 'dd/MM/yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(reporte.fecha_generacion), 'dd/MM/yyyy HH:mm')}
                                            </TableCell>
                                            <TableCell className="capitalize">{reporte.tipo}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownload(reporte)}
                                                    title="Descargar historial PDF"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Descargar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <ModalReportes
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    onGenerate={handleReportGenerated}
                />
            </div>
        </ProtectedRoute>
    );
}
