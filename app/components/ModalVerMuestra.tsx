'use client';

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, Loader2, TestTube, Beaker, Package, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

// ShadCN UI
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ModalVerMuestraProps {
    isOpen: boolean;
    muestraId: number | null;
    onClose: () => void;
}

export default function ModalVerMuestra({
    isOpen,
    muestraId,
    onClose,
}: ModalVerMuestraProps) {
    const [muestra, setMuestra] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (muestraId && isOpen) {
            cargarMuestra(muestraId);
        } else {
            setMuestra(null);
        }
    }, [muestraId, isOpen]);

    const cargarMuestra = async (id: number) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get(`/muestras/${id}`);
            setMuestra(response.data);
        } catch (err: any) {
            console.error('Error al cargar muestra:', err);
            setError('No se pudo cargar la información de la muestra.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!muestraId || !muestra) return;

        try {
            setDownloading(true);
            const response = await api.get(`/muestras/${muestraId}/pdf`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Reporte_${muestra.paciente_nombre.replace(/\s+/g, '_')}_${muestraId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
        } finally {
            setDownloading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between mr-8">
                        <div className="flex flex-col gap-1">
                            <DialogTitle className="text-xl flex items-center gap-2">
                                Muestra #{muestraId}
                                {muestra?.pagado && (
                                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 ml-2">
                                        Pagado
                                    </Badge>
                                )}
                            </DialogTitle>
                            <DialogDescription>
                                Detalles completos del análisis y materiales utilizados
                            </DialogDescription>
                        </div>
                        {muestra && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadPDF}
                                disabled={downloading}
                                className="gap-2 border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-800"
                            >
                                {downloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FileText className="w-4 h-4" />
                                )}
                                {downloading ? 'Generando...' : 'Descargar PDF'}
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                            <p>Cargando detalles...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <div className="p-4 bg-red-50 text-red-700 rounded-lg inline-block">
                                {error}
                            </div>
                        </div>
                    ) : muestra && (
                        <div className="p-6 space-y-8">
                            {/* Información del Paciente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-4 h-4" /> Paciente
                                    </h3>
                                    <div>
                                        <p className="font-medium text-lg text-gray-900">{muestra.paciente_nombre}</p>
                                        <p className="text-sm text-gray-500">CI: {muestra.cedula}</p>
                                        <p className="text-sm text-gray-500">{muestra.telefono || 'Sin teléfono'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Fecha de Toma
                                    </h3>
                                    <div>
                                        <p className="font-medium text-lg text-gray-900 capitalize">
                                            {format(new Date(muestra.fecha_toma), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(muestra.fecha_toma), "HH:mm 'hrs'", { locale: es })}
                                        </p>
                                    </div>
                                </div>
                                {muestra.observaciones && (
                                    <div className="md:col-span-2 pt-2 border-t border-slate-200">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium text-gray-900">Observaciones Generales:</span> {muestra.observaciones}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Detalles de Exámenes */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-brand-600" />
                                    Resultados por Tipo
                                </h3>

                                {muestra.detalles?.map((detalle: any) => (
                                    <div key={detalle.id} className="border rounded-xl bg-white shadow-sm overflow-hidden">
                                        <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <Badge className={cn("text-sm px-3 py-1 capitalize",
                                                    detalle.tipo_muestra === 'sangre' ? 'bg-red-600' :
                                                        detalle.tipo_muestra === 'orina' ? 'bg-yellow-500' : 'bg-amber-600'
                                                )}>
                                                    {detalle.tipo_muestra === 'sangre' && <TestTube className="w-3 h-3 mr-1" />}
                                                    {detalle.tipo_muestra === 'orina' && <Beaker className="w-3 h-3 mr-1" />}
                                                    {detalle.tipo_muestra === 'heces' && <Package className="w-3 h-3 mr-1" />}
                                                    {detalle.tipo_muestra}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-4 grid md:grid-cols-2 gap-6">
                                            {/* Resultados */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3 underline decoration-brand-200 underline-offset-4">Resultados</h4>
                                                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                                                    {Object.entries(detalle.resultados || {}).map(([key, value]: any) => (
                                                        <div key={key} className="flex justify-between border-b last:border-0 border-gray-200 py-1">
                                                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                                            <span className="font-medium text-gray-900">{value}</span>
                                                        </div>
                                                    ))}
                                                    {Object.keys(detalle.resultados || {}).length === 0 && (
                                                        <p className="text-gray-400 italic text-center py-2">Sin resultados registrados</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Productos Usados (Nuevo) */}
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2 underline decoration-blue-200 underline-offset-4">
                                                    <Package className="w-4 h-4 text-blue-500" />
                                                    Materiales Utilizados
                                                </h4>
                                                <div className="bg-blue-50/50 rounded-lg p-3 space-y-2">
                                                    {detalle.productos_usados && detalle.productos_usados.length > 0 ? (
                                                        detalle.productos_usados.map((prod: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 rounded shadow-sm border border-blue-100">
                                                                <span className="text-gray-700">{prod.nombre}</span>
                                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                                                    {prod.cantidad} un.
                                                                </Badge>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-400 italic text-sm text-center py-2">No se registraron materiales</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {detalle.observaciones && (
                                            <div className="px-4 py-3 bg-gray-50/50 border-t text-sm">
                                                <span className="font-semibold text-gray-700">Nota:</span> <span className="text-gray-600">{detalle.observaciones}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <Button variant="outline" onClick={onClose} className="min-w-[100px]">
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
