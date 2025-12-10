/**
 * Offline Sync Service
 * Monitors network status and syncs pending operations when back online
 */

import api from './api';
import { getPendingOperations, markOperationComplete, markOperationFailed } from './db/offlineDB';

let syncInProgress = false;
let syncInterval: NodeJS.Timeout | null = null;

/**
 * Start monitoring for network changes and auto-sync
 */
export function startSyncMonitor() {
    if (syncInterval) return; // Already running

    // Check every 10 seconds
    syncInterval = setInterval(async () => {
        if (navigator.onLine && !syncInProgress) {
            await syncPendingOperations();
        }
    }, 10000);

    // Also listen to online event
    window.addEventListener('online', handleOnline);
}

/**
 * Stop monitoring
 */
export function stopSyncMonitor() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    window.removeEventListener('online', handleOnline);
}

/**
 * Handle online event
 */
async function handleOnline() {
    console.log('🌐 Network restored, syncing pending operations...');
    await syncPendingOperations();
}

/**
 * Sync all pending operations
 */
export async function syncPendingOperations(): Promise<{ success: number; failed: number }> {
    if (syncInProgress) {
        console.log('⏳ Sync already in progress');
        return { success: 0, failed: 0 };
    }

    syncInProgress = true;
    let successCount = 0;
    let failedCount = 0;

    try {
        const operations = await getPendingOperations();

        if (operations.length === 0) {
            console.log('✅ No pending operations to sync');
            return { success: 0, failed: 0 };
        }

        console.log(`🔄 Syncing ${operations.length} pending operations...`);

        for (const op of operations) {
            try {
                // Make the actual API call
                const response = await api.request({
                    method: op.method,
                    url: op.endpoint,
                    data: op.payload,
                    // Disable our interceptor retry for sync
                    headers: { 'X-Sync-Request': 'true' }
                });

                console.log(`✅ Synced operation ${op.id}:`, op.method, op.endpoint);
                await markOperationComplete(op.id);
                successCount++;
            } catch (error: any) {
                console.error(`❌ Failed to sync operation ${op.id}:`, error.message);
                await markOperationFailed(op.id, error.message);
                failedCount++;
            }
        }

        console.log(`✅ Sync complete: ${successCount} success, ${failedCount} failed`);
    } catch (error) {
        console.error('❌ Error during sync:', error);
    } finally {
        syncInProgress = false;
    }

    return { success: successCount, failed: failedCount };
}

/**
 * Get current sync status
 */
export function isSyncing(): boolean {
    return syncInProgress;
}
