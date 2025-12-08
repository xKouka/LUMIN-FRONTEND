import { useState, useEffect, useCallback, useRef } from 'react';
import {
    addOperation,
    getPendingOperations,
    markOperationComplete,
    markOperationFailed,
    getSyncStats,
    clearOldOperations,
} from '@/app/lib/db/offlineDB';
import api from '@/app/lib/api';

interface SyncStatus {
    isSyncing: boolean;
    pendingCount: number;
    failedCount: number;
    lastSyncAttempt: number | null;
}

/**
 * Hook for managing offline operations queue and synchronization
 * 
 * @example
 * const { queueOperation, syncStatus, manualSync } = useOfflineQueue();
 * 
 * // Queue an operation when offline
 * await queueOperation('/api/muestras', 'POST', { ...sampleData });
 */
export function useOfflineQueue() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isSyncing: false,
        pendingCount: 0,
        failedCount: 0,
        lastSyncAttempt: null,
    });

    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    /**
     * Update sync statistics
     */
    const updateStats = useCallback(async () => {
        const stats = await getSyncStats();
        setSyncStatus(prev => ({
            ...prev,
            pendingCount: stats.pending,
            failedCount: stats.failed,
        }));
    }, []);

    /**
     * Process sync queue
     */
    const processQueue = useCallback(async () => {
        if (syncStatus.isSyncing || !isOnline) return;

        setSyncStatus(prev => ({ ...prev, isSyncing: true, lastSyncAttempt: Date.now() }));

        try {
            const pending = await getPendingOperations();

            for (const operation of pending) {
                // Check if depends on another operation
                if (operation.dependsOn) {
                    const dependency = await getPendingOperations();
                    const depExists = dependency.some(op => op.id === operation.dependsOn);
                    if (depExists) {
                        console.log(`Skipping ${operation.id}, waiting for ${operation.dependsOn}`);
                        continue;
                    }
                }

                try {
                    // Execute the API call
                    const response = await api({
                        method: operation.method,
                        url: operation.endpoint,
                        data: operation.payload,
                        headers: {
                            'X-Idempotency-Key': operation.id, // Prevent duplicates
                        },
                    });

                    if (response.status >= 200 && response.status < 300) {
                        await markOperationComplete(operation.id);
                        console.log(`✓ Synced operation ${operation.id}`);
                    } else {
                        throw new Error(`HTTP ${response.status}`);
                    }
                } catch (error: any) {
                    const errorMsg = error.response?.data?.error || error.message;
                    await markOperationFailed(operation.id, errorMsg);
                    console.error(`✗ Failed to sync ${operation.id}:`, errorMsg);

                    // Don't retry 4xx errors (client errors)
                    if (error.response?.status >= 400 && error.response?.status < 500) {
                        break; // Stop processing queue on client errors
                    }
                }
            }

            // Clean up old completed operations
            await clearOldOperations();
            await updateStats();
        } finally {
            setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        }
    }, [isOnline, syncStatus.isSyncing, updateStats]);

    /**
     * Queue an operation for offline sync
     */
    const queueOperation = useCallback(async (
        endpoint: string,
        method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        payload: any,
        dependsOn?: string
    ): Promise<string> => {
        const operationId = await addOperation(endpoint, method, payload, dependsOn);
        await updateStats();

        // Try to sync immediately if online
        if (isOnline) {
            setTimeout(() => processQueue(), 100);
        }

        return operationId;
    }, [isOnline, processQueue, updateStats]);

    /**
     * Manual sync trigger
     */
    const manualSync = useCallback(async () => {
        if (!isOnline) {
            throw new Error('Cannot sync while offline');
        }
        await processQueue();
    }, [isOnline, processQueue]);

    /**
     * Handle online/offline events
     */
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            console.log('🟢 Connection restored - starting sync...');
            processQueue();
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('🔴 Connection lost - queuing operations...');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [processQueue]);

    /**
     * Periodic sync when online
     */
    useEffect(() => {
        if (isOnline && syncStatus.pendingCount > 0) {
            syncIntervalRef.current = setInterval(() => {
                processQueue();
            }, 30000); // Every 30 seconds
        } else {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [isOnline, syncStatus.pendingCount, processQueue]);

    /**
     * Initial stats load
     */
    useEffect(() => {
        updateStats();
    }, [updateStats]);

    return {
        isOnline,
        syncStatus,
        queueOperation,
        manualSync,
    };
}
