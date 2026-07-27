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
    try:
        # Connect to DB. Since local DNS might fail IPv6 resolution, we try to fall back
        # to the IPv4 pooler hostname if the host is db.zlsxzoxqtcwjtidlcinq.supabase.co
        # host resolves to IPv6 only.
        if "db.zlsxzoxqtcwjtidlcinq.supabase.co" in db_url:
            print("Note: Detected default IPv6 database host. Translating connection to IPv4 pooler host for compatibility...")
            # Translate postgresql://postgres:Teamraisershhpm@db.zlsxzoxqtcwjtidlcinq.supabase.co:5432/postgres
            # to postgresql://postgres.zlsxzoxqtcwjtidlcinq:Teamraisershhpm@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
            db_url = db_url.replace(
                "db.zlsxzoxqtcwjtidlcinq.supabase.co:5432", 
                "aws-0-ap-south-1.pooler.supabase.com:6543"
            )
            # Add project reference suffix to the postgres username
            db_url = db_url.replace("://postgres:", "://postgres.zlsxzoxqtcwjtidlcinq:")

        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        print("Executing migration statements...")
        # Split sql_content into individual commands to handle errors or execute cleanly
        cur.execute(sql_content)
        print("Migrations executed successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migrations()
