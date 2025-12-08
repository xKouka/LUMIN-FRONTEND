'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import api from '@/app/lib/api';
import Cookies from 'js-cookie';
import { Download, AlertCircle, FileText, User, Mail, Calendar, Eye, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function ClienteDashboardPage() {
  const router = useRouter();
  const [muestras, setMuestras] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [muestraSeleccionada, setMuestraSeleccionada] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const usuario = Cookies.get('usuario') ? JSON.parse(Cookies.get('usuario')!) : null;

  useEffect(() => {
    obtenerMuestrasRecientes();
  }, []);

  const obtenerMuestrasRecientes = async () => {
    try {
      setCargando(true);
      const response = await api.get('/muestras/mis-muestras');
      // Obtener solo las últimas 5 muestras
      setMuestras(response.data.slice(0, 5));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar muestras');
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPDF = async (muestraId: number) => {
    try {
      const response = await api.get(`/muestras/${muestraId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `muestra_${muestraId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Error al descargar PDF:', err);
    }
  };

  const handleVerMuestra = async (muestra: any) => {
    try {
      setCargandoDetalle(true);
      const response = await api.get(`/muestras/${muestra.id}`);
      setMuestraSeleccionada(response.data);
      setModalAbierto(true);
    } catch (err: any) {
      console.error('Error al cargar muestra:', err);
    } finally {
      setCargandoDetalle(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="cliente">
      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1200px] mx-auto w-full">

        {/* Modern Welcome Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Hola, {usuario?.nombre.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido a tu portal de paciente. Aquí están tus resultados recientes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm border">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-brand-600" />
                Mi Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Nombre Completo</p>
                <p className="font-medium text-sm text-gray-900">{usuario?.nombre}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                <p className="font-medium text-sm text-gray-900 truncate">{usuario?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Usuario / Cédula</p>
                <p className="font-medium text-sm text-gray-900">{usuario?.usuario}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo de Cuenta</p>
                <Badge variant="secondary" className="mt-1 capitalize">{usuario?.rol}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-brand-50 border-brand-100 dark:bg-brand-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-brand-800">
                <Activity className="w-5 h-5" />
                Acceso Rápido
              </CardTitle>
              <CardDescription className="text-brand-700">
                Consulta tu historial completo de exámenes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/dashboard/cliente/muestras')}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Historial Completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Samples Section */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Resultados Recientes</CardTitle>
            <CardDescription>Tus últimos exámenes de laboratorio procesados</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {cargando ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
              </div>
            ) : muestras.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-3 bg-gray-50 p-3 text-sm font-medium text-gray-500 border-b">
                  <div>Fecha</div>
                  <div>Examen</div>
                  <div className="text-right">Acciones</div>
                </div>
                {muestras.map((muestra) => (
                  <div key={muestra.id} className="grid grid-cols-3 p-4 items-center gap-4 border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {new Date(muestra.fecha_toma).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(muestra.fecha_toma).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      {muestra.tipos_muestras?.map((t: any, i: number) => (
                        <Badge key={i} variant="outline" className="mr-1 mb-1 capitalize bg-white">
                          {t.tipo_muestra}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleVerMuestra(muestra)}>
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDescargarPDF(muestra.id)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No hay resultados recientes disponibles.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Ver Muestra (Shadcn Dialog) */}
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle de Resultados</DialogTitle>
              <DialogDescription>
                Resultados completos para la muestra del {muestraSeleccionada && new Date(muestraSeleccionada.fecha_toma).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            {muestraSeleccionada && (
              <div className="space-y-6">
                {/* Info Header */}
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Paciente</h4>
                    <p className="font-medium">{muestraSeleccionada.paciente_nombre}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">ID Muestra</h4>
                    <p className="font-mono text-sm">#{muestraSeleccionada.id}</p>
                  </div>
                  {muestraSeleccionada.observaciones && (
                    <div className="col-span-2 pt-2 border-t border-dashed border-gray-200">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1">Observaciones Generales</h4>
                      <p className="text-sm italic text-gray-700">{muestraSeleccionada.observaciones}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Results List */}
                <div className="space-y-4">
                  {muestraSeleccionada.detalles?.map((detalle: any, idx: number) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-semibold capitalize flex items-center gap-2">
                          {detalle.tipo_muestra === 'sangre' && '🩸'}
                          {detalle.tipo_muestra === 'orina' && '💧'}
                          {detalle.tipo_muestra === 'heces' && '🧻'}
                          {detalle.tipo_muestra}
                        </h4>
                      </div>
                      <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {detalle.resultados && Object.entries(detalle.resultados).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-slate-50 p-3 rounded border border-slate-100">
                            <p className="text-xs text-muted-foreground uppercase mb-1 font-medium tracking-wide">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {value !== null && value !== '' ? String(value) : '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                      {detalle.observaciones && (
                        <div className="px-4 py-3 bg-yellow-50/50 text-sm text-yellow-800 border-t border-yellow-100">
                          <span className="font-semibold mr-1">Nota:</span> {detalle.observaciones}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DialogClose>
              <Button onClick={() => handleDescargarPDF(muestraSeleccionada.id)}>
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}