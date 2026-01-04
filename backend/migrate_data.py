#!/usr/bin/env python3
"""
Migration script to transfer data from SQLite to PostgreSQL
Run this after PostgreSQL is up but before starting the new backend
"""
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import os
import sys

SQLITE_PATH = os.getenv("SQLITE_PATH", "/app/atems_backup.db")
PG_URL = os.getenv("DATABASE_URL", "postgresql://atems:atems_secure_pwd_2026@db:5432/atems")

# Parse PostgreSQL URL
def parse_pg_url(url):
    # postgresql://user:pass@host:port/db
    url = url.replace("postgresql://", "")
    user_pass, host_db = url.split("@")
    user, password = user_pass.split(":")
    host_port, db = host_db.split("/")
    if ":" in host_port:
        host, port = host_port.split(":")
    else:
        host, port = host_port, "5432"
    return {"host": host, "port": port, "user": user, "password": password, "dbname": db}

# Tables to migrate in order (respecting foreign keys)
TABLES = [
    "departments",
    "categories", 
    "users",
    "tenders",
    "tender_documents",
    "tender_eligibility",
    "evaluation_criteria",
    "bidders",
    "bids",
    "bid_documents",
    "bank_guarantees",
    "evaluations",
    "evaluation_committee",
    "rfis",
    "audit_logs",
    "notifications",
    "rfp_templates",
    "clause_library"
]

def get_table_columns(sqlite_cur, table):
    sqlite_cur.execute(f"PRAGMA table_info({table})")
    return [row[1] for row in sqlite_cur.fetchall()]

def migrate_table(sqlite_cur, pg_cur, table):
    try:
        # Get columns
        columns = get_table_columns(sqlite_cur, table)
        if not columns:
            print(f"  ⚠️  Table {table} not found in SQLite, skipping")
            return 0
        
        # Get data from SQLite
        sqlite_cur.execute(f"SELECT * FROM {table}")
        rows = sqlite_cur.fetchall()
        
        if not rows:
            print(f"  ℹ️  Table {table}: 0 rows")
            return 0
        
        # Insert into PostgreSQL
        cols_str = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))
        
        # Clear existing data
        pg_cur.execute(f"DELETE FROM {table}")
        
        # Insert data
        insert_sql = f"INSERT INTO {table} ({cols_str}) VALUES ({placeholders})"
        for row in rows:
            try:
                pg_cur.execute(insert_sql, row)
            except Exception as e:
                print(f"  ⚠️  Error inserting row in {table}: {e}")
                continue
        
        # Reset sequence if table has id column
        if 'id' in columns:
            pg_cur.execute(f"""
                SELECT setval(pg_get_serial_sequence('{table}', 'id'), 
                       COALESCE((SELECT MAX(id) FROM {table}), 1))
            """)
        
        print(f"  ✅ Table {table}: {len(rows)} rows migrated")
        return len(rows)
    except Exception as e:
        print(f"  ❌ Error migrating {table}: {e}")
        return 0

def main():
    print("🔄 ATEMS Data Migration: SQLite → PostgreSQL")
    print("=" * 50)
    
    # Check if SQLite file exists
    if not os.path.exists(SQLITE_PATH):
        print(f"❌ SQLite database not found at {SQLITE_PATH}")
        print("   Place the backup file and set SQLITE_PATH env var")
        sys.exit(1)
    
    print(f"📂 Source: {SQLITE_PATH}")
    print(f"📂 Target: PostgreSQL")
    
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_cur = sqlite_conn.cursor()
    
    # Connect to PostgreSQL
    pg_params = parse_pg_url(PG_URL)
    pg_conn = psycopg2.connect(**pg_params)
    pg_cur = pg_conn.cursor()
    
    print("\n📊 Migrating tables...")
    total_rows = 0
    
    for table in TABLES:
        rows = migrate_table(sqlite_cur, pg_cur, table)
        total_rows += rows
    
    # Commit changes
    pg_conn.commit()
    
    print("\n" + "=" * 50)
    print(f"✅ Migration complete! Total rows: {total_rows}")
    
    # Cleanup
    sqlite_conn.close()
    pg_conn.close()

if __name__ == "__main__":
    main()
