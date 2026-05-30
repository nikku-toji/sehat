import { config } from '../config/index.js';

/**
 * Generates plain-language insights and a personalized plan from the classified
 * markers + profile + family history.
 *
 * Live path: Claude on Amazon Bedrock (in-region ap-south-1, keeps PHI resident).
 * The model is asked to return STRICT JSON; we parse defensively.
 *
 * The prompt enforces advisory (not diagnostic) language — see SYSTEM_PROMPT.
 *
 * @returns {Promise<{insights:Array, plan:Object, hereditaryRisk:Array}>}
 */
export async function generateInsightsAndPlan({ profile, classified, summary, familyHistory }) {
  if (config.mockMode) return mockOutput({ profile, classified, summary });

  const { BedrockRuntimeClient, InvokeModelCommand } =
    await import('@aws-sdk/client-bedrock-runtime');
  const client = new BedrockRuntimeClient({ region: config.aws.region });

  const userPayload = JSON.stringify({ profile, classified, summary, familyHistory });

  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content:
          `Here is the patient context as JSON:\n${userPayload}\n\n` +
          `Respond with ONLY the JSON object described in your instructions. No prose, no markdown.`,
      },
    ],
  };

  const res = await client.send(
    new InvokeModelCommand({
      modelId: config.aws.bedrockModelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body),
    })
  );

  const decoded = JSON.parse(new TextDecoder().decode(res.body));
  const text = (decoded.content || []).map((b) => b.text || '').join('');
  return safeParse(text);
}

const SYSTEM_PROMPT = `You are a careful wellness assistant for an Indian audience.
You produce general lifestyle and nutrition guidance from blood-marker data. You are NOT a
doctor and must never diagnose, prescribe medication, or state anything as a medical fact.
Use advisory language ("may", "consider", "discuss with your physician"). Always assume the
reader will also consult a doctor. Favor Indian foods and realistic, affordable options.

Return STRICT JSON with this exact shape and nothing else:
{
  "insights": [{ "marker": string, "value": string, "status": "optimal|borderline|concerning",
                 "meaning": string, "whatToDo": string }],
  "plan": {
    "diet": { "eat": string[], "avoid": string[], "sampleDay": string },
    "activity": string[],
    "sleep": string[],
    "hydration": string,
    "retest": string[]
  },
  "hereditaryRisk": [{ "condition": string, "basis": string, "suggestion": string }]
}`;

function safeParse(text) {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { insights: [], plan: {}, hereditaryRisk: [], _parseError: true };
  }
}

// ── Deterministic mock that mirrors the live JSON shape ──
function mockOutput({ profile, classified, summary }) {
  const concerning = summary.abnormal.map((m) => m.label).join(', ') || 'none flagged';

  const insights = classified.filter(Boolean).map((m) => ({
    marker: m.label,
    value: `${m.value} ${m.unit}`.trim(),
    status: m.status,
    meaning: m.note,
    whatToDo:
      m.status === 'optimal'
        ? 'Maintain current habits.'
        : `Address through diet and lifestyle; discuss ${m.label} with your physician.`,
  }));

  return {
    insights,
    plan: {
      diet: {
        eat: ['Leafy greens (palak, methi)', 'Dals & sprouts', 'Citrus & guava', 'Fatty fish or flaxseed', 'Nuts (almonds, walnuts)'],
        avoid: ['Deep-fried snacks', 'Refined sugar & sweets', 'White rice in excess', 'Vanaspati / trans fats'],
        sampleDay:
          'Breakfast: besan chilla + curd. Lunch: 2 roti, dal, sabzi, salad. Snack: fruit + handful of nuts. Dinner: grilled paneer/fish + vegetables.',
      },
      activity: ['30–40 min brisk walk daily', 'Strength work 2×/week', 'Take stairs; 250 steps/hour'],
      sleep: ['7–8 hours', 'Fixed sleep/wake time', 'No screens 1 hour before bed'],
      hydration: '2.5–3 litres/day; start the morning with water.',
      retest: ['Recheck Vitamin D and lipid profile in 3 months', `Monitor: ${concerning}`],
    },
    hereditaryRisk: buildHereditaryRisk(profile),
    _mock: true,
  };
}

function buildHereditaryRisk(profile) {
  const fh = profile?.familyHistory || [];
  const risks = [];
  if (fh.some((h) => /diabet/i.test(h.condition || ''))) {
    risks.push({
      condition: 'Type 2 diabetes',
      basis: 'Reported in family history; combined with borderline HbA1c.',
      suggestion: 'Prioritize weight, fibre, and activity; annual HbA1c.',
    });
  }
  if (fh.some((h) => /cardiac|heart|cholesterol/i.test(h.condition || ''))) {
    risks.push({
      condition: 'Cardiovascular disease',
      basis: 'Family cardiac history with elevated LDL.',
      suggestion: 'Lipid-aware diet; discuss screening cadence with a physician.',
    });
  }
  return risks;
}
