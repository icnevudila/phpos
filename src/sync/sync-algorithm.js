// ============================================
// CONFLICT-FREE SYNC ALGORITHM
// Timestamp-based with Last-Write-Wins (LWW) + Conflict Resolution
// ============================================

import { db, getDeviceId } from '../db/dexie-schema.js';

/**
 * SYNC STRATEGY: Hybrid Approach
 * 
 * 1. Timestamp-Based (LWW) for most entities
 * 2. CRDT-like merging for transactions (additive)
 * 3. Conflict detection and manual resolution for critical data
 * 
 * Key Principles:
 * - All local operations get a local_id (UUID) + device_id + timestamp
 * - Server assigns server_id on first sync
 * - Last modified timestamp determines winner in conflicts
 * - Transactions are never overwritten (only appended)
 */

export class SyncManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.isSyncing = false;
    this.syncInterval = null;
  }

  /**
   * Generate unique local ID for offline operations
   */
  generateLocalId() {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add operation to sync queue
   */
  async queueOperation(entityType, entityId, operation, data) {
    await db.syncQueue.add({
      entityType,
      entityId,
      operation, // 'create', 'update', 'delete'
      data,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending'
    });
  }

  /**
   * MAIN SYNC FUNCTION - Two-way sync
   * 1. Push local changes to server
   * 2. Pull server changes to local
   * 3. Resolve conflicts
   */
  async syncAll(tenantId, userId) {
    if (this.isSyncing) {
      console.log('Sync already in progress...');
      return;
    }

    this.isSyncing = true;
    const deviceId = await getDeviceId();

    try {
      // Check connectivity
      if (!navigator.onLine) {
        console.log('Offline - sync queued');
        return;
      }

      // STEP 1: Push local changes to server
      await this.pushLocalChanges(tenantId, deviceId);

      // STEP 2: Pull server changes
      await this.pullServerChanges(tenantId, deviceId);

      // STEP 3: Resolve any conflicts
      await this.resolveConflicts(tenantId, deviceId);

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * PUSH: Send local changes to server
   */
  async pushLocalChanges(tenantId, deviceId) {
    // Get all pending sync queue items
    const pendingOps = await db.syncQueue
      .where('status')
      .equals('pending')
      .toArray();

    if (pendingOps.length === 0) return;

    // Group by entity type
    const grouped = pendingOps.reduce((acc, op) => {
      if (!acc[op.entityType]) acc[op.entityType] = [];
      acc[op.entityType].push(op);
      return acc;
    }, {});

    // Push each entity type
    for (const [entityType, operations] of Object.entries(grouped)) {
      try {
        const result = await this.apiClient.syncPush(tenantId, entityType, operations);
        
        // Mark as synced
        for (const op of operations) {
          await db.syncQueue.update(op.id, { status: 'synced' });
          
          // Update local entity with server ID if it's a create operation
          if (op.operation === 'create' && result.mappings?.[op.entityId]) {
            await this.updateLocalEntityId(entityType, op.entityId, result.mappings[op.entityId]);
          }
        }
      } catch (error) {
        // Increment retry count
        for (const op of operations) {
          await db.syncQueue.update(op.id, { 
            retryCount: op.retryCount + 1,
            lastError: error.message
          });
        }
      }
    }
  }

  /**
   * PULL: Fetch server changes and merge locally
   */
  async pullServerChanges(tenantId, deviceId) {
    // Get last sync timestamp
    const lastSync = await db.settings.get('lastSyncTimestamp');
    const lastSyncTime = lastSync?.value || new Date(0);

    // Fetch changes from server
    const serverChanges = await this.apiClient.syncPull(tenantId, lastSyncTime.toISOString());

    // Process each entity type
    for (const [entityType, entities] of Object.entries(serverChanges)) {
      await this.mergeServerEntities(entityType, entities, deviceId);
    }

    // Update last sync timestamp
    await db.settings.put({ key: 'lastSyncTimestamp', value: new Date() });
  }

  /**
   * MERGE: Intelligent merging of server entities
   * Conflict Resolution Logic:
   * 1. If local entity doesn't exist → Use server version
   * 2. If local entity has no local_id → Server wins (already synced)
   * 3. If both modified → Compare timestamps (LWW)
   * 4. If timestamps equal → Server wins (authoritative)
   */
  async mergeServerEntities(entityType, serverEntities, deviceId) {
    for (const serverEntity of serverEntities) {
      // Find local entity by server ID or local ID
      const localEntity = await this.findLocalEntity(entityType, serverEntity.id, serverEntity.local_id);

      if (!localEntity) {
        // New entity from server - add it
        await this.addServerEntity(entityType, serverEntity);
      } else if (!localEntity.localId) {
        // Local entity already synced - server is authoritative
        await this.updateLocalEntity(entityType, localEntity.id, serverEntity);
      } else {
        // Potential conflict - check timestamps
        const localTime = new Date(localEntity.updatedAt || localEntity.createdAt);
        const serverTime = new Date(serverEntity.updated_at || serverEntity.created_at);

        if (serverTime > localTime) {
          // Server is newer - update local
          await this.updateLocalEntity(entityType, localEntity.id, serverEntity);
          
          // Mark conflict as resolved (server won)
          await this.recordConflictResolution(entityType, localEntity.id, 'server_wins');
        } else if (localTime > serverTime) {
          // Local is newer - keep local, but queue for push
          await this.queueOperation(entityType, localEntity.id, 'update', localEntity);
          await this.recordConflictResolution(entityType, localEntity.id, 'local_wins');
        } else {
          // Same timestamp - server wins (authoritative)
          await this.updateLocalEntity(entityType, localEntity.id, serverEntity);
        }
      }
    }
  }

  /**
   * CONFLICT RESOLUTION for Transactions (Special Case)
   * Transactions are NEVER overwritten - they're additive
   */
  async resolveTransactionConflicts(tenantId, deviceId) {
    // Get all local transactions with conflicts
    const localTransactions = await db.transactions
      .where('[tenantId+syncStatus]')
      .equals([tenantId, 'conflict'])
      .toArray();

    for (const localTx of localTransactions) {
      try {
        // Check if server has this transaction
        const serverTx = await this.apiClient.getTransaction(tenantId, localTx.localId, deviceId);

        if (serverTx) {
          // Server has it - merge transaction items if needed
          if (serverTx.id !== localTx.id) {
            // Different IDs - local was created offline, server assigned new ID
            // Update local with server ID
            await db.transactions.update(localTx.id, {
              id: serverTx.id,
              syncStatus: 'synced',
              lastSyncedAt: new Date()
            });

            // Update transaction items
            await db.transactionItems
              .where('transactionId')
              .equals(localTx.id)
              .modify({ transactionId: serverTx.id });
          } else {
            // Same ID - mark as synced
            await db.transactions.update(localTx.id, {
              syncStatus: 'synced',
              lastSyncedAt: new Date()
            });
          }
        } else {
          // Server doesn't have it - push it
          await this.queueOperation('transaction', localTx.id, 'create', localTx);
        }
      } catch (error) {
        console.error('Error resolving transaction conflict:', error);
      }
    }
  }

  /**
   * Helper: Find local entity by server ID or local ID
   */
  async findLocalEntity(entityType, serverId, localId) {
    const table = db[this.getTableName(entityType)];
    if (!table) return null;

    // Try by server ID first
    let entity = await table.get(serverId);
    if (entity) return entity;

    // Try by local ID
    if (localId) {
      entity = await table.where('localId').equals(localId).first();
    }

    return entity || null;
  }

  /**
   * Helper: Add server entity to local DB
   */
  async addServerEntity(entityType, serverEntity) {
    const table = db[this.getTableName(entityType)];
    const mapped = this.mapServerToLocal(entityType, serverEntity);
    await table.add(mapped);
  }

  /**
   * Helper: Update local entity with server data
   */
  async updateLocalEntity(entityType, localId, serverEntity) {
    const table = db[this.getTableName(entityType)];
    const mapped = this.mapServerToLocal(entityType, serverEntity);
    await table.update(localId, mapped);
  }

  /**
   * Helper: Map server field names to local (snake_case → camelCase)
   */
  mapServerToLocal(entityType, serverEntity) {
    const mapped = { ...serverEntity };
    
    // Convert snake_case to camelCase
    Object.keys(mapped).forEach(key => {
      if (key.includes('_')) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        if (camelKey !== key) {
          mapped[camelKey] = mapped[key];
          delete mapped[key];
        }
      }
    });

    // Add sync metadata
    mapped.lastSyncedAt = new Date();
    mapped.syncStatus = 'synced';

    return mapped;
  }

  /**
   * Helper: Get table name from entity type
   */
  getTableName(entityType) {
    const mapping = {
      'product': 'products',
      'customer': 'customers',
      'transaction': 'transactions',
      'transactionItem': 'transactionItems',
      'utang': 'utangLedger',
      'user': 'users',
      'tenant': 'tenants'
    };
    return mapping[entityType] || entityType + 's';
  }

  /**
   * Record conflict resolution for audit
   */
  async recordConflictResolution(entityType, entityId, resolution) {
    await db.syncMetadata.add({
      id: this.generateLocalId(),
      tenantId: (await db.settings.get('currentTenantId'))?.value,
      entityType,
      entityId,
      resolution,
      resolvedAt: new Date()
    });
  }

  /**
   * Start automatic background sync
   */
  startAutoSync(tenantId, userId, intervalMs = 30000) {
    this.syncInterval = setInterval(() => {
      this.syncAll(tenantId, userId).catch(console.error);
    }, intervalMs);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export default SyncManager;

