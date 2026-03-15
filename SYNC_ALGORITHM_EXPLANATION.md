# Conflict-Free Sync Algorithm - Detailed Explanation

## Overview

The sync algorithm implements a **hybrid approach** combining:
1. **Timestamp-Based Last-Write-Wins (LWW)** for most entities
2. **Additive merging** for transactions (never overwritten)
3. **Conflict detection and resolution** with audit trail

## Key Concepts

### Local ID System

Every entity created offline gets:
- `local_id`: Unique identifier (e.g., `local_1234567890_abc123`)
- `device_id`: Device identifier (e.g., `device_1234567890_xyz789`)
- `timestamp`: Creation/modification timestamp

### Server ID Mapping

When synced to server:
- Server assigns a UUID `server_id`
- Local entity is updated with `server_id`
- `local_id` is preserved for reference

## Sync Flow

### Phase 1: Push Local Changes

1. **Queue Collection**: Gather all pending operations from `syncQueue`
2. **Group by Entity Type**: Organize operations by entity type
3. **Batch Push**: Send grouped operations to server
4. **ID Mapping**: Update local entities with server-assigned IDs
5. **Mark as Synced**: Update sync status

### Phase 2: Pull Server Changes

1. **Get Last Sync Time**: Retrieve last successful sync timestamp
2. **Fetch Changes**: Request all entities modified since last sync
3. **Merge Logic**: For each server entity:
   - If local doesn't exist → Add server version
   - If local has no `local_id` → Server wins (already synced)
   - If both modified → Compare timestamps (LWW)
   - If timestamps equal → Server wins (authoritative)

### Phase 3: Conflict Resolution

#### Standard Entities (Products, Customers)

```javascript
if (serverTime > localTime) {
  // Server is newer - update local
  updateLocalEntity(serverEntity);
} else if (localTime > serverTime) {
  // Local is newer - queue for push
  queueOperation('update', localEntity);
} else {
  // Same timestamp - server wins
  updateLocalEntity(serverEntity);
}
```

#### Transactions (Special Case)

Transactions are **never overwritten** because:
- They represent immutable business events
- Overwriting could cause data loss
- Multiple devices can create transactions simultaneously

**Transaction Conflict Resolution:**
1. Check if server has transaction with same `local_id` + `device_id`
2. If yes → Update local `id` to server `id`, mark as synced
3. If no → Queue for push (new transaction)
4. Transaction items are merged with transaction

## Conflict Detection

Conflicts are detected when:
- Same entity modified on multiple devices
- Timestamps are very close (within sync window)
- Both local and server have modifications

## Conflict Resolution Strategies

### 1. Last-Write-Wins (LWW)
- **Use Case**: Products, Customers, Settings
- **Logic**: Entity with latest `updated_at` timestamp wins
- **Advantage**: Simple, deterministic
- **Disadvantage**: May lose recent changes if device clock is wrong

### 2. Additive Merging
- **Use Case**: Transactions, Transaction Items
- **Logic**: Never overwrite, only append
- **Advantage**: No data loss
- **Disadvantage**: May create duplicates if not handled carefully

### 3. Manual Resolution
- **Use Case**: Critical conflicts (future enhancement)
- **Logic**: Flag conflict, require user intervention
- **Advantage**: User control
- **Disadvantage**: Requires UI and user attention

## Sync Metadata

Every sync operation is tracked in `sync_metadata` table:

```sql
CREATE TABLE sync_metadata (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    entity_type VARCHAR(50),
    entity_id UUID,
    local_id VARCHAR(100),
    device_id VARCHAR(100),
    version INTEGER,
    last_modified TIMESTAMP,
    conflict_resolved BOOLEAN
);
```

This enables:
- Audit trail of all sync operations
- Conflict history
- Debugging sync issues
- Rollback capabilities (future)

## Error Handling

### Network Errors
- Operations remain in `syncQueue`
- Retry count incremented
- Exponential backoff on retries
- Max retries: 5 (configurable)

### Data Validation Errors
- Invalid data is skipped
- Error logged to sync metadata
- User notification (future)

### Partial Sync Failures
- Successful operations are committed
- Failed operations remain queued
- Next sync will retry failed operations

## Performance Optimizations

1. **Batch Operations**: Group multiple operations per entity type
2. **Incremental Sync**: Only fetch changes since last sync
3. **Indexed Queries**: Use database indexes for fast lookups
4. **Parallel Processing**: Process multiple entity types concurrently
5. **Compression**: Compress large payloads (future)

## Example Scenario

### Scenario: Two Cashiers Working Offline

**Cashier A (Device 1):**
- Creates Transaction TX-001 at 10:00 AM
- Adds Product A to inventory at 10:05 AM

**Cashier B (Device 2):**
- Creates Transaction TX-002 at 10:03 AM
- Updates Product A price at 10:07 AM

**When Internet Restored:**

1. **Push Phase:**
   - Device 1 pushes TX-001 and Product A creation
   - Device 2 pushes TX-002 and Product A update

2. **Pull Phase:**
   - Device 1 receives TX-002 and Product A update (10:07 > 10:05)
   - Device 2 receives TX-001 and Product A creation (but update wins)

3. **Result:**
   - Both devices have TX-001 and TX-002
   - Product A has updated price (10:07 version)
   - No data loss, conflicts resolved automatically

## Future Enhancements

1. **CRDT Implementation**: For more sophisticated conflict resolution
2. **Vector Clocks**: Better timestamp accuracy across devices
3. **Operational Transformation**: For collaborative editing
4. **Conflict UI**: Allow users to manually resolve conflicts
5. **Sync Analytics**: Dashboard showing sync health and conflicts

