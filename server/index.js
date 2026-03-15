// ============================================
// EXPRESS SERVER - API Endpoints for Sync
// ============================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'filipin_pos',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// SYNC ENDPOINTS
// ============================================

// Push local changes to server
app.post('/api/sync/push/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const { entityType, operations } = req.body;

  try {
    const mappings = {};

    for (const op of operations) {
      if (op.operation === 'create') {
        const serverId = await createEntity(tenantId, entityType, op.data);
        mappings[op.entityId] = serverId;
      } else if (op.operation === 'update') {
        await updateEntity(tenantId, entityType, op.entityId, op.data);
      } else if (op.operation === 'delete') {
        await deleteEntity(tenantId, entityType, op.entityId);
      }
    }

    res.json({ success: true, mappings });
  } catch (error) {
    console.error('Sync push error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pull server changes
app.get('/api/sync/pull/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const { since } = req.query;

  try {
    const changes = {
      products: await getEntityChanges(tenantId, 'products', since),
      customers: await getEntityChanges(tenantId, 'customers', since),
      transactions: await getEntityChanges(tenantId, 'transactions', since),
      transactionItems: await getEntityChanges(tenantId, 'transaction_items', since),
      utangLedger: await getEntityChanges(tenantId, 'utang_ledger', since),
    };

    res.json(changes);
  } catch (error) {
    console.error('Sync pull error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function createEntity(tenantId, entityType, data) {
  const tableName = getTableName(entityType);
  const columns = Object.keys(data).filter(k => k !== 'id' && k !== 'localId');
  const values = columns.map(col => data[col]);
  const placeholders = values.map((_, i) => `$${i + 2}`).join(', ');

  const query = `
    INSERT INTO ${tableName} (tenant_id, ${columns.join(', ')})
    VALUES ($1, ${placeholders})
    RETURNING id
  `;

  const result = await pool.query(query, [tenantId, ...values]);
  return result.rows[0].id;
}

async function updateEntity(tenantId, entityType, entityId, data) {
  const tableName = getTableName(entityType);
  const columns = Object.keys(data).filter(k => k !== 'id' && k !== 'tenantId');
  const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');

  const query = `
    UPDATE ${tableName}
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $${columns.length + 2}
  `;

  const values = columns.map(col => data[col]);
  await pool.query(query, [entityId, ...values, tenantId]);
}

async function deleteEntity(tenantId, entityType, entityId) {
  const tableName = getTableName(entityType);
  const query = `
    UPDATE ${tableName}
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND tenant_id = $2
  `;
  await pool.query(query, [entityId, tenantId]);
}

async function getEntityChanges(tenantId, entityType, since) {
  const tableName = getTableName(entityType);
  const sinceDate = since || '1970-01-01';

  const query = `
    SELECT *
    FROM ${tableName}
    WHERE tenant_id = $1
      AND (updated_at > $2 OR created_at > $2)
    ORDER BY updated_at ASC
  `;

  const result = await pool.query(query, [tenantId, sinceDate]);
  return result.rows.map(row => mapToCamelCase(row));
}

function getTableName(entityType) {
  const mapping = {
    'product': 'products',
    'customer': 'customers',
    'transaction': 'transactions',
    'transactionItem': 'transaction_items',
    'utang': 'utang_ledger',
    'products': 'products',
    'customers': 'customers',
    'transactions': 'transactions',
    'transaction_items': 'transaction_items',
    'utangLedger': 'utang_ledger'
  };
  return mapping[entityType] || entityType;
}

function mapToCamelCase(row) {
  const mapped = {};
  Object.keys(row).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    mapped[camelKey] = row[key];
    // Keep original key for compatibility
    mapped[key] = row[key];
  });
  return mapped;
}

// ============================================
// AUTH ENDPOINTS
// ============================================

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, tenant_id, username, full_name, role FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    // In production, verify password with bcrypt
    // For now, return user data

    res.json({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      tenantId: user.tenant_id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

