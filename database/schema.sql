-- ============================================
-- FILIPIN POS SYSTEM - MULTI-TENANT SCHEMA
-- PostgreSQL Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TENANT MANAGEMENT
-- ============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'PHP',
    timezone VARCHAR(50) DEFAULT 'Asia/Manila',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_tenants_active ON tenants(is_active);

-- ============================================
-- USER MANAGEMENT (RBAC)
-- ============================================

CREATE TYPE user_role AS ENUM ('cashier', 'manager', 'owner');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, username)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- PRODUCT CATALOG
-- ============================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_tagalog VARCHAR(255),
    name_turkish VARCHAR(255),
    barcode VARCHAR(100),
    sku VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2),
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'pcs',
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    low_stock_threshold DECIMAL(10, 2) DEFAULT 5,
    is_quick_tap BOOLEAN DEFAULT false,
    quick_tap_color VARCHAR(50),
    quick_tap_order INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    local_id VARCHAR(100) -- For offline sync tracking
);

CREATE INDEX idx_products_tenant ON products(tenant_id);
CREATE INDEX idx_products_quick_tap ON products(tenant_id, is_quick_tap, quick_tap_order) WHERE is_quick_tap = true;
CREATE INDEX idx_products_barcode ON products(tenant_id, barcode);
CREATE INDEX idx_products_active ON products(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- CUSTOMERS (UTANG TRACKING)
-- ============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    credit_limit DECIMAL(10, 2) DEFAULT 0,
    total_utang DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    local_id VARCHAR(100)
);

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_active ON customers(tenant_id, is_active) WHERE is_active = true;

-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE TYPE payment_method AS ENUM ('cash', 'gcash', 'maya', 'utang', 'mixed');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'synced');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    transaction_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    cash_amount DECIMAL(10, 2) DEFAULT 0,
    digital_amount DECIMAL(10, 2) DEFAULT 0, -- GCash/Maya
    utang_amount DECIMAL(10, 2) DEFAULT 0,
    change_amount DECIMAL(10, 2) DEFAULT 0,
    payment_method payment_method NOT NULL,
    status transaction_status DEFAULT 'completed',
    notes TEXT,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(50) DEFAULT 'pending',
    local_id VARCHAR(100) NOT NULL,
    device_id VARCHAR(100),
    UNIQUE(tenant_id, local_id, device_id)
);

CREATE INDEX idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(tenant_id, transaction_date);
CREATE INDEX idx_transactions_sync ON transactions(tenant_id, sync_status) WHERE sync_status = 'pending';
CREATE INDEX idx_transactions_local ON transactions(tenant_id, local_id, device_id);

-- ============================================
-- TRANSACTION ITEMS
-- ============================================

CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- Snapshot for historical accuracy
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    local_id VARCHAR(100)
);

CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);
CREATE INDEX idx_transaction_items_tenant ON transaction_items(tenant_id);

-- ============================================
-- UTANG LEDGER (DEBT TRACKING)
-- ============================================

CREATE TYPE utang_status AS ENUM ('pending', 'partial', 'paid', 'overdue');

CREATE TABLE utang_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    remaining_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    status utang_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    local_id VARCHAR(100)
);

CREATE INDEX idx_utang_ledger_customer ON utang_ledger(customer_id);
CREATE INDEX idx_utang_ledger_transaction ON utang_ledger(transaction_id);
CREATE INDEX idx_utang_ledger_status ON utang_ledger(tenant_id, status);
CREATE INDEX idx_utang_ledger_due_date ON utang_ledger(tenant_id, due_date) WHERE status IN ('pending', 'partial');

-- ============================================
-- SYNC METADATA (For Conflict Resolution)
-- ============================================

CREATE TABLE sync_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'transaction', 'product', 'customer', etc.
    entity_id UUID NOT NULL,
    local_id VARCHAR(100),
    device_id VARCHAR(100),
    version INTEGER DEFAULT 1,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    conflict_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, entity_type, local_id, device_id)
);

CREATE INDEX idx_sync_metadata_tenant ON sync_metadata(tenant_id);
CREATE INDEX idx_sync_metadata_entity ON sync_metadata(tenant_id, entity_type, last_modified);
CREATE INDEX idx_sync_metadata_conflicts ON sync_metadata(tenant_id, conflict_resolved) WHERE conflict_resolved = false;

-- ============================================
-- Z-REPORT DATA (Daily Sales Summary)
-- ============================================

CREATE TABLE z_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    report_date DATE NOT NULL,
    total_transactions INTEGER DEFAULT 0,
    total_cash DECIMAL(10, 2) DEFAULT 0,
    total_digital DECIMAL(10, 2) DEFAULT 0,
    total_utang DECIMAL(10, 2) DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, report_date)
);

CREATE INDEX idx_z_reports_tenant ON z_reports(tenant_id);
CREATE INDEX idx_z_reports_date ON z_reports(tenant_id, report_date);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utang_ledger_updated_at BEFORE UPDATE ON utang_ledger
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a sample tenant
INSERT INTO tenants (id, name, business_name, address, phone, email) VALUES
('00000000-0000-0000-0000-000000000001', 'Sample Store', 'Sari-Sari Store #1', 'Manila, Philippines', '+63-912-345-6789', 'store@example.com');

-- Insert a sample manager user (password: 'manager123' - hash this in production)
INSERT INTO users (tenant_id, username, password_hash, full_name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'manager', '$2a$10$YourHashedPasswordHere', 'Store Manager', 'manager');

-- Insert a sample cashier user (password: 'cashier123')
INSERT INTO users (tenant_id, username, password_hash, full_name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'cashier', '$2a$10$YourHashedPasswordHere', 'Cashier One', 'cashier');

