# PatchPilot AI 🛡️
> **AI Vulnerability Patch Prioritizer for Lean IT Teams**  
> *"Know what to patch first — based on real-world risk."*

---

## 📌 Problem Statement
Small IT and SOC teams face hundreds of CVE vulnerabilities every month but have limited time and engineering resources to patch everything immediately. Standard vulnerability management relies almost exclusively on CVSS scores. However, CVSS measures theoretical technical severity — severity alone does not tell an IT team which vulnerability requires immediate fire-drill action versus routine monthly maintenance.

## 🚀 Our Solution
**PatchPilot AI** replaces CVSS-only decision-making with an explainable multi-factor Risk Scoring Engine (0–100 score). It combines:
1. **NVD Vulnerability Data & CVSS Severity (30%)**
2. **CISA Known Exploited Vulnerabilities (KEV) Catalog (35%)**
3. **Internet Exposure Context (15%)**
4. **Asset Criticality Context (15%)**
5. **Exploit Code Availability (5%)**

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js v18.x or higher
- npm v9.x or higher

### Installation & Launching

1. **Clone or navigate to the repository directory:**
   ```bash
   cd lumaHackathon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. *(Optional)* **Configure NVD API Key:**
   NVD works without an API key but is rate-limited (~5 requests/30s). To use an API key, create a `.env` file in the root directory:
   ```env
   NVD_API_KEY=your_nvd_api_key_here
   PORT=3001
   ```

4. **Run the Application (Starts Express Proxy + Vite Dev Server Concurrently):**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Frontend Dashboard: [http://localhost:5173](http://localhost:5173)
   - Backend Proxy Server: [http://localhost:3001/api/status](http://localhost:3001/api/status)

---

## 🧮 Risk Scoring Formula (Explainable 0–100 Scale)

```
riskScore = 
  (cvssSubscore        * 0.30) +
  (kevSubscore         * 0.35) +
  (exposureSubscore    * 0.15) +
  (criticalitySubscore * 0.15) +
  (exploitSubscore     * 0.05)
```

### Sub-score Calculations:
- **CVSS Subscore (30%)**: `CVSS * 10` (CVSS 7.5 → 75 pts)
- **CISA KEV Subscore (35%)**: Listed in KEV → `100 pts`, Not listed → `0 pts`
- **Internet Exposure (15%)**: Internet-Facing → `100 pts`, Internal → `30 pts`
- **Asset Criticality (15%)**: Critical → `100 pts`, High → `75 pts`, Medium → `50 pts`, Low → `25 pts`
- **Exploit Availability (5%)**: Available → `100 pts`, Not available/Unknown → `0 pts`

### Patch Priority Bands:
- 🔴 **90–100 | CRITICAL**: Patch Now (Within 24 hours)
- 🟠 **75–89 | HIGH**: Patch Within 7 Days
- 🟡 **50–74 | MEDIUM**: Patch This Month (Within 30 days)
- 🟢 **0–49 | LOW**: Monitor

---

## 💡 Key Demonstration Pair ("Lower CVSS ≠ Lower Priority")

PatchPilot AI explicitly demonstrates why CVSS alone fails IT teams:

- **Vulnerability A** (`CVE-2024-8891`): CVSS **9.8** (Critical), KEV: **No**, Internet: **Yes**, Asset: **Critical**, Exploit Available: **No**  
  → **AI Risk Score: 59** (MEDIUM Priority)
- **Vulnerability B** (`CVE-2024-3094` XZ Utils): CVSS **7.5** (High), KEV: **🔥 YES**, Internet: **Yes**, Asset: **Critical**, Exploit Available: **Yes**  
  → **AI Risk Score: 93** (CRITICAL Priority - Patch Immediately!)

*Result:* Vulnerability B scores **34 points higher** than A despite having a lower CVSS score, because B is actively exploited in the wild!

---

## 📊 Application Features & Pages

- **Dashboard**: 5 SOC KPI cards, prominent "WHAT SHOULD I PATCH TODAY?" hero card, Section 7 proof callout, and 4 embedded Recharts visual charts.
- **Vulnerabilities**: Searchable, filterable (priority, severity, KEV, exposure, asset criticality), and sortable table view.
- **Vulnerability Modal**: Interactive detail view with progress-bar score contributions, CISA KEV remediation dates, and live environment context editor.
- **Patch Queue**: Urgency-grouped remediation roadmap (Patch Now, 7 Days, 30 Days, Monitor) with plain-English prioritization justifications.
- **Intelligence**: NVD & CISA KEV status indicators, live "Refresh Threat Intelligence" sync trigger, and manual live NVD CVE lookup tool.
- **CSV Import**: Upload custom vulnerability datasets with automatic validation, risk recalculation, and 1-click demo dataset reset.
- **About**: Problem context, existing CVSS limitations, solution architecture, and key insights.

---

## 🤖 Scikit-Learn Random Forest ML Integration & SQLite Database

PatchPilot AI includes a Python machine learning microservice trained on 89,660 Kaggle CVE records (`cleaned_cve`, `cleaned_vendors`, `cleaned_products`, `cleaned_vendor_product`).

### Data Ingestion & ML Setup Commands

1. **Ingest Kaggle CSV Data into SQLite Database:**
   ```bash
   python backend/ml/import_data.py
   ```
   *Creates `backend/data/processed/vulnerabilities_processed.csv` and populates `backend/data/patchpilot.db` with 89,660 CVE records.*

2. **Train Random Forest Classifier:**
   ```bash
   python backend/ml/train_model.py
   ```
   *Trains `RandomForestClassifier(n_estimators=200, random_state=42, class_weight='balanced')` and saves model artifacts to `backend/model/`.*

3. **Start Python FastAPI Service (Port 5001):**
   ```bash
   python backend/app.py
   ```

4. **Start Frontend & Express Proxy Server:**
   ```bash
   npm run dev
   ```

---

## 🛠️ Architecture & Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router v6
- **Proxy Backend**: Node.js, Express, Cors, Dotenv (Port 3001)
- **ML Microservice & Database**: Python 3.10+, FastAPI, Scikit-Learn, Pandas, Joblib, SQLite3 (Port 5001)
- **Machine Learning Algorithm**: Random Forest Classifier (200 Decision Trees, Balanced Class Weights)
