import psycopg2
from core.config import DATABASE_URL
import re

print(f"Current DATABASE_URL: {DATABASE_URL}")

# Parse the DATABASE_URL to get connection parameters
# Handle both formats: 
# postgresql://username:password@host:port/database_name
# postgresql://username:password@host/database_name (default port 5432)
url_pattern = r'postgresql://([^:]+):([^@]+)@([^:]+)(?::(\d+))?/(.+)'
match = re.match(url_pattern, DATABASE_URL)

if match:
    username, password, host, port, database = match.groups()
    # Use default port 5432 if not specified
    port = port if port else '5432'
    
    print(f"Parsed connection details:")
    print(f"  Host: {host}")
    print(f"  Port: {port}")
    print(f"  Database: {database}")
    print(f"  Username: {username}")
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=database,
            user=username,
            password=password
        )
        
        cursor = conn.cursor()
        
        # Get all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print('\nTables in the database:')
        for table in tables:
            print(f"- {table[0]}")
            
        # Check if vaccination_events table exists
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'vaccination_events'
            ORDER BY ordinal_position;
        """)
        
        columns = cursor.fetchall()
        if columns:
            print(f"\nvaccination_events table columns:")
            for column in columns:
                nullable = "NULL" if column[2] == "YES" else "NOT NULL"
                print(f"- {column[0]}: {column[1]} {nullable}")
        else:
            print("\nvaccination_events table not found!")
            
        conn.close()
        
    except Exception as e:
        print(f"Error connecting to database: {e}")
        print("\nMake sure:")
        print("1. PostgreSQL is running")
        print("2. Your .env file has the correct DATABASE_URL")
        print("3. The database exists and is accessible")
else:
    print("Could not parse DATABASE_URL")
    print("Expected format: postgresql://username:password@host[:port]/database_name")
    print("Current format:", DATABASE_URL) 