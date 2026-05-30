import { asyncHandler } from '../middleware/errorHandler.js';
import { storeReport } from '../services/storage.service.js';
import { extractMarkers } from '../services/extraction.service.js';
import { classifyMarker, computeHealthScore, summarize } from '../services/healthScore.service.js';
import { generateInsightsAndPlan } from '../services/ai.service.js';

const DISCLAIMER =
  'This analysis is AI-generated wellness information, not a medical diagnosis. ' +
  'Always consult a qualified physician. Raw lab values are shown alongside every insight.';

/**
 * POST /api/reports
 * multipart: file=<pdf|image>, profile=<json string>
 * Runs the full pipeline: store → extract → normalize+classify → score → AI plan.
 */
export const analyzeReport = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No report file uploaded' });

  const profile = parseProfile(req.body.profile);
  const userId = req.user.id;

  // 1) Persist the original (encrypted in prod)
  const stored = await storeReport(req.file.buffer, {
    userId,
    mimetype: req.file.mimetype,
  });

  // 2) Extract raw markers (Textract + Comprehend Medical, or mock)
  const raw = await extractMarkers(req.file.buffer, { mimetype: req.file.mimetype });

  // 3) Normalize units + classify against reference ranges
  const classified = raw
    .map((r) => classifyMarker(r.key, r.value, r.unit, { sex: profile.sex }))
    .filter(Boolean);

  if (classified.length === 0) {
    return res.status(422).json({
      error: 'Could not confidently read any markers from this report. ' +
        'Please upload a clearer scan or a text-based PDF.',
    });
  }

  // 4) Health score + grouped summary
  const health = computeHealthScore(classified);
  const summary = summarize(classified);

  // 5) AI insights + personalized plan (Bedrock Claude, or mock)
  const ai = await generateInsightsAndPlan({
    profile,
    classified,
    summary,
    familyHistory: profile.familyHistory || [],
  });

  res.json({
    reportId: stored.storageKey,
    profile,
    healthScore: health,
    markers: classified,
    summary,
    insights: ai.insights,
    plan: ai.plan,
    hereditaryRisk: ai.hereditaryRisk,
    disclaimer: DISCLAIMER,
    mock: Boolean(ai._mock),
  });
});

function parseProfile(raw) {
  const defaults = { age: null, sex: 'male', weightKg: null, goals: [], familyHistory: [] };
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}
