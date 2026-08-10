import os
import sys
import pandas as pd
import numpy as np
import sqlite3

# Add backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db import init_db, get_db_connection

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')

def derive_patch_priority(row):
    """
    Derived Patch Prioritization Policy Function
    --------------------------------------------
    NOTE: These labels represent a derived prioritization policy based on CVSS, severity,
    impact metrics, and access vectors — they do not represent real-world historical patch decisions.
    """
    cvss = float(row.get('cvss', 0.0))
    severity = str(row.get('severity', '')).strip().upper()
    access_vec = str(row.get('access_vector', '')).strip().upper()
    access_comp = str(row.get('access_complexity', '')).strip().upper()
    imp_avail = str(row.get('impact_availability', '')).strip().upper()
    imp_conf = str(row.get('impact_confidentiality', '')).strip().upper()
    imp_integ = str(row.get('impact_integrity', '')).strip().upper()

    if cvss >= 9.0:
        priority = 'CRITICAL'
    elif cvss >= 7.0:
        priority = 'HIGH'
    elif cvss >= 4.0:
        priority = 'MEDIUM'
    else:
        priority = 'LOW'

    # Refinements
    if priority == 'HIGH' and cvss >= 8.0 and access_vec == 'NETWORK' and access_comp == 'LOW' and (imp_avail == 'HIGH' or imp_conf == 'HIGH'):
        priority = 'CRITICAL'
    elif priority == 'MEDIUM' and (severity == 'HIGH' or (imp_avail == 'HIGH' and imp_conf == 'HIGH' and imp_integ == 'HIGH')):
        priority = 'HIGH'
    elif priority == 'LOW' and severity in ['HIGH', 'MEDIUM']:
        priority = 'MEDIUM'

    return priority

