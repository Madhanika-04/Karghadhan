import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load settings from .env file
load_dotenv()

def run_migrations():
    db_url = os.getenv("DATABASE_URL")
    if not db_url or "your-project-ref" in db_url:
        print("Error: DATABASE_URL not found or not configured in .env file.")
        sys.exit(1)

    sql_file_path = os.path.join("sql", "001_initial_schema.sql")
    if not os.path.exists(sql_file_path):
        print(f"Error: SQL migration file not found at {sql_file_path}")
        sys.exit(1)

    print(f"Reading migration file: {sql_file_path}")
    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    print("Connecting to Supabase PostgreSQL database...")
    
    connection_attempts = []
    
    # Attempt 1: Try the original DATABASE_URL (Direct connection, standard port 5432)
    connection_attempts.append(("Direct Connection", db_url))
    
    # Attempt 2 & 3: If it's a Supabase direct domain, try connection pooler fallbacks
    if "db.zlsxzoxqtcwjtidlcinq.supabase.co" in db_url:
        # Pooler port 6543 (transaction mode)
        pooler_url_6543 = db_url.replace(
            "db.zlsxzoxqtcwjtidlcinq.supabase.co:5432", 
            "aws-0-ap-south-1.pooler.supabase.com:6543"
        ).replace("://postgres:", "://postgres.zlsxzoxqtcwjtidlcinq:")
        connection_attempts.append(("Pooler Connection (Port 6543 - Transaction Mode)", pooler_url_6543))
        
        # Pooler port 5432 (session mode)
        pooler_url_5432 = db_url.replace(
            "db.zlsxzoxqtcwjtidlcinq.supabase.co:5432", 
            "aws-0-ap-south-1.pooler.supabase.com:5432"
        ).replace("://postgres:", "://postgres.zlsxzoxqtcwjtidlcinq:")
        connection_attempts.append(("Pooler Connection (Port 5432 - Session Mode)", pooler_url_5432))

    conn = None
    last_error = None
    for name, url in connection_attempts:
        print(f"Trying connection via {name}...")
        try:
            conn = psycopg2.connect(url, connect_timeout=5)
            print(f"Successfully connected via {name}!")
            break
        except Exception as e:
            print(f"Failed to connect via {name}: {e}")
            last_error = e

    if not conn:
        print(f"\nError: All database connection attempts failed. Last error: {last_error}")
        print("Please check your database connection credentials and internet connectivity.")
        sys.exit(1)

    try:
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Executing migration statements...")
        cur.execute(sql_content)
        print("Migrations executed successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration execution failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migrations()
