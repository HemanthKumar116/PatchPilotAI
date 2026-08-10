import os
import pandas as pd
import numpy as np

# Project relative paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')

def derive_patch_priority(row):
    """
    Transparent Derived Prioritization Policy Function
    ---------------------------------------------------
    NOTE: These labels represent a derived prioritization policy for research/demonstration
    purposes based on CVSS, severity, impact metrics, and access vectors — they do not 
    represent real-world historical patch decisions. The architecture allows swapping 
    in real historical labels in the future without code rewrites.

    Baseline mapping:
    - CRITICAL: CVSS >= 9.0
    - HIGH:     7.0 <= CVSS < 9.0
    - MEDIUM:   4.0 <= CVSS < 7.0
    - LOW:      CVSS < 4.0

    Refinements using environmental & vector signals:
    - High-impact network exploits with low complexity elevate High -> CRITICAL
    - Full-impact tri-confidentiality/integrity/availability exploits elevate Medium -> HIGH
    """
    cvss = float(row.get('cvss', 0.0))
    severity = str(row.get('severity', '')).strip().upper()
    access_vec = str(row.get('access_vector', '')).strip().upper()
    access_comp = str(row.get('access_complexity', '')).strip().upper()
    imp_avail = str(row.get('impact_availability', '')).strip().upper()
    imp_conf = str(row.get('impact_confidentiality', '')).strip().upper()
    imp_integ = str(row.get('impact_integrity', '')).strip().upper()

    # Initial baseline
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

def preprocess_cve_data():
    """
    Loads raw CSV datasets (cleaned_cve, cleaned_vendors, cleaned_products, cleaned_vendor_product),
    joins them on cve_id, cleans missing/duplicate data, engineers feature columns,
    applies the derived patch priority policy, and saves to backend/data/processed/vulnerabilities_processed.csv.
    """
    print("Loading raw CSV files...")
    cve_path = os.path.join(RAW_DIR, 'cleaned_cve.csv')
    vendors_path = os.path.join(RAW_DIR, 'cleaned_vendors.csv')
    products_path = os.path.join(RAW_DIR, 'cleaned_products.csv')

    cve_df = pd.read_csv(cve_path)
    vendors_df = pd.read_csv(vendors_path)
    products_df = pd.read_csv(products_path)

    print(f"Raw CVE rows: {len(cve_df):,}")
    print(f"Raw Vendor rows: {len(vendors_df):,}")
    print(f"Raw Product rows: {len(products_df):,}")

    # Clean CVE IDs
    cve_df['cve_id'] = cve_df['cve_id'].astype(str).str.strip().str.upper()
    vendors_df['cve_id'] = vendors_df['cve_id'].astype(str).str.strip().str.upper()
    products_df['cve_id'] = products_df['cve_id'].astype(str).str.strip().str.upper()

    # Drop duplicate CVE rows
    cve_df = cve_df.drop_duplicates(subset=['cve_id'])

    # Aggregate vendor info per CVE
    vendor_agg = vendors_df.groupby('cve_id').agg(
        vendor_count=('vendor', 'nunique'),
        primary_vendor=('vendor', lambda s: s.iloc[0] if len(s) > 0 else 'Unknown')
    ).reset_index()

    # Aggregate product info per CVE
    product_agg = products_df.groupby('cve_id').agg(
        product_count=('vulnerable_product', 'nunique'),
        primary_product=('vulnerable_product', lambda s: s.iloc[0] if len(s) > 0 else 'Unknown')
    ).reset_index()

    # Merge CVE + Vendors + Products
    merged = cve_df.merge(vendor_agg, on='cve_id', how='left')
    merged = merged.merge(product_agg, on='cve_id', how='left')

    # Fill default counts & values
    merged['vendor_count'] = merged['vendor_count'].fillna(0).astype(int)
    merged['product_count'] = merged['product_count'].fillna(0).astype(int)
    merged['primary_vendor'] = merged['primary_vendor'].fillna('Unknown').astype(str)
    merged['primary_product'] = merged['primary_product'].fillna('Unknown').astype(str)

    # Clean CVSS scores
    merged['cvss'] = pd.to_numeric(merged['cvss'], errors='coerce')
    merged = merged.dropna(subset=['cvss'])
    merged = merged[(merged['cvss'] >= 0.0) & (merged['cvss'] <= 10.0)]

    # Clean cve_age_days
    merged['cve_age_days'] = pd.to_numeric(merged.get('cve_age_days', 365), errors='coerce').fillna(365)

    # Clean summary length & has_cwe
    merged['summary'] = merged['summary'].fillna('').astype(str)
    merged['summary_length'] = merged['summary'].apply(len)

    # Clean & bucket CWE code to top 20
    merged['cwe_code'] = merged['cwe_code'].fillna('NVD-CWE-Other').astype(str).str.strip()
    top_cwes = merged['cwe_code'].value_counts().head(20).index.tolist()
    merged['cwe_bucket'] = merged['cwe_code'].apply(lambda x: x if x in top_cwes else 'Other')
    merged['has_cwe'] = merged['cwe_bucket'].apply(lambda x: 0 if x in ['Other', 'NVD-CWE-Other', ''] else 1)

    # Clean categorical fields
    for col in ['severity', 'access_authentication', 'access_complexity', 'access_vector', 'impact_availability', 'impact_confidentiality', 'impact_integrity']:
        if col in merged.columns:
            merged[col] = merged[col].fillna('UNKNOWN').astype(str).str.strip().str.upper()
        else:
            merged[col] = 'UNKNOWN'

    # Apply derived patch priority label
    print("Generating derived patch priority labels...")
    merged['patch_priority'] = merged.apply(derive_patch_priority, axis=1)

    # Select final processed columns
    processed_cols = [
        'cve_id', 'cvss', 'severity', 'cwe_code', 'cwe_bucket', 'has_cwe',
        'cve_age_days', 'access_authentication', 'access_complexity', 'access_vector',
        'impact_availability', 'impact_confidentiality', 'impact_integrity',
        'vendor_count', 'product_count', 'primary_vendor', 'primary_product',
        'summary_length', 'pub_date', 'mod_date', 'patch_priority'
    ]

    final_df = merged[processed_cols].copy()

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    out_path = os.path.join(PROCESSED_DIR, 'vulnerabilities_processed.csv')
    final_df.to_csv(out_path, index=False)
    print(f"Preprocessed dataset saved to {out_path} ({len(final_df):,} records)")

    priority_counts = final_df['patch_priority'].value_counts().to_dict()
    print("Label distribution:", priority_counts)
    return final_df

if __name__ == '__main__':
    preprocess_cve_data()
