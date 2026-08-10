import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'patchpilot.db')

def get_db_connection():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vulnerabilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cve_id TEXT UNIQUE NOT NULL,
            summary TEXT,
            cvss REAL,
            severity TEXT,
            cwe_code TEXT,
            cwe_name TEXT,
            access_authentication TEXT,
            access_complexity TEXT,
            access_vector TEXT,
            impact_availability TEXT,
            impact_confidentiality TEXT,
            impact_integrity TEXT,
            pub_date TEXT,
            mod_date TEXT,
            cve_age_days REAL,
            vendor TEXT,
            vulnerable_product TEXT,
            vendor_count INTEGER DEFAULT 1,
            product_count INTEGER DEFAULT 1,
            summary_length INTEGER DEFAULT 100,
            ml_priority TEXT,
            ml_confidence REAL,
            probabilities TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Ensure probabilities column exists if upgrading from previous version
    try:
        cursor.execute("ALTER TABLE vulnerabilities ADD COLUMN probabilities TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists

    # Create indexes for fast lookup
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_cve_id ON vulnerabilities (cve_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_severity ON vulnerabilities (severity)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_ml_priority ON vulnerabilities (ml_priority)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_vendor ON vulnerabilities (vendor)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_product ON vulnerabilities (vulnerable_product)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_cvss ON vulnerabilities (cvss)')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print(f"SQLite database initialized at {DB_PATH}")
