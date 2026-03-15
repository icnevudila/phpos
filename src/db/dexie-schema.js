// ============================================
// DEXIE.JS SCHEMA - OFFLINE-FIRST LOCAL DATABASE
// Matches PostgreSQL structure for seamless sync
// ============================================

import Dexie from 'dexie';

export class FilipinPOSDB extends Dexie {
  constructor() {
    super('FilipinPOSDB');
    
    // Define schema version 3 - Added cashActivity table
    this.version(3).stores({
      // Core tenant and user data
      tenants: 'id, name, isActive',
      users: 'id, tenantId, username, role, isActive',
      
      // Product catalog (offline cache) - Added [tenantId+isActive] and [tenantId+isQuickTap]
      products: 'id, tenantId, name, barcode, isQuickTap, quickTapOrder, isActive, localId, lastSyncedAt, [tenantId+isActive], [tenantId+isQuickTap]',
      
      // Customers for Utang tracking
      customers: 'id, tenantId, name, phone, isActive, localId, lastSyncedAt',
      
      // Transactions (offline-first) - Added [tenantId+status]
      transactions: 'id, tenantId, userId, customerId, transactionNumber, transactionDate, status, syncStatus, localId, deviceId, lastSyncedAt, [tenantId+status]',
      
      // Transaction items
      transactionItems: 'id, tenantId, transactionId, productId, localId, lastSyncedAt',
      
      // Utang ledger - Added [tenantId+status]
      utangLedger: 'id, tenantId, customerId, transactionId, status, dueDate, localId, lastSyncedAt, [tenantId+status]',
      
      // Sync queue (pending operations)
      syncQueue: '++id, entityType, entityId, operation, timestamp, retryCount',
      
      // Sync metadata for conflict resolution
      syncMetadata: 'id, tenantId, entityType, entityId, localId, deviceId, version, lastModified',
      
      // Z-reports cache
      zReports: 'id, tenantId, reportDate',
      
      // Settings and preferences
      settings: 'key',
      
      // Cash activity for pay-in/pay-out - Added [tenantId+type]
      cashActivity: 'id, tenantId, type, timestamp, [tenantId+type]',
      
      // Device info for multi-device sync
      deviceInfo: 'id'
    });
    
    // Define table classes for type safety
    this.tenants = this.table('tenants');
    this.users = this.table('users');
    this.products = this.table('products');
    this.customers = this.table('customers');
    this.transactions = this.table('transactions');
    this.transactionItems = this.table('transactionItems');
    this.utangLedger = this.table('utangLedger');
    this.syncQueue = this.table('syncQueue');
    this.syncMetadata = this.table('syncMetadata');
    this.zReports = this.table('zReports');
    this.settings = this.table('settings');
    this.deviceInfo = this.table('deviceInfo');
  }
}

// Create singleton instance
export const db = new FilipinPOSDB();

// Initialize device ID on first load
export async function initializeDevice() {
  const deviceInfo = await db.deviceInfo.get('device');
  if (!deviceInfo) {
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.deviceInfo.put({ id: 'device', deviceId, createdAt: new Date() });
    return deviceId;
  }
  return deviceInfo.deviceId;
}

// Get device ID
export async function getDeviceId() {
  const deviceInfo = await db.deviceInfo.get('device');
  return deviceInfo?.deviceId || await initializeDevice();
}

