import { AssetCriticality, PriorityBand, RiskAnalysisResult, ScoreContribution, Vulnerability } from '../types/vulnerability';
import { exploitPredictorModel, extractCveFeatures, ExploitPredictionResult } from './exploitPredictor';

/**
 * Calculates an explainable risk score (0-100) and patch priority based on:
 * 1. CVSS Severity (30%)
 * 2. CISA KEV Exploitation Status (35%)
 * 3. Internet Exposure (15%)
 * 4. Asset Criticality (15%)
 * 5. Exploit Availability (5%) - Explicit manual/CSV value OR AI Random Forest Likelihood Prediction
 */
export function calculateRiskScore(vuln: Partial<Vulnerability>): RiskAnalysisResult {
    const rawCvss = typeof vuln.cvss === 'number' && !isNaN(vuln.cvss) ? vuln.cvss : 0;
    const cvss = Math.min(10, Math.max(0, rawCvss));
    const knownExploited = Boolean(vuln.knownExploited);
    const internetExposed = Boolean(vuln.internetExposed);
    const assetCriticality: AssetCriticality = vuln.assetCriticality ?? 'Medium';

    // 1. Subscores (0-100 scale)
    const cvssSubscore = Math.min(100, Math.max(0, cvss * 10));
    const kevSubscore = knownExploited ? 100 : 0;
    const exposureSubscore = internetExposed ? 100 : 30;

    let criticalitySubscore = 50;
    switch (assetCriticality) {
        case 'Critical':
            criticalitySubscore = 100;
            break;
        case 'High':
            criticalitySubscore = 75;
            break;
        case 'Medium':
            criticalitySubscore = 50;
            break;
        case 'Low':
            criticalitySubscore = 25;
            break;
    }

    // Exploit Availability Logic:
    // If explicitly defined (boolean true/false via manual toggle or CSV), use exact value.
    // If undefined/unset, calculate AI Random Forest Exploit Likelihood prediction.
    let exploitSubscore = 0;
    let isExploitPredicted = false;
    let exploitPrediction: ExploitPredictionResult | undefined;

    if (vuln.exploitAvailable !== undefined && vuln.exploitAvailable !== null) {
        exploitSubscore = vuln.exploitAvailable ? 100 : 0;
        isExploitPredicted = false;
    } else {
        // Extract intrinsic features and run ML prediction
        const features = extractCveFeatures({
            cvss,
            cvssVector: (vuln as any).cvssVector,
            title: vuln.title || '',
            description: vuln.description || '',
            publishedDate: vuln.publishedDate || new Date().toISOString(),
        });

        exploitPrediction = exploitPredictorModel.predictExploitLikelihood(features);
        const prob = typeof exploitPrediction?.predictedProbability === 'number' && !isNaN(exploitPrediction.predictedProbability)
            ? exploitPrediction.predictedProbability
            : 0.5;
        exploitSubscore = Math.round(prob * 100);
        isExploitPredicted = true;
    }

    // 2. Weighted contributions
    const weightedCvss = cvssSubscore * 0.30;
    const weightedKev = kevSubscore * 0.35;
    const weightedExposure = exposureSubscore * 0.15;
    const weightedCriticality = criticalitySubscore * 0.15;
    const weightedExploit = exploitSubscore * 0.05;

    const rawScore = weightedCvss + weightedKev + weightedExposure + weightedCriticality + weightedExploit;
    const riskScore = Math.min(100, Math.max(0, isNaN(rawScore) ? 50 : Math.round(rawScore)));

    // 3. Priority band determination
    let priority: PriorityBand = 'LOW';
    let priorityLabel = 'MONITOR';
    let recommendedAction = 'Monitor vulnerability and reassess during routine maintenance.';
    let recommendedTimeline = 'Next regular maintenance cycle';

    if (riskScore >= 90) {
        priority = 'CRITICAL';
        priorityLabel = 'PATCH NOW';
        recommendedAction = 'Patch immediately or isolate system. Known active threat.';
        recommendedTimeline = 'Within 24 hours';
    } else if (riskScore >= 75) {
        priority = 'HIGH';
        priorityLabel = 'PATCH WITHIN 7 DAYS';
        recommendedAction = 'Schedule emergency patch window. High exposure/severity risk.';
        recommendedTimeline = 'Within 7 days';
    } else if (riskScore >= 50) {
        priority = 'MEDIUM';
        priorityLabel = 'PATCH THIS MONTH';
        recommendedAction = 'Include in upcoming standard monthly security update batch.';
        recommendedTimeline = 'Within 30 days';
    } else {
        priority = 'LOW';
        priorityLabel = 'MONITOR';
        recommendedAction = 'Monitor system logs and review vendor updates periodically.';
        recommendedTimeline = 'Monitor';
    }

    // 4. Score breakdown object
    const scoreBreakdown: ScoreContribution = {
        cvssSubscore,
        weightedCvss,
        kevSubscore,
        weightedKev,
        exposureSubscore,
        weightedExposure,
        criticalitySubscore,
        weightedCriticality,
        exploitSubscore,
        weightedExploit,
        isExploitPredicted,
        exploitPredictedProbability: exploitPrediction?.predictedProbability,
        totalScore: riskScore,
    };

    // 5. Plain English explanation
    const reasons: string[] = [];
    if (knownExploited) {
        reasons.push('listed in CISA KEV as actively exploited in the wild (+35 pts)');
    } else {
        reasons.push('not currently listed in the CISA KEV catalog (+0 pts)');
    }

    if (cvss >= 9.0) {
        reasons.push(`carries a Critical CVSS rating of ${cvss.toFixed(1)} (+${weightedCvss.toFixed(1)} pts)`);
    } else if (cvss >= 7.0) {
        reasons.push(`carries a High CVSS rating of ${cvss.toFixed(1)} (+${weightedCvss.toFixed(1)} pts)`);
    } else {
        reasons.push(`has a CVSS rating of ${cvss.toFixed(1)} (+${weightedCvss.toFixed(1)} pts)`);
    }

    if (internetExposed) {
        reasons.push('affects an internet-facing asset (+15 pts)');
    } else {
        reasons.push('affects an internal-only asset (+4.5 pts)');
    }

    reasons.push(`impacts a ${assetCriticality} business asset (+${weightedCriticality.toFixed(1)} pts)`);

    if (vuln.exploitAvailable === true) {
        reasons.push('public proof-of-concept exploit code is confirmed (+5 pts)');
    } else if (isExploitPredicted && exploitPrediction) {
        reasons.push(`AI predicted an exploit likelihood of ${Math.round(exploitPrediction.predictedProbability * 100)}% (+${weightedExploit.toFixed(1)} pts)`);
    }

    const explanation = `This vulnerability is categorized as ${priority} (Risk Score: ${riskScore}/100) because it is ${reasons.join(', ')}.`;

    return {
        riskScore,
        priority,
        priorityLabel,
        recommendedAction,
        recommendedTimeline,
        scoreBreakdown,
        explanation,
        exploitPrediction,
    };
}
