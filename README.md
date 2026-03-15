# Filipin POS - B2B SaaS POS System

A complete Offline-First PWA POS system tailored for small businesses in the Philippines (Sari-Sari stores and local shops).

## Features

### Cashier Mode (3-Second Checkout)
- **Quick-Tap Grid**: Large, color-coded buttons for top-selling items
- **Giant Numpad**: Manual price entry for unlisted items
- **Smart Change Calculator**: Instant change calculation
- **Quick Utang**: One-tap debt assignment

### Manager Dashboard
- **Z-Report**: Daily revenue split by Cash, GCash/Maya, and Utang
- **Utang Tracker**: Detailed debt ledger with overdue tracking
- **Inventory Management**: Product management with low-stock alerts
- **Quick-Tap Configuration**: Set up quick-tap buttons for fast checkout

### Technical Features
- **Offline-First**: Works completely offline using IndexedDB (Dexie.js)
- **Multi-Device Sync**: Conflict-free synchronization when internet is restored
- **Multi-Tenant**: Strict SQL schema with tenant_id isolation
- **Multi-Language**: English, Tagalog (Filipino), and Turkish support
- **Dark Mode**: Optimized for low-end Android devices
- **PWA**: Installable Progressive Web App

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Local DB**: Dexie.js (IndexedDB wrapper)
- **Backend**: Node.js + Express + PostgreSQL
- **Sync**: Timestamp-based with Last-Write-Wins (LWW) + Conflict Resolution

## Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb filipin_pos

# Run schema
psql -d filipin_pos -f database/schema.sql
```

### 2. Environment Variables

Create `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=filipin_pos
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
# Frontend (port 3000)
npm run dev

# Backend (port 3001)
npm run server
```

### 5. Build for Production

```bash
npm run build
```

## Architecture

### Database Schema

The system uses a strict multi-tenant architecture with `tenant_id` on every table:

- `tenants` - Store/tenant information
- `users` - RBAC users (cashier, manager, owner)
- `products` - Product catalog with quick-tap configuration
- `customers` - Customer information for Utang tracking
- `transactions` - Sales transactions
- `transaction_items` - Transaction line items
- `utang_ledger` - Debt tracking ledger
- `z_reports` - Daily sales summaries
- `sync_metadata` - Conflict resolution metadata

### Sync Algorithm

**Conflict Resolution Strategy:**

1. **Timestamp-Based (LWW)**: For most entities, last modified timestamp wins
2. **Additive for Transactions**: Transactions are never overwritten, only appended
3. **Conflict Detection**: Automatic detection and resolution with audit trail

**Sync Flow:**
1. Local operations are queued with `local_id` + `device_id` + timestamp
2. On sync, push local changes to server
3. Pull server changes and merge intelligently
4. Resolve conflicts using timestamp comparison
5. Update local entities with server IDs

### i18n Implementation

Translations are stored in `src/i18n/translations.js` with support for:
- English (en)
- Tagalog/Filipino (tl)
- Turkish (tr)

Language is detected from browser settings or localStorage preference.

## Project Structure

```
filipin-pos-system/
├── database/
│   └── schema.sql              # PostgreSQL DDL
├── server/
│   ├── index.js               # Express API server
│   └── api-client.js          # Frontend API client
├── src/
│   ├── db/
│   │   └── dexie-schema.js    # IndexedDB schema
│   ├── sync/
│   │   └── sync-algorithm.js  # Conflict-free sync logic
│   ├── i18n/
│   │   ├── translations.js    # Translation strings
│   │   └── i18n-context.jsx   # React context
│   ├── components/
│   │   ├── CashierMode.jsx    # Cashier interface
│   │   ├── ManagerDashboard.jsx
│   │   ├── ZReport.jsx
│   │   ├── UtangTracker.jsx
│   │   ├── Inventory.jsx
│   │   └── Login.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage

### Demo Login

- Username: `cashier` (Cashier Mode)
- Username: `manager` (Manager Dashboard)
- Password: Any (for demo purposes)

### Cashier Mode Workflow

1. Tap quick-tap buttons to add items to cart
2. Or use numpad to enter manual amounts
3. Enter cash received to see instant change calculation
4. Select payment method (Cash, GCash, Maya, Utang, Mixed)
5. For Utang, select customer before checkout
6. Complete transaction (saved offline, synced when online)

### Manager Dashboard

- **Dashboard**: View today's sales, revenue breakdown, low stock alerts
- **Z-Report**: Generate daily reports with payment method split
- **Utang Tracker**: View and manage customer debts
- **Inventory**: Add/edit products, configure quick-tap items

## Performance Optimizations

- Minimal re-renders with React hooks
- IndexedDB for fast local storage
- Dark mode to save battery on low-end devices
- Optimized for 3-second checkout workflow
- Large touch targets for mobile use

## License

MIT

