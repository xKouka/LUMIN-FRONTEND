import { useState, useEffect } from 'react';

interface OnlineStatus {
    isOnline: boolean;
    lastChecked: number;
}

/**
 * Hook to track online/offline connection state
 * 
 * Uses navigator.onLine + periodic ping to backend for reliability
 * 
 * @example
 * const { isOnline } = useOnlineStatus();
 * if (!isOnline) showOfflineBanner();
 */
export function useOnlineStatus(): OnlineStatus {
    const [status, setStatus] = useState<OnlineStatus>({
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        lastChecked: Date.now(),
    });

    useEffect(() => {
        const updateStatus = (online: boolean) => {
            setStatus({
                isOnline: online,
                lastChecked: Date.now(),
            });
        };

        const handleOnline = () => updateStatus(true);
        const handleOffline = () => updateStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Periodic ping to verify actual connectivity (navigator.onLine can be unreliable)
        const pingInterval = setInterval(async () => {
            if (!navigator.onLine) {
                updateStatus(false);
                return;
            }

            try {
                const response = await fetch('/api/sync/ping', {
                    method: 'HEAD',
                    cache: 'no-cache',
                });
                updateStatus(response.ok);
            } catch {
                updateStatus(false);
            }
        }, 10000); // Check every 10 seconds

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(pingInterval);
        };
    }, []);

    return status;
}
