// ============================================
// WEB WORKER - Background Sync
// Keeps UI thread free during heavy sync operations
// ============================================

// This will be loaded as a Web Worker
// Import Dexie in worker context
importScripts('https://unpkg.com/dexie@3.2.4/dist/dexie.min.js');

let db = null;

// Initialize IndexedDB in worker
async function initDB() {
  if (!db) {
    db = new Dexie('FilipinPOSDB');
    db.version(1).stores({
      transactions: 'id, tenantId, syncStatus',
      products: 'id, tenantId',
      customers: 'id, tenantId',
      syncQueue: '++id, entityType, status'
    });
    await db.open();
  }
  return db;
}

// Handle messages from main thread
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;
  
  try {
    await initDB();
    
    switch (type) {
      case 'SYNC_PUSH':
        await handleSyncPush(payload);
        break;
      
      case 'SYNC_PULL':
        await handleSyncPull(payload);
        break;
      
      case 'PROCESS_QUEUE':
        await processSyncQueue(payload);
        break;
      
      default:
        self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
    }
  } catch (error) {
    self.postMessage({ 
      type: 'ERROR', 
      error: error.message,
      stack: error.stack 
    });
  }
});

async function handleSyncPush({ tenantId, operations }) {
  const results = [];
  
  for (const op of operations) {
    try {
      if (op.operation === 'create') {
        await db[op.entityType].add({
          ...op.data,
          tenantId,
          syncStatus: 'synced'
        });
        results.push({ id: op.entityId, status: 'success' });
      } else if (op.operation === 'update') {
        await db[op.entityType].update(op.entityId, {
          ...op.data,
          syncStatus: 'synced',
          lastSyncedAt: new Date()
        });
        results.push({ id: op.entityId, status: 'success' });
      }
    } catch (error) {
      results.push({ id: op.entityId, status: 'error', error: error.message });
    }
  }
  
  self.postMessage({ 
    type: 'SYNC_PUSH_RESULT', 
    results 
  });
}

async function handleSyncPull({ tenantId, since }) {
  const changes = {
    transactions: await db.transactions
      .where('tenantId')
      .equals(tenantId)
      .filter(tx => new Date(tx.updatedAt) > new Date(since))
      .toArray(),
    products: await db.products
      .where('tenantId')
      .equals(tenantId)
      .filter(p => new Date(p.updatedAt) > new Date(since))
      .toArray()
  };
  
  self.postMessage({ 
    type: 'SYNC_PULL_RESULT', 
    changes 
  });
}

async function processSyncQueue({ tenantId }) {
  const queue = await db.syncQueue
    .where('status')
    .equals('pending')
    .toArray();
  
  const processed = [];
  
  for (const item of queue) {
    try {
      // Process sync item
      await db.syncQueue.update(item.id, { 
        status: 'processing',
        processedAt: new Date()
      });
      
      processed.push({ id: item.id, status: 'success' });
    } catch (error) {
      processed.push({ id: item.id, status: 'error', error: error.message });
    }
  }
  
  self.postMessage({ 
    type: 'QUEUE_PROCESSED', 
    processed 
  });
}

