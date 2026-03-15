// ============================================
// REACT HOOK - Web Worker Integration
// ============================================

import { useEffect, useRef, useCallback } from 'react';

export function useSyncWorker() {
  const workerRef = useRef(null);

  useEffect(() => {
    // Create worker
    try {
      workerRef.current = new Worker(
        new URL('../workers/syncWorker.js', import.meta.url),
        { type: 'module' }
      );

      // Cleanup
      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
        }
      };
    } catch (error) {
      console.warn('Web Worker not supported, falling back to main thread:', error);
    }
  }, []);

  const syncPush = useCallback((tenantId, operations) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not available'));
        return;
      }

      const handler = (event) => {
        if (event.data.type === 'SYNC_PUSH_RESULT') {
          workerRef.current.removeEventListener('message', handler);
          resolve(event.data.results);
        } else if (event.data.type === 'ERROR') {
          workerRef.current.removeEventListener('message', handler);
          reject(new Error(event.data.error));
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage({
        type: 'SYNC_PUSH',
        payload: { tenantId, operations }
      });
    });
  }, []);

  const syncPull = useCallback((tenantId, since) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not available'));
        return;
      }

      const handler = (event) => {
        if (event.data.type === 'SYNC_PULL_RESULT') {
          workerRef.current.removeEventListener('message', handler);
          resolve(event.data.changes);
        } else if (event.data.type === 'ERROR') {
          workerRef.current.removeEventListener('message', handler);
          reject(new Error(event.data.error));
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage({
        type: 'SYNC_PULL',
        payload: { tenantId, since }
      });
    });
  }, []);

  return {
    syncPush,
    syncPull,
    isAvailable: workerRef.current !== null
  };
}

