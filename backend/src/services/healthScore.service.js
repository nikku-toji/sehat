import { MARKERS, STATUS_WEIGHT, bandsFor } from '../config/markers.js';
import { normalize } from '../utils/units.js';

/**
 * Classify a single raw marker reading.
 * @param {string} key   marker key (e.g. 'ldl')
 * @param {number} value numeric value as printed on the report
 * @param {string} unit  unit as printed on the report
 * @param {{sex?:string}} ctx
 */
export function classifyMarker(key, value, unit, ctx = {}) {
  const meta = MARKERS[key];
  if (!meta) return null;

  const sex = ctx.sex === 'female' ? 'female' : 'male';
  const norm = normalize(key, value, unit);
  const bands = bandsFor(key, sex);

  let match = bands.find((b) => {
    const okMin = b.min == null || norm.value >= b.min;
    const okMax = b.max == null || norm.value < b.max;
    return okMin && okMax;
  });
  if (!match) match = bands[bands.length - 1];

  return {
    key,
    label: meta.label,
    value: norm.value,
    unit: norm.unit,
    status: match.status,          // optimal | borderline | concerning
    note: match.note,
    weight: meta.weight,
    lowConfidence: !norm.confident, // unit unrecognized → surface "please confirm"
    rawValue: value,
    rawUnit: unit,
  };
}

/**
 * Compute a 0–100 health score from a set of classified markers.
 * Score = weighted average of per-marker status quality, scaled to 100.
 * Concerning markers drag harder than borderline (see STATUS_WEIGHT).
 */
export function computeHealthScore(classified) {
  const usable = classified.filter(Boolean);
  if (usable.length === 0) {
    return { score: null, band: 'unknown', breakdown: [], coverage: 0 };
  }

  let weighted = 0;
  let totalWeight = 0;
  for (const m of usable) {
    const q = STATUS_WEIGHT[m.status] ?? 0.5;
    weighted += q * m.weight;
    totalWeight += m.weight;
  }

  const score = Math.round((weighted / totalWeight) * 100);
  const band =
    score >= 85 ? 'excellent' :
    score >= 70 ? 'good' :
    score >= 50 ? 'fair' : 'needs attention';

  const breakdown = usable
    .map((m) => ({ key: m.key, label: m.label, status: m.status, value: m.value, unit: m.unit }))
    .sort((a, b) => statusRank(a.status) - statusRank(b.status));

  return { score, band, breakdown, coverage: usable.length };
}

const statusRank = (s) => ({ concerning: 0, borderline: 1, optimal: 2 }[s] ?? 3);

/** Group classified markers into the buckets the UI cares about. */
export function summarize(classified) {
  const usable = classified.filter(Boolean);
  return {
    abnormal: usable.filter((m) => m.status === 'concerning'),
    deficiencies: usable.filter((m) => m.status !== 'optimal' && /vitamin|hemoglobin/i.test(m.label)),
    watch: usable.filter((m) => m.status === 'borderline'),
    needsConfirmation: usable.filter((m) => m.lowConfidence),
  };
}
