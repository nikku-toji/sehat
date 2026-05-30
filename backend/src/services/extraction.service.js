import { config } from '../config/index.js';

/**
 * Extracts structured blood markers from an uploaded report.
 *
 * Live path: Textract (OCR / table extraction) → Comprehend Medical
 * (medical entity + test-value detection) → map detected tests to our marker keys.
 *
 * Lab PDFs have no standard format; mapping is fuzzy and intentionally
 * conservative — anything we can't confidently map is dropped rather than guessed,
 * and unrecognized units are flagged downstream (see utils/units.js).
 *
 * @returns {Promise<Array<{key,value,unit,sourceText}>>}
 */
export async function extractMarkers(buffer, { mimetype }) {
  if (config.mockMode) return MOCK_MARKERS;

  const { TextractClient, AnalyzeDocumentCommand } = await import('@aws-sdk/client-textract');
  const { ComprehendMedicalClient, InferICD10CMCommand, DetectEntitiesV2Command } =
    await import('@aws-sdk/client-comprehendmedical');

  const region = config.aws.region;
  const textract = new TextractClient({ region });
  const cm = new ComprehendMedicalClient({ region });

  // 1) OCR + table structure
  const ocr = await textract.send(
    new AnalyzeDocumentCommand({ Document: { Bytes: buffer }, FeatureTypes: ['TABLES'] })
  );
  const text = (ocr.Blocks || [])
    .filter((b) => b.BlockType === 'LINE')
    .map((b) => b.Text)
    .join('\n');

  // 2) Medical entity detection (TEST_NAME / TEST_VALUE / TEST_UNIT)
  const med = await cm.send(new DetectEntitiesV2Command({ Text: text.slice(0, 20000) }));

  // 3) Map detected tests → our canonical marker keys
  return mapEntitiesToMarkers(med.Entities || []);
}

/** Map Comprehend Medical TEST entities to our marker keys. */
function mapEntitiesToMarkers(entities) {
  const out = [];
  for (const e of entities) {
    if (e.Category !== 'TEST_TREATMENT_PROCEDURE') continue;
    const key = matchMarkerKey(e.Text);
    if (!key) continue;
    const valueAttr = (e.Attributes || []).find((a) => a.Type === 'TEST_VALUE');
    const unitAttr = (e.Attributes || []).find((a) => a.Type === 'TEST_UNIT');
    const value = valueAttr ? parseFloat(valueAttr.Text) : NaN;
    if (Number.isNaN(value)) continue;
    out.push({ key, value, unit: unitAttr?.Text || '', sourceText: e.Text });
  }
  return out;
}

const ALIASES = {
  hba1c: [/hba1c/i, /glycated/i, /glycosylated/i],
  fasting_glucose: [/fasting.*glucose/i, /\bfbs\b/i],
  hemoglobin: [/h(a)?emoglobin/i, /\bhb\b/i],
  vitamin_d: [/vitamin\s*d/i, /25.?oh/i],
  vitamin_b12: [/b\s*-?\s*12/i, /cobalamin/i],
  total_cholesterol: [/total.*cholesterol/i],
  ldl: [/\bldl\b/i],
  hdl: [/\bhdl\b/i],
  triglycerides: [/triglyceride/i, /\btg\b/i],
  tsh: [/\btsh\b/i, /thyroid.*stimulating/i],
  creatinine: [/creatinine/i],
  alt: [/\balt\b/i, /sgpt/i],
};

function matchMarkerKey(text) {
  for (const [key, patterns] of Object.entries(ALIASES)) {
    if (patterns.some((re) => re.test(text))) return key;
  }
  return null;
}

// A realistic sample report so the whole flow runs with zero AWS setup.
const MOCK_MARKERS = [
  { key: 'hba1c', value: 6.1, unit: '%', sourceText: 'HbA1c 6.1 %' },
  { key: 'fasting_glucose', value: 108, unit: 'mg/dL', sourceText: 'Fasting Glucose 108 mg/dL' },
  { key: 'hemoglobin', value: 13.8, unit: 'g/dL', sourceText: 'Hemoglobin 13.8 g/dL' },
  { key: 'vitamin_d', value: 14, unit: 'ng/mL', sourceText: '25-OH Vitamin D 14 ng/mL' },
  { key: 'vitamin_b12', value: 180, unit: 'pg/mL', sourceText: 'Vitamin B12 180 pg/mL' },
  { key: 'total_cholesterol', value: 214, unit: 'mg/dL', sourceText: 'Total Cholesterol 214 mg/dL' },
  { key: 'ldl', value: 142, unit: 'mg/dL', sourceText: 'LDL 142 mg/dL' },
  { key: 'hdl', value: 38, unit: 'mg/dL', sourceText: 'HDL 38 mg/dL' },
  { key: 'triglycerides', value: 168, unit: 'mg/dL', sourceText: 'Triglycerides 168 mg/dL' },
  { key: 'tsh', value: 3.2, unit: 'mIU/L', sourceText: 'TSH 3.2 mIU/L' },
];
