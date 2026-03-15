# Filipin POS - Architecture Documentation

## System Overview

Filipin POS is a complete B2B SaaS POS system designed for small businesses in the Philippines. It's built as an **Offline-First Progressive Web App (PWA)** that works seamlessly even with unstable internet connections.

## Core Architecture Principles

### 1. Offline-First Design
- All operations work offline using IndexedDB (via Dexie.js)
- Data is queued locally and synced when internet is available
- No blocking operations that require network connectivity

### 2. Multi-Tenant Architecture
- Strict tenant isolation using `tenant_id` on every table
- Supports thousands of shops on a single database instance
- Tenant data is completely isolated at the database level

### 3. Conflict-Free Synchronization
- Timestamp-based Last-Write-Wins (LWW) for most entities
- Additive merging for transactions (never overwritten)
- Automatic conflict detection and resolution

### 4. Performance Optimization
- Optimized for low-end Android devices (2021 models)
- Dark mode to save battery
- Minimal RAM usage
- Large touch targets for mobile use

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Dexie.js** - IndexedDB wrapper for offline storage
- **React Router** - Client-side routing
- **Zustand** (optional) - State management

### Backend
- **Node.js + Express** - API server
- **PostgreSQL** - Primary database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - Authentication tokens

### PWA
- **Vite PWA Plugin** - Service worker generation
- **Workbox** - Service worker strategies

## Database Schema

### Multi-Tenant Design

Every table includes `tenant_id` for strict isolation:

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    -- ... other fields
);
```

### Core Tables

1. **tenants** - Store/tenant information
2. **users** - RBAC users (cashier, manager, owner)
3. **products** - Product catalog with quick-tap configuration
4. **customers** - Customer information for Utang tracking
5. **transactions** - Sales transactions
6. **transaction_items** - Transaction line items
7. **utang_ledger** - Debt tracking ledger
8. **z_reports** - Daily sales summaries
9. **sync_metadata** - Conflict resolution metadata

## Data Flow

### Cashier Mode Workflow

1. **User Action** → Add item to cart
2. **Local Storage** → Save to IndexedDB immediately
3. **UI Update** → React state updates
4. **Checkout** → Create transaction in IndexedDB
5. **Sync Queue** → Add to sync queue for later
6. **Background Sync** → When online, push to server

### Sync Flow

```
[Device 1 Offline]          [Device 2 Offline]
      |                            |
      | Create TX-001              | Create TX-002
      |                            |
      v                            v
[Local IndexedDB]          [Local IndexedDB]
      |                            |
      | Internet Restored          |
      |                            |
      v                            v
[Sync Manager]             [Sync Manager]
      |                            |
      | Push local changes         | Push local changes
      | Pull server changes        | Pull server changes
      |                            |
      v                            v
[Server PostgreSQL]        [Server PostgreSQL]
      |                            |
      | Merge & Resolve Conflicts  |
      |                            |
      v                            v
[Both devices synced]      [Both devices synced]
```

## Sync Algorithm Details

### Conflict Resolution Strategy

#### For Standard Entities (Products, Customers)

1. **Compare Timestamps**
   - Server timestamp > Local timestamp → Server wins
   - Local timestamp > Server timestamp → Local wins (queue for push)
   - Timestamps equal → Server wins (authoritative)

2. **Update Local Database**
   - If server wins: Update local entity
   - If local wins: Keep local, queue for push

#### For Transactions

Transactions are **never overwritten** because:
- They represent immutable business events
- Multiple devices can create transactions simultaneously
- Overwriting could cause data loss

**Transaction Resolution:**
1. Check if server has transaction with same `local_id` + `device_id`
2. If yes → Update local `id` to server `id`, mark as synced
3. If no → Queue for push (new transaction)

### Sync Metadata

Every sync operation is tracked:

```javascript
{
  entityType: 'transaction',
  entityId: 'uuid',
  localId: 'local_123',
  deviceId: 'device_456',
  version: 1,
  lastModified: '2024-01-01T10:00:00Z',
  conflictResolved: false
}
```

## UI/UX Design Principles

### Cashier Mode (3-Second Checkout)

1. **Quick-Tap Grid**
   - Large, color-coded buttons (80px minimum height)
   - Top-selling items only
   - Visual color coding for easy recognition

2. **Giant Numpad**
   - Large touch targets (minimum 48px)
   - Clear visual feedback
   - Optimized for one-handed use

3. **Change Calculator**
   - Massive display (text-4xl)
   - Instant calculation
   - Color-coded (green for positive, red for negative)

4. **Utang Button**
   - One-tap debt assignment
   - Quick customer selection
   - Visual confirmation

### Manager Dashboard

1. **Z-Report**
   - Daily revenue breakdown
   - Payment method split (Cash, GCash, Maya, Utang)
   - Transaction details

2. **Utang Tracker**
   - Customer debt ledger
   - Overdue highlighting
   - Payment tracking

3. **Inventory**
   - Product management
   - Quick-tap configuration
   - Low stock alerts

## Security Considerations

### Authentication
- JWT tokens for API authentication
- Password hashing with bcrypt
- Session management

### Data Isolation
- Strict tenant_id filtering on all queries
- Row-level security (future enhancement)
- API endpoint validation

### Offline Security
- Local data encrypted (future enhancement)
- Secure IndexedDB access
- No sensitive data in localStorage

## Performance Optimizations

### Frontend
- Code splitting with React.lazy
- Image optimization
- Minimal bundle size
- Efficient re-renders with React hooks

### Database
- Indexed queries on tenant_id
- Composite indexes for common queries
- Connection pooling

### Sync
- Batch operations
- Incremental sync (only changes since last sync)
- Parallel processing

## Deployment

### Frontend (PWA)
- Build with Vite: `npm run build`
- Deploy to CDN (Cloudflare, AWS CloudFront)
- Service worker for offline support

### Backend
- Node.js server on VPS or cloud (AWS, DigitalOcean)
- PostgreSQL database (managed or self-hosted)
- Environment variables for configuration

### Database
- PostgreSQL 12+ required
- Run schema.sql to initialize
- Regular backups recommended

## Future Enhancements

1. **CRDT Implementation** - More sophisticated conflict resolution
2. **Vector Clocks** - Better timestamp accuracy
3. **Real-time Sync** - WebSocket for instant updates
4. **Analytics Dashboard** - Sales trends, inventory insights
5. **Barcode Scanner** - Hardware integration
6. **Receipt Printing** - Thermal printer support
7. **Multi-Currency** - Support for different currencies
8. **Advanced Reporting** - Custom reports, exports

## Troubleshooting

### Sync Issues
- Check network connectivity
- Verify device_id is unique
- Check sync_metadata for conflicts
- Review server logs

### Performance Issues
- Clear IndexedDB cache
- Check database indexes
- Monitor memory usage
- Review bundle size

### Offline Issues
- Verify service worker is active
- Check IndexedDB quota
- Review sync queue status

