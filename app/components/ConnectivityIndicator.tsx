'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { startSyncMonitor, stopSyncMonitor, syncPendingOperations, isSyncing } from '@/app/lib/syncService';
import { getSyncStats } from '@/app/lib/db/offlineDB';

export default function ConnectivityIndicator() {
    const [status, setStatus] = useState<{
        isOnline: boolean;
        database: string;
        currentState: string | null;
        isSyncing: boolean;
    }>({
        isOnline: true,
        database: 'PostgreSQL',
        currentState: null,
        isSyncing: false,
    });
    const [lastCheck, setLastCheck] = useState<Date | null>(null);
    const [browserOnline, setBrowserOnline] = useState(true);
    const [pendingOps, setPendingOps] = useState(0);
    const [syncing, setSyncing] = useState(false);

    // Start sync monitor on mount
    useEffect(() => {
        startSyncMonitor();
        return () => stopSyncMonitor();
    }, []);

    // Poll pending operations count
    useEffect(() => {
        const updatePendingCount = async () => {
            try {
                const stats = await getSyncStats();
                setPendingOps(stats.pending);
                setSyncing(isSyncing());
            } catch (err) {
                console.error('Error getting sync stats:', err);
            }
        };

        updatePendingCount();
        const interval = setInterval(updatePendingCount, 3000);
        return () => clearInterval(interval);
    }, []);

    // Detectar cambios de conectividad del navegador
    useEffect(() => {
        const handleOnline = () => {
            console.log('🌐 Navegador detectó conexión restaurada');
            setBrowserOnline(true);
            checkConnectivity();
        };

        const handleOffline = () => {
            console.log('⚠️ Navegador detectó pérdida de conexión');
            setBrowserOnline(false);
            setStatus(prev => ({
                ...prev,
                isOnline: false,
                database: 'SQLite',
                currentState: 'offline',
            }));
        };

        // Verificar estado inicial
        setBrowserOnline(navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Verificar conectividad con el backend
    const checkConnectivity = async () => {
        // Si el navegador reporta offline, no intentar fetch
        if (!navigator.onLine) {
            setStatus(prev => ({
                ...prev,
                isOnline: false,
                database: 'SQLite',
                currentState: 'offline',
            }));
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // timeout 5s

            const response = await fetch('http://localhost:5000/api/status/connectivity', {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                setStatus({
                    isOnline: data.isOnline,
                    database: data.database,
                    currentState: data.currentState,
                    isSyncing: data.sync?.isSyncing || false,
                });
                setLastCheck(new Date());
            } else {
                // Backend respondió pero con error
                setStatus(prev => ({
                    ...prev,
                    isOnline: false,
                    database: 'SQLite',
                    currentState: 'offline',
                }));
            }
        } catch (error) {
            // Error de red o timeout - asumimos offline
            console.log('No se pudo conectar al backend, usando modo offline');
            setStatus(prev => ({
                ...prev,
                isOnline: false,
                database: 'SQLite',
                currentState: 'offline',
            }));
        }
    };

    // Polling cada 30 segundos solo si el navegador está online
    useEffect(() => {
        checkConnectivity();

        const interval = setInterval(() => {
            if (navigator.onLine) {
                checkConnectivity();
            }
        }, 30000); // 30 segundos

        return () => clearInterval(interval);
    }, [browserOnline]);

    // Forzar sincronización manual
    const handleManualSync = async () => {
        if (!navigator.onLine) {
            alert('No hay conexión a internet para sincronizar');
            return;
        }

        try {
            setSyncing(true);
            const result = await syncPendingOperations();
            console.log('Sincronización manual completada:', result);
            alert(`Sincronizado: ${result.success} exitosas, ${result.failed} fallidas`);
            checkConnectivity();
        } catch (error) {
            console.error('Error en sincronización manual:', error);
            alert('Error al sincronizar operaciones');
        } finally {
            setSyncing(false);
        }
    };

    // Determinar si realmente estamos offline (navegador + backend)
    const isActuallyOffline = !browserOnline || !status.isOnline;

    return (
        <div className="flex items-center gap-3">
            {/* Indicador principal */}
            <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActuallyOffline
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}
            >
                {isActuallyOffline ? (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span>Offline</span>
                    </>
                ) : (
                    <>
                        <Wifi className="w-4 h-4" />
                        <span>Online</span>
                    </>
                )}
            </div>

            {/* Indicador de base de datos */}
            <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">
                {isActuallyOffline ? 'SQLite (Local)' : status.database}
            </div>

            {/* Pendiente count badge */}
            {pendingOps > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    <span>{pendingOps} pendiente{pendingOps !== 1 ? 's' : ''}</span>
                </div>
            )}

            {/* Botón de sincronización */}
            {(pendingOps > 0 || syncing) && browserOnline && (
                <button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${syncing
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                        }`}
                    title="Sincronizar operaciones pendientes"
                >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizando...' : 'Sincronizar'}
                </button>
            )}

            {/* Última verificación */}
            {lastCheck && !isActuallyOffline && (
                <div className="text-xs text-gray-500 dark:text-gray-500 hidden lg:block">
                    Última verificación: {lastCheck.toLocaleTimeString()}
                </div>
            )}
        </div>
    );
}
