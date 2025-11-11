# Production Database Scripts

## Overview

This directory contains database scripts designed specifically for **production deployment** that cannot be run through Flyway due to PostgreSQL transaction limitations.

## Why These Scripts Exist

### The Problem
- `CREATE INDEX CONCURRENTLY` is a non-transactional operation in PostgreSQL
- Flyway migrations run inside transactions by default
- Mixing transactional and non-transactional statements causes Flyway to fail

### The Solution
- **Development**: Migrations use standard `CREATE INDEX` (transactional, Flyway-compatible)
- **Production**: Use these scripts with `CREATE INDEX CONCURRENTLY` (zero-downtime)

## Benefits of CONCURRENTLY

✅ **Zero Downtime**: Indexes are created without locking the table
✅ **Non-Blocking**: Application continues to work during index creation
⚠️ **Slower**: Takes longer than standard index creation
⚠️ **Manual**: Must be run separately from Flyway migrations

## Usage

### Prerequisites
```bash
# Ensure you have psql installed
psql --version

# Set environment variables
export DB_HOST=your-production-host
export DB_NAME=muhasebe-okulu
export DB_USER=postgres
export DB_PASSWORD=your-password
```

### Execution

#### Method 1: Using psql (Recommended)
```bash
# Navigate to production directory
cd src/main/resources/db/production

# Run the concurrent index script
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f create_indexes_concurrent.sql

# Enter password when prompted
```

#### Method 2: Using pgAdmin
1. Open pgAdmin and connect to production database
2. Open Query Tool
3. Load `create_indexes_concurrent.sql`
4. Execute the script

### Monitoring Progress

While indexes are being created, monitor progress with:
```sql
-- Check index creation progress
SELECT
    phase,
    round(100.0 * blocks_done / nullif(blocks_total, 0), 1) AS "% complete",
    current_locker_pid,
    query
FROM pg_stat_progress_create_index;

-- Check active indexes being built
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

## Deployment Workflow

### Step 1: Deploy Application
```bash
# Deploy new application version with Flyway migrations
./mvnw clean package
java -jar target/muhasebe-okulu-5.jar
```

### Step 2: Run Concurrent Indexes (Off-Peak Hours)
```bash
# Run concurrent index creation (preferably during low-traffic period)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f create_indexes_concurrent.sql
```

### Step 3: Verify Indexes
```sql
-- Verify all indexes were created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Troubleshooting

### Index Creation Fails
```sql
-- Check for conflicting locks
SELECT
    locktype,
    database,
    relation::regclass,
    mode,
    granted
FROM pg_locks
WHERE NOT granted;

-- Drop incomplete index if CONCURRENTLY failed
DROP INDEX CONCURRENTLY IF EXISTS idx_name;
```

### Index Already Exists
- Script uses `IF NOT EXISTS` - safe to re-run
- Will skip existing indexes automatically

### Performance Impact
- Monitor server load during creation
- CONCURRENTLY is slower but safer for production
- Consider running during maintenance windows

## Files

- **create_indexes_concurrent.sql**: Main production index creation script
- **README.md**: This documentation

## Best Practices

1. ✅ Always test in staging environment first
2. ✅ Run during off-peak hours when possible
3. ✅ Monitor database performance during execution
4. ✅ Keep backups before major index changes
5. ✅ Verify indexes after creation
6. ❌ Never run through Flyway
7. ❌ Never run during peak traffic periods

## See Also

- [PostgreSQL Documentation: CREATE INDEX CONCURRENTLY](https://www.postgresql.org/docs/current/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY)
- [Flyway Documentation: Mixed Migrations](https://flywaydb.org/documentation/configuration/parameters/mixed)
