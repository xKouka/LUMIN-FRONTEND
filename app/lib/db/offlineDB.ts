import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * IndexedDB Schema for Offline Queue
 */
interface OfflineQueueDB extends DBSchema {
    operations: {
        key: string; // UUID
        value: {
            id: string;
            timestamp: number;
            endpoint: string;
            method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            payload: any;
            status: 'pending' | 'processing' | 'completed' | 'failed';
            retries: number;
            error?: string;
            dependsOn?: string; // ID of operation that must complete first
        };
        indexes: {
            'by-status': string;
            'by-timestamp': number;
        };
    };
    api_cache: {
        key: string; // URL
        value: {
            url: string;
            data: any;
            timestamp: number;
        };
    };
}

const DB_NAME = 'blanca-trinidad-offline';
const DB_VERSION = 2; // Increment version

/**
 * Initialize IndexedDB connection
 */
export async function initDB(): Promise<IDBPDatabase<OfflineQueueDB>> {
    return openDB<OfflineQueueDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            if (!db.objectStoreNames.contains('operations')) {
                const store = db.createObjectStore('operations', { keyPath: 'id' });
                store.createIndex('by-status', 'status');
                store.createIndex('by-timestamp', 'timestamp');
            }
            if (!db.objectStoreNames.contains('api_cache')) {
                db.createObjectStore('api_cache', { keyPath: 'url' });
            }
        },
    });
}

/**
 * Add operation to queue
 */
export async function addOperation(
    endpoint: string,
    method: OfflineQueueDB['operations']['value']['method'],
    payload: any,
    dependsOn?: string
): Promise<string> {
    const db = await initDB();
    const id = crypto.randomUUID();

    const operation: OfflineQueueDB['operations']['value'] = {
        id,
        timestamp: Date.now(),
        endpoint,
        method,
        payload,
        status: 'pending',
        retries: 0,
        dependsOn,
    };

    await db.add('operations', operation);
    return id;
}

/**
 * Get all pending operations (FIFO order)
 */
export async function getPendingOperations(): Promise<OfflineQueueDB['operations']['value'][]> {
    const db = await initDB();
    const ops = await db.getAllFromIndex('operations', 'by-status', 'pending');
    // Sort by timestamp (FIFO)
    return ops.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Mark operation as completed
 */
export async function markOperationComplete(id: string): Promise<void> {
    const db = await initDB();
    const operation = await db.get('operations', id);
    if (operation) {
        operation.status = 'completed';
        await db.put('operations', operation);
    }
}

/**
 * Mark operation as failed
 */
export async function markOperationFailed(id: string, error: string): Promise<void> {
    const db = await initDB();
    const operation = await db.get('operations', id);
    if (operation) {
        operation.status = 'failed';
        operation.error = error;
        operation.retries += 1;
        await db.put('operations', operation);
    }
}

/**
 * Reset failed operation to retry
 */
export async function retryOperation(id: string): Promise<void> {
    const db = await initDB();
    const operation = await db.get('operations', id);
    if (operation && operation.retries < 3) {
        operation.status = 'pending';
        await db.put('operations', operation);
    }
}

/**
 * Get sync statistics
 */
export async function getSyncStats() {
    const db = await initDB();
    const all = await db.getAll('operations');

    return {
        total: all.length,
        pending: all.filter(op => op.status === 'pending').length,
        processing: all.filter(op => op.status === 'processing').length,
        completed: all.filter(op => op.status === 'completed').length,
        failed: all.filter(op => op.status === 'failed').length,
    };
}

/**
 * Clear completed operations (older than 7 days)
 */
export async function clearOldOperations(): Promise<void> {
    const db = await initDB();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const all = await db.getAll('operations');

    for (const op of all) {
        if (op.status === 'completed' && op.timestamp < sevenDaysAgo) {
            await db.delete('operations', op.id);
        }
    }
}

/**
 * Cache an API response
 */
export async function cacheResponse(url: string, data: any): Promise<void> {
    const db = await initDB();
    await db.put('api_cache', {
        url,
        data,
        timestamp: Date.now(),
    });
}

/**
 * Get cached response
 */
export async function getCachedResponse(url: string): Promise<any | null> {
    const db = await initDB();
    const entry = await db.get('api_cache', url);
    return entry ? entry.data : null;
}
