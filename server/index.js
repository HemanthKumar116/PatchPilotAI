import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const PYTHON_ML_PORT = process.env.PYTHON_ML_PORT || 5001;

app.use(cors());

// In-memory cache for CISA KEV
let kevCache = null;
let kevCacheTime = 0;
const KEV_CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Helper to fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

// Pipe POST /api/import and /import directly to Python backend without body-parser interference
app.post(['/api/import', '/import'], (req, res) => {
    const pythonOptions = {
        hostname: '127.0.0.1',
        port: PYTHON_ML_PORT,
        path: '/api/import',
        method: 'POST',
        headers: {
            ...req.headers,
            host: `127.0.0.1:${PYTHON_ML_PORT}`
        }
    };

    const proxyReq = http.request(pythonOptions, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.warn('[Proxy] Error forwarding /api/import to Python backend:', err.message);
        res.status(503).json({
            success: false,
            detail: `Python ML backend unavailable on port ${PYTHON_ML_PORT}. Please ensure Python FastAPI service is running.`
        });
    });

    req.pipe(proxyReq);
});

// JSON body parser for other endpoints
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// GET /api/status - Check health & threat intel service availability
app.get('/api/status', async (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        nvdApiKeyConfigured: Boolean(process.env.NVD_API_KEY),
        kevCached: Boolean(kevCache && Date.now() - kevCacheTime < KEV_CACHE_DURATION),
    });
});

// GET /api/kev - CISA KEV catalog feed
app.get('/api/kev', async (req, res) => {
    try {
        if (kevCache && Date.now() - kevCacheTime < KEV_CACHE_DURATION) {
            return res.json({
                status: 'ok',
                source: 'cache',
                lastUpdated: new Date(kevCacheTime).toISOString(),
                data: kevCache,
            });
        }

        const url = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
        const response = await fetchWithTimeout(url, {}, 10000);

        if (!response.ok) {
            throw new Error(`CISA KEV HTTP ${response.status}`);
        }

        const data = await response.json();
        kevCache = data;
        kevCacheTime = Date.now();

        res.json({
            status: 'ok',
            source: 'live',
            lastUpdated: new Date(kevCacheTime).toISOString(),
            data: kevCache,
        });
    } catch (error) {
        console.warn('[Proxy] Error fetching CISA KEV:', error.message);
        res.status(200).json({
            status: 'unavailable',
            message: error.message || 'CISA KEV API temporarily unavailable',
            data: kevCache || null,
        });
    }
});

// GET /api/nvd/cve/:cveId - NVD CVE detail proxy
app.get('/api/nvd/cve/:cveId', async (req, res) => {
    const { cveId } = req.params;
    const cleanId = (cveId || '').trim().toUpperCase();

    if (!cleanId || !/^CVE-\d{4}-\d{4,8}$/i.test(cleanId)) {
        return res.status(400).json({
            status: 'error',
            cveId: cleanId,
            message: 'Invalid CVE format. Expected CVE-YYYY-NNNN format.'
        });
    }

    try {
        const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(cleanId)}`;
        const headers = {
            'User-Agent': 'PatchPilot-AI-SOC/1.0',
        };

        if (process.env.NVD_API_KEY) {
            headers['apiKey'] = process.env.NVD_API_KEY;
        }

        const response = await fetchWithTimeout(url, { headers }, 9000);

        if (!response.ok) {
            throw new Error(`NVD API HTTP ${response.status}`);
        }

        const data = await response.json();
        res.json({
            status: 'ok',
            source: 'live',
            cveId: cleanId,
            data: data,
        });
    } catch (error) {
        console.warn(`[Proxy] Error fetching NVD for ${cleanId}:`, error.message);
        res.status(200).json({
            status: 'unavailable',
            cveId: cleanId,
            message: error.message || 'NVD API unavailable or rate-limited',
        });
    }
});

// POST /api/predict - Random Forest prediction proxy
app.post('/api/predict', async (req, res) => {
    try {
        const pyRes = await fetchWithTimeout(`http://127.0.0.1:${PYTHON_ML_PORT}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        }, 5000);

        if (!pyRes.ok) {
            throw new Error(`Python ML API HTTP ${pyRes.status}`);
        }

        const data = await pyRes.json();
        res.json({ status: 'ok', ...data });
    } catch (err) {
        console.warn('[Proxy] Error calling Python ML predict API:', err.message);
        res.status(200).json({
            status: 'unavailable',
            message: 'Python ML service unavailable. Dashboard operating in formula-only mode.'
        });
    }
});

