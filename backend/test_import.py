import os
import sys
import io
import json
import sqlite3
import pandas as pd

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from db import init_db, get_db_connection
from app import app, load_artifacts, read_csv_flexible

print("=" * 60)
print("TESTING BACKEND IMPORT PIPELINE & RANDOM FOREST MODEL")
print("=" * 60)

# Initialize DB and artifacts
load_artifacts()
init_db()

# Create sample CSV in-memory
sample_csv = """cve_id,cvss,severity,summary,cwe_code,access_vector
CVE-TEST-001,9.8,Critical,Critical authentication bypass in internal gateway daemon,CWE-79,NETWORK
CVE-TEST-002,8.1,High,Remote code execution via unchecked network buffer,CWE-89,NETWORK
CVE-TEST-003,5.5,Medium,Cross-site scripting vulnerability in user feedback module,CWE-200,LOCAL
CVE-TEST-004,3.2,Low,Information disclosure in debug logging interface,CWE-399,LOCAL
CVE-TEST-005,9.1,Critical,Privilege escalation in kernel driver component,CWE-264,NETWORK"""

sample_vendors = """cve_id,vendor
CVE-TEST-001,Cisco
CVE-TEST-002,Fortinet
CVE-TEST-003,WordPress
CVE-TEST-004,Apache
CVE-TEST-005,Linux"""

sample_products = """cve_id,vulnerable_product
CVE-TEST-001,IOS-XE
CVE-TEST-002,FortiOS
CVE-TEST-003,Core
CVE-TEST-004,HTTP Server
CVE-TEST-005,Kernel"""

from fastapi.testclient import TestClient

client = TestClient(app)

# Test 1: Health check
res = client.get("/health")
print("1. Health Check:", res.status_code, res.json())
assert res.status_code == 200

# Test 2: Upload single CVE dataset
cve_file = io.BytesIO(sample_csv.encode('utf-8'))
vendor_file = io.BytesIO(sample_vendors.encode('utf-8'))
product_file = io.BytesIO(sample_products.encode('utf-8'))

files = {
    'cve_file': ('sample_cve.csv', cve_file, 'text/csv'),
    'vendor_file': ('sample_vendors.csv', vendor_file, 'text/csv'),
    'product_file': ('sample_products.csv', product_file, 'text/csv')
}

res_import = client.post("/api/import", files=files)
print("2. Import Response Status:", res_import.status_code)
import_data = res_import.json()
print("   Import Summary:", json.dumps({k: import_data[k] for k in ['success', 'records_processed', 'predictions_generated', 'priority_counts']}, indent=2))
assert res_import.status_code == 200
assert import_data['success'] is True
assert import_data['records_processed'] == 5

# Test 3: Query imported CVE
res_cve = client.get("/api/vulnerabilities/CVE-TEST-001")
print("3. Query CVE-TEST-001:", res_cve.status_code)
cve_data = res_cve.json()
print("   Prediction:", cve_data['cve']['ml_prediction'], "Confidence:", cve_data['cve']['ml_confidence'])
assert res_cve.status_code == 200
assert cve_data['cve']['cve_id'] == 'CVE-TEST-001'

# Test 4: Query paginated dataset
res_list = client.get("/api/vulnerabilities?limit=10")
print("4. Vulnerabilities list count:", len(res_list.json()['items']))
assert res_list.status_code == 200

print("\nALL BACKEND ML & IMPORT TESTS PASSED SUCCESSFULLY!")
