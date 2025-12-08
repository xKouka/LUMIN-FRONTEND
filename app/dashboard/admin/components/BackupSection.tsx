'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, AlertCircle } from 'lucide-react';
import api from '@/app/lib/api';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BackupSection() {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownloadBackup = async () => {
        try {
            setDownloading(true);
            setError(null);

            const response = await api.get('/backup', {
                responseType: 'blob', // Important for file download
            });

            // Create a blob from the response data
            const blob = new Blob([response.data], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = url;

            // Get filename from header or default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'backup.sql';
            if (contentDisposition) {
                const matches = /filename=([^;]+)/ig.exec(contentDisposition);
                if (matches && matches[1]) {
                    filename = matches[1].trim();
                }
            }
            // Fallback for simple date name if header parsing fails or isn't present in exposed headers
            if (filename === 'backup.sql') {
                const date = new Date().toISOString().split('T')[0];
                filename = `backup-${date}.sql`;
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Error downloading backup:', err);
            setError('Error al descargar el respaldo. Por favor intente nuevamente.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card className="shadow-sm border-blue-100 mb-6">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Database className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-gray-800">Respaldo de Base de Datos</CardTitle>
                        <CardDescription>Descarga una copia completa de la base de datos del sistema</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                        <h4 className="font-medium text-gray-900">Base de Datos PostgreSQL</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            Incluye todos los pacientes, muestras, usuarios e inventario.
                        </p>
                    </div>
                    <Button
                        onClick={handleDownloadBackup}
                        disabled={downloading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {downloading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Descargando...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar Respaldo
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