// GET /api/ml/metrics - Model evaluation metrics proxy
app.get('/api/ml/metrics', async (req, res) => {
    try {
        const pyRes = await fetchWithTimeout(`http://127.0.0.1:${PYTHON_ML_PORT}/metrics`, {}, 4000);
        if (!pyRes.ok) throw new Error(`Python ML API HTTP ${pyRes.status}`);
        const data = await pyRes.json();
        res.json({ status: 'ok', data });
    } catch (err) {
        console.warn('[Proxy] Error fetching ML metrics:', err.message);
        res.status(200).json({
            status: 'unavailable',
            message: 'ML evaluation metrics unavailable.'
        });
    }
});

// GET /api/ml/dataset - Paginated Kaggle dataset proxy
app.get('/api/ml/dataset', async (req, res) => {
    try {
        const queryStr = new URLSearchParams(req.query).toString();
        const pyRes = await fetchWithTimeout(`http://127.0.0.1:${PYTHON_ML_PORT}/dataset?${queryStr}`, {}, 8000);
        if (!pyRes.ok) throw new Error(`Python ML API HTTP ${pyRes.status}`);
        const data = await pyRes.json();
        res.json({ status: 'ok', ...data });
    } catch (err) {
        console.warn('[Proxy] Error fetching ML dataset:', err.message);
        res.status(200).json({
            status: 'unavailable',
            page: 1,
            total_count: 0,
            total_pages: 1,
            items: []
        });
    }
});

// GET /api/vulnerabilities/summary and /api/stats - Aggregate database stats proxy
app.get(['/api/vulnerabilities/summary', '/api/stats', '/stats'], async (req, res) => {
    try {
        const pyRes = await fetchWithTimeout(`http://127.0.0.1:${PYTHON_ML_PORT}/api/vulnerabilities/summary`, {}, 8000);
        if (!pyRes.ok) throw new Error(`Python ML API HTTP ${pyRes.status}`);
        const data = await pyRes.json();
        res.json(data);
    } catch (err) {
        console.warn('[Proxy] Error fetching vulnerabilities summary:', err.message);
        res.status(200).json({
            status: 'unavailable',
            total_count: 0,
            priority_counts: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            severity_counts: { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
            avg_cvss: 7.2,
            items: []
        });
    }
});

// GET /api/vulnerabilities - Paginated database vulnerability list proxy
app.get('/api/vulnerabilities', async (req, res) => {
    try {
        const queryStr = new URLSearchParams(req.query).toString();
        const pyRes = await fetchWithTimeout(`http://127.0.0.1:${PYTHON_ML_PORT}/api/vulnerabilities?${queryStr}`, {}, 8000);
        if (!pyRes.ok) throw new Error(`Python ML API HTTP ${pyRes.status}`);
        const data = await pyRes.json();
        res.json(data);
    } catch (err) {
        console.warn('[Proxy] Error fetching vulnerabilities list:', err.message);
        res.status(200).json({
            status: 'unavailable',
            page: 1,
            total_count: 0,
            total_pages: 1,
            items: []
        });
    }
});

// GET /api/vulnerabilities/:cveId - Fetch CVE details from DB & Python ML prediction
app.get('/api/vulnerabilities/:cveId', async (req, res) => {
    const { cveId } = req.params;
    const cleanId = cveId.trim().toUpperCase();
    try {
        const pyRes = await fetchWithTimeout(`http://127.0.0.1:${PYTHON_ML_PORT}/api/vulnerabilities/${cleanId}`, {}, 5000);
        if (!pyRes.ok) throw new Error(`Python ML API HTTP ${pyRes.status}`);
        const data = await pyRes.json();
        res.json(data);
    } catch (err) {
        console.warn(`[Proxy] Error fetching DB vulnerability for ${cleanId}:`, err.message);
        res.status(200).json({
            status: 'unavailable',
            cveId: cleanId,
            message: 'Database query unavailable.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`[PatchPilot Proxy Server] Running on http://localhost:${PORT}`);
});