def import_and_ingest_data():
    """
    Data Import Pipeline:
    1. Read 4 raw Kaggle CSV files
    2. Clean missing/invalid values & drop duplicates
    3. Aggregate vendor & product information
    4. Join datasets on cve_id
    5. Save backend/data/processed/vulnerabilities_processed.csv
    6. Populate SQLite database (backend/data/patchpilot.db)
    """
    print("=" * 60)
    print("      PATCHPILOT AI - KAGGLE DATA INGESTION PIPELINE")
    print("=" * 60)

    init_db()

    cve_path = os.path.join(RAW_DIR, 'cleaned_cve.csv')
    vendors_path = os.path.join(RAW_DIR, 'cleaned_vendors.csv')
    products_path = os.path.join(RAW_DIR, 'cleaned_products.csv')

    print("Loading raw CSV files...")
    cve_df = pd.read_csv(cve_path)
    vendors_df = pd.read_csv(vendors_path)
    products_df = pd.read_csv(products_path)

    print(f"Loaded: {len(cve_df):,} CVEs | {len(vendors_df):,} Vendor records | {len(products_df):,} Product records")

    # Clean & normalize CVE IDs
    cve_df['cve_id'] = cve_df['cve_id'].astype(str).str.strip().str.upper()
    vendors_df['cve_id'] = vendors_df['cve_id'].astype(str).str.strip().str.upper()
    products_df['cve_id'] = products_df['cve_id'].astype(str).str.strip().str.upper()

    # Drop duplicate CVE rows
    cve_df = cve_df.drop_duplicates(subset=['cve_id'])

    # Aggregate vendor info per CVE
    vendor_agg = vendors_df.groupby('cve_id').agg(
        vendor_count=('vendor', 'nunique'),
        vendor=('vendor', lambda s: str(s.iloc[0]) if len(s) > 0 else 'Unknown')
    ).reset_index()

    # Aggregate product info per CVE
    product_agg = products_df.groupby('cve_id').agg(
        product_count=('vulnerable_product', 'nunique'),
        vulnerable_product=('vulnerable_product', lambda s: str(s.iloc[0]) if len(s) > 0 else 'Unknown')
    ).reset_index()

    # Merge CVE + Vendors + Products
    merged = cve_df.merge(vendor_agg, on='cve_id', how='left')
    merged = merged.merge(product_agg, on='cve_id', how='left')

    # Fill defaults
    merged['vendor_count'] = merged['vendor_count'].fillna(1).astype(int)
    merged['product_count'] = merged['product_count'].fillna(1).astype(int)
    merged['vendor'] = merged['vendor'].fillna('Unknown').astype(str)
    merged['vulnerable_product'] = merged['vulnerable_product'].fillna('Unknown').astype(str)
    merged['primary_vendor'] = merged['vendor']
    merged['primary_product'] = merged['vulnerable_product']

    # Clean CVSS scores
    merged['cvss'] = pd.to_numeric(merged['cvss'], errors='coerce')
    merged = merged.dropna(subset=['cvss'])
    merged = merged[(merged['cvss'] >= 0.0) & (merged['cvss'] <= 10.0)]

    # Clean dates & age
    merged['cve_age_days'] = pd.to_numeric(merged.get('cve_age_days', 365), errors='coerce').fillna(365)
    merged['pub_date'] = merged.get('pub_date', '').fillna('').astype(str)
    merged['mod_date'] = merged.get('mod_date', '').fillna('').astype(str)

    # Clean summary length & has_cwe
    merged['summary'] = merged['summary'].fillna('').astype(str)
    merged['summary_length'] = merged['summary'].apply(len)

    # Clean & bucket CWE code
    merged['cwe_code'] = merged['cwe_code'].fillna('NVD-CWE-Other').astype(str).str.strip()
    merged['cwe_name'] = merged.get('cwe_name', 'NVD-CWE-Other').fillna('NVD-CWE-Other').astype(str).str.strip()
    top_cwes = merged['cwe_code'].value_counts().head(20).index.tolist()
    merged['cwe_bucket'] = merged['cwe_code'].apply(lambda x: x if x in top_cwes else 'Other')
    merged['has_cwe'] = merged['cwe_bucket'].apply(lambda x: 0 if x in ['Other', 'NVD-CWE-Other', ''] else 1)

    # Clean categorical vector fields
    for col in ['severity', 'access_authentication', 'access_complexity', 'access_vector', 'impact_availability', 'impact_confidentiality', 'impact_integrity']:
        if col in merged.columns:
            merged[col] = merged[col].fillna('UNKNOWN').astype(str).str.strip().str.upper()
        else:
            merged[col] = 'UNKNOWN'

    # Apply derived patch priority policy
    print("Generating patch priority labels...")
    merged['patch_priority'] = merged.apply(derive_patch_priority, axis=1)

    # Save processed CSV dataset
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    out_csv_path = os.path.join(PROCESSED_DIR, 'vulnerabilities_processed.csv')
    merged.to_csv(out_csv_path, index=False)
    print(f"Processed CSV dataset saved to: {out_csv_path}")

    # Ingest into SQLite database
    print("Ingesting records into SQLite database (backend/data/patchpilot.db)...")
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear previous table entries if re-importing
    cursor.execute("DELETE FROM vulnerabilities")

    records = []
    for _, row in merged.iterrows():
        records.append((
            str(row['cve_id']),
            str(row['summary']),
            float(row['cvss']),
            str(row['severity']),
            str(row['cwe_code']),
            str(row['cwe_name']),
            str(row['access_authentication']),
            str(row['access_complexity']),
            str(row['access_vector']),
            str(row['impact_availability']),
            str(row['impact_confidentiality']),
            str(row['impact_integrity']),
            str(row['pub_date']),
            str(row['mod_date']),
            float(row['cve_age_days']),
            str(row['vendor']),
            str(row['vulnerable_product']),
            int(row['vendor_count']),
            int(row['product_count']),
            int(row['summary_length']),
            str(row['patch_priority']),
            1.0
        ))

    cursor.executemany('''
        INSERT OR REPLACE INTO vulnerabilities (
            cve_id, summary, cvss, severity, cwe_code, cwe_name,
            access_authentication, access_complexity, access_vector,
            impact_availability, impact_confidentiality, impact_integrity,
            pub_date, mod_date, cve_age_days, vendor, vulnerable_product,
            vendor_count, product_count, summary_length, ml_priority, ml_confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', records)

    conn.commit()

    # Verify count
    cursor.execute("SELECT COUNT(*) FROM vulnerabilities")
    total_db_count = cursor.fetchone()[0]
    conn.close()

    print(f"Successfully populated SQLite database with {total_db_count:,} CVE records!")

if __name__ == '__main__':
    import_and_ingest_data()
