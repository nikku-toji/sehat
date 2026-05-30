/**
 * Normalize lab values to each marker's canonical unit before classification.
 * Lab reports are wildly inconsistent in units; getting this wrong produces
 * dangerous advice, so unknown units are flagged rather than guessed.
 */

// Multiplicative conversions INTO the canonical unit, keyed by markerKey + source unit.
const CONVERSIONS = {
  // glucose: mmol/L -> mg/dL  (×18.0182)
  fasting_glucose: { 'mmol/l': 18.0182, 'mg/dl': 1 },
  // cholesterol family: mmol/L -> mg/dL (×38.67)
  total_cholesterol: { 'mmol/l': 38.67, 'mg/dl': 1 },
  ldl: { 'mmol/l': 38.67, 'mg/dl': 1 },
  hdl: { 'mmol/l': 38.67, 'mg/dl': 1 },
  // triglycerides: mmol/L -> mg/dL (×88.57)
  triglycerides: { 'mmol/l': 88.57, 'mg/dl': 1 },
  // vitamin D: nmol/L -> ng/mL (÷2.496)
  vitamin_d: { 'nmol/l': 1 / 2.496, 'ng/ml': 1 },
  // vitamin B12: pmol/L -> pg/mL (×1.355)
  vitamin_b12: { 'pmol/l': 1.355, 'pg/ml': 1 },
  // creatinine: µmol/L -> mg/dL (÷88.42)
  creatinine: { 'umol/l': 1 / 88.42, 'µmol/l': 1 / 88.42, 'mg/dl': 1 },
};

const clean = (u) => String(u || '').toLowerCase().replace(/\s+/g, '').trim();

/**
 * @returns { value:Number, unit:String, converted:Boolean, confident:Boolean }
 */
export function normalize(markerKey, value, unit) {
  const table = CONVERSIONS[markerKey];
  const c = clean(unit);

  // No conversion table → unitless markers (hba1c %, tsh) pass through.
  if (!table) return { value, unit, converted: false, confident: true };

  if (c in table) {
    const factor = table[c];
    return {
      value: Number((value * factor).toFixed(2)),
      unit: Object.keys(table).find((k) => table[k] === 1) || unit,
      converted: factor !== 1,
      confident: true,
    };
  }

  // Unit not recognized: keep value but flag low confidence so the UI can ask.
  return { value, unit, converted: false, confident: false };
}
