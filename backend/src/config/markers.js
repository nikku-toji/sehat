/**
 * Reference ranges for common blood markers (India-oriented, adult).
 *
 * Ranges vary by lab, assay, age and sex — these are widely-used defaults used
 * only to CLASSIFY values for a wellness score. They are NOT diagnostic thresholds.
 * `weight` drives the health-score contribution. `canonicalUnit` is what every
 * value is normalized to before classification (see utils/units.js).
 *
 * status bands are evaluated in order; first match wins.
 */

export const MARKERS = {
  hba1c: {
    label: 'HbA1c',
    canonicalUnit: '%',
    weight: 10,
    bands: [
      { max: 5.7, status: 'optimal', note: 'Normal glucose control.' },
      { max: 6.5, status: 'borderline', note: 'Prediabetic range — diet & activity matter.' },
      { max: Infinity, status: 'concerning', note: 'Diabetic range — clinical review advised.' },
    ],
  },
  fasting_glucose: {
    label: 'Fasting glucose',
    canonicalUnit: 'mg/dL',
    weight: 6,
    bands: [
      { min: 70, max: 100, status: 'optimal', note: 'Normal fasting glucose.' },
      { max: 126, status: 'borderline', note: 'Impaired fasting glucose.' },
      { max: Infinity, status: 'concerning', note: 'Elevated — clinical review advised.' },
      { min: -Infinity, max: 70, status: 'borderline', note: 'Low — may indicate hypoglycemia.' },
    ],
  },
  hemoglobin: {
    label: 'Hemoglobin',
    canonicalUnit: 'g/dL',
    weight: 8,
    bySex: {
      male: [
        { min: 13, max: 17, status: 'optimal', note: 'Normal.' },
        { min: 11, max: 13, status: 'borderline', note: 'Mild anemia.' },
        { min: -Infinity, max: 11, status: 'concerning', note: 'Anemia — investigate cause.' },
        { min: 17, max: Infinity, status: 'borderline', note: 'High — hydration/other.' },
      ],
      female: [
        { min: 12, max: 15, status: 'optimal', note: 'Normal.' },
        { min: 10, max: 12, status: 'borderline', note: 'Mild anemia.' },
        { min: -Infinity, max: 10, status: 'concerning', note: 'Anemia — investigate cause.' },
        { min: 15, max: Infinity, status: 'borderline', note: 'High — hydration/other.' },
      ],
    },
  },
  vitamin_d: {
    label: 'Vitamin D (25-OH)',
    canonicalUnit: 'ng/mL',
    weight: 7,
    bands: [
      { min: 30, max: 100, status: 'optimal', note: 'Sufficient.' },
      { min: 20, max: 30, status: 'borderline', note: 'Insufficient.' },
      { min: -Infinity, max: 20, status: 'concerning', note: 'Deficient — very common in India.' },
      { min: 100, max: Infinity, status: 'borderline', note: 'High — review supplementation.' },
    ],
  },
  vitamin_b12: {
    label: 'Vitamin B12',
    canonicalUnit: 'pg/mL',
    weight: 5,
    bands: [
      { min: 200, max: 900, status: 'optimal', note: 'Normal.' },
      { min: 150, max: 200, status: 'borderline', note: 'Low-normal.' },
      { min: -Infinity, max: 150, status: 'concerning', note: 'Deficient — common in vegetarians.' },
    ],
  },
  total_cholesterol: {
    label: 'Total cholesterol',
    canonicalUnit: 'mg/dL',
    weight: 5,
    bands: [
      { max: 200, status: 'optimal', note: 'Desirable.' },
      { max: 240, status: 'borderline', note: 'Borderline high.' },
      { max: Infinity, status: 'concerning', note: 'High.' },
    ],
  },
  ldl: {
    label: 'LDL cholesterol',
    canonicalUnit: 'mg/dL',
    weight: 8,
    bands: [
      { max: 100, status: 'optimal', note: 'Optimal.' },
      { max: 130, status: 'borderline', note: 'Near optimal.' },
      { max: 160, status: 'borderline', note: 'Borderline high.' },
      { max: Infinity, status: 'concerning', note: 'High — cardiovascular risk.' },
    ],
  },
  hdl: {
    label: 'HDL cholesterol',
    canonicalUnit: 'mg/dL',
    weight: 5,
    bySex: {
      male: [
        { min: 40, max: Infinity, status: 'optimal', note: 'Protective.' },
        { min: -Infinity, max: 40, status: 'borderline', note: 'Low — raise with activity.' },
      ],
      female: [
        { min: 50, max: Infinity, status: 'optimal', note: 'Protective.' },
        { min: -Infinity, max: 50, status: 'borderline', note: 'Low — raise with activity.' },
      ],
    },
  },
  triglycerides: {
    label: 'Triglycerides',
    canonicalUnit: 'mg/dL',
    weight: 5,
    bands: [
      { max: 150, status: 'optimal', note: 'Normal.' },
      { max: 200, status: 'borderline', note: 'Borderline high.' },
      { max: Infinity, status: 'concerning', note: 'High.' },
    ],
  },
  tsh: {
    label: 'TSH',
    canonicalUnit: 'mIU/L',
    weight: 5,
    bands: [
      { min: 0.4, max: 4.0, status: 'optimal', note: 'Normal thyroid function.' },
      { min: -Infinity, max: 0.4, status: 'concerning', note: 'Low — possible hyperthyroid.' },
      { min: 4.0, max: 10, status: 'borderline', note: 'Subclinical hypothyroid range.' },
      { min: 10, max: Infinity, status: 'concerning', note: 'High — possible hypothyroid.' },
    ],
  },
  creatinine: {
    label: 'Creatinine',
    canonicalUnit: 'mg/dL',
    weight: 4,
    bySex: {
      male: [
        { min: 0.7, max: 1.3, status: 'optimal', note: 'Normal.' },
        { min: -Infinity, max: 0.7, status: 'borderline', note: 'Low.' },
        { min: 1.3, max: Infinity, status: 'concerning', note: 'High — kidney review.' },
      ],
      female: [
        { min: 0.6, max: 1.1, status: 'optimal', note: 'Normal.' },
        { min: -Infinity, max: 0.6, status: 'borderline', note: 'Low.' },
        { min: 1.1, max: Infinity, status: 'concerning', note: 'High — kidney review.' },
      ],
    },
  },
  alt: {
    label: 'ALT (SGPT)',
    canonicalUnit: 'U/L',
    weight: 3,
    bands: [
      { max: 40, status: 'optimal', note: 'Normal liver enzyme.' },
      { max: 80, status: 'borderline', note: 'Mildly elevated.' },
      { max: Infinity, status: 'concerning', note: 'Elevated — liver review.' },
    ],
  },
};

export const STATUS_WEIGHT = { optimal: 1.0, borderline: 0.55, concerning: 0.1 };

/** Pick the right band set for a marker given sex. */
export function bandsFor(markerKey, sex = 'male') {
  const m = MARKERS[markerKey];
  if (!m) return null;
  if (m.bySex) return m.bySex[sex] || m.bySex.male;
  return m.bands;
}
