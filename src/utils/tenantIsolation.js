// ============================================
// TENANT ISOLATION UTILITIES
// Ensures all DB operations are scoped to tenant_id
// ============================================

import { db } from '../db/dexie-schema.js';

/**
 * Wraps a database query to ensure tenant isolation
 */
export function withTenantIsolation(tenantId, queryFn) {
  if (!tenantId) {
    throw new Error('Tenant ID is required for database operations');
  }
  return queryFn(tenantId);
}

/**
 * Safe database query builder with automatic tenant filtering
 */
export class TenantQuery {
  constructor(tenantId, tableName) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    this.tenantId = tenantId;
    this.table = db[tableName];
    if (!this.table) {
      throw new Error(`Table ${tableName} not found`);
    }
  }

  /**
   * Get all records for this tenant
   */
  async getAll(filters = {}) {
    let query = this.table.where('tenantId').equals(this.tenantId);
    
    const filterEntries = Object.entries(filters);
    if (filterEntries.length > 0) {
      return query.filter(record => 
        filterEntries.every(([key, value]) => record[key] === value)
      ).toArray();
    }
    
    return query.toArray();
  }

  /**
   * Get a single record by ID (with tenant check)
   */
  async getById(id) {
    if (!id) return null;
    const record = await this.table.get(id);
    if (record && record.tenantId === this.tenantId) {
      return record;
    }
    return null;
  }

  /**
   * Add a record (automatically adds tenantId)
   */
  async add(data) {
    return this.table.add({
      ...data,
      tenantId: this.tenantId
    });
  }

  /**
   * Update a record (with tenant check)
   */
  async update(id, updates) {
    const record = await this.table.get(id);
    if (record && record.tenantId === this.tenantId) {
      return this.table.update(id, updates);
    }
    throw new Error('Record not found or tenant mismatch');
  }

  /**
   * Delete a record (with tenant check)
   */
  async delete(id) {
    const record = await this.table.get(id);
    if (record && record.tenantId === this.tenantId) {
      return this.table.delete(id);
    }
    throw new Error('Record not found or tenant mismatch');
  }

  /**
   * Safe database query using tenantId and filtered predicate.
   * Eliminates reliance on fickle compound indexes for mission-critical operations.
   */
  where(key, value) {
    return this.table
      .where('tenantId')
      .equals(this.tenantId)
      .filter(record => record[key] === value);
  }

  /**
   * Query with multiple conditions
   */
  whereMultiple(conditions = {}) {
    let query = this.table.where('tenantId').equals(this.tenantId);
    const filterEntries = Object.entries(conditions);
    
    if (filterEntries.length === 0) return query;

    return query.filter(record => 
      filterEntries.every(([key, value]) => record[key] === value)
    );
  }
}

/**
 * Create a tenant-scoped query helper
 */
export function createTenantQuery(tenantId, tableName) {
  if (!tenantId) {
    console.warn(`[TenantQuery] WARNING: createTenantQuery called without tenantId for table: ${tableName}`);
  }
  return new TenantQuery(tenantId, tableName);
}

