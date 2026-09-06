import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, type Schema } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

// Load template library configuration from /config/templates.json
let templatesConfig = {
  mood_to_vibe: {
    grateful: 'sunlit-botanical',
    warm: 'sunlit-botanical',
    summery: 'sunlit-botanical',
    content: 'sunlit-botanical',
    calm: 'sage-affirmation',
    gentle: 'sage-affirmation',
    encouraging: 'sage-affirmation',
    hopeful: 'sage-affirmation',
    tender: 'dusty-rose-diary',
    cozy: 'dusty-rose-diary',
    romantic: 'dusty-rose-diary',
    sentimental: 'dusty-rose-diary',
    moody: 'dark-academia',
    introspective: 'dark-academia',
    literary: 'dark-academia',
    melancholy: 'dark-academia',
    nostalgic: 'kraft-vintage',
    wistful: 'kraft-vintage',
    reflective_on_a_journey: 'kraft-vintage',
  } as Record<string, string>,
  template_library: [] as Array<{
    template_id: string;
    vibe: string;
    orientation: 'horizontal' | 'vertical';
    text_color: string;
    background_asset: string;
  }>,
};

try {
  const configPath = path.join(process.cwd(), 'config', 'templates.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    templatesConfig = JSON.parse(raw);
  }
} catch (e) {
  console.warn('Failed to parse /config/templates.json, using defaults:', e);
}

const ALL_TEMPLATE_IDS = [
  'sunlit-botanical-horizontal',
  'sunlit-botanical-vertical',
  'sage-affirmation-horizontal',
  'sage-affirmation-vertical',
  'dusty-rose-diary-horizontal',
  'dusty-rose-diary-vertical',
  'dark-academia-horizontal',
  'dark-academia-vertical',
  'kraft-vintage-horizontal',
  'kraft-vintage-vertical',
  'sunlit-botanical-01',
];

const app = express();
const PORT = 3000;

// 1. Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// 2. Resilient Model Fallback Ladder (Production Directive 6)
// Primary: gemini-3.6-flash, High-Availability: gemini-3.5-flash-lite / gemini-3.1-flash-lite, Dynamic: gemini-flash-latest, Deep Reasoning: gemini-3.7-flash
const MODEL_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
];

const RECOVERABLE_CODES = [503, 429, 404, 500];

// Strict Journal Design Spec Schema enforced on Gemini per Custom Instructions Section 8
const journalDesignSpecSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    template_id: {
      type: Type.STRING,
      enum: ALL_TEMPLATE_IDS,
      description: 'Chosen template id from the Fixed Template Library matching the selected mood and orientation',
    },
    mood: {
      type: Type.STRING,
      description: 'One of the mood taxonomy keywords (e.g. grateful, warm, summery, content, calm, gentle, encouraging, hopeful, tender, cozy, romantic, sentimental, moody, introspective, literary, melancholy, nostalgic, wistful, reflective_on_a_journey)',
    },
    orientation: {
      type: Type.STRING,
      enum: ['horizontal', 'vertical'],
      description: 'Orientation: "horizontal" for shorter dumps (roughly under ~350 characters of combined content), "vertical" for longer dumps',
    },
    title: {
      type: Type.STRING,
      description: 'Short poetic page title, strictly <= 28 characters',
    },
    feeling_block: {
      type: Type.STRING,
      description: 'Concise block capturing emotional feeling, strictly <= 140 characters',
    },
    gratitude_list: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
        description: 'Single gratitude item, strictly <= 40 characters',
      },
      description: 'List of up to 3 things the user is grateful for',
    },
    quote: {
      type: Type.STRING,
      description: 'Thoughtful takeaway or quote, strictly <= 60 characters',
    },
  },
  required: ['template_id', 'mood', 'title', 'feeling_block', 'gratitude_list'],
};

/**
 * Standard Helper: executes content generation across the free-tier model fallback ladder
 * with strict responseSchema constraints.
 */
async function generateJournalSpecWithFallback(prompt: string, systemInstruction: string) {
  const client = getGeminiClient();
  let lastError: unknown = null;

  for (const modelName of MODEL_LADDER) {
    try {
      console.log(`[Gemini Semantic Stage] Attempting generation with free-tier model: ${modelName}`);
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: journalDesignSpecSchema,
          temperature: 0.6,
        },
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: modelName };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Semantic Stage] Model ${modelName} failed, trying next fallback model:`, err?.message || err);
      // Continue to next model in the fallback ladder
    }
  }

  throw lastError || new Error('All models in fallback ladder failed.');
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Route: /api/gemini/design-spec
 * Converts raw unstructured thought fragments into a strict, template-constrained Journal Design Spec (JSON only)
 */
app.post('/api/gemini/design-spec', async (req: Request, res: Response) => {
  try {
    // Null-Safe Defensive Payload Ingestion
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const rawFragments = typeof body.rawFragments === 'string' ? body.rawFragments.trim() : '';

    if (!rawFragments) {
      return res.status(400).json({
        error: 'Invalid input: "rawFragments" is required and cannot be empty.',
      });
    }

    if (rawFragments.length > 8000) {
      return res.status(400).json({
        error: 'Input too large. Please limit thought fragments to 8,000 characters.',
      });
    }

    const charCount = rawFragments.length;
    // Orientation Selection: "horizontal" for shorter dumps (roughly under ~350 chars), "vertical" for longer dumps
    const suggestedOrientation: 'horizontal' | 'vertical' = charCount < 350 ? 'horizontal' : 'vertical';

    const systemPrompt = `You are a semantic journal architect adhering strictly to Section 8: Visual Design System — Template-Based Deterministic Rendering.
Your task is to analyze the user's raw, unpolished, unstructured thought fragments and produce a Journal Design Spec JSON fitted to a template from the Fixed Template Library.

Template Library & Mood Mapping:
- "sunlit-botanical" vibe (IDs: "sunlit-botanical-horizontal", "sunlit-botanical-vertical"):
  Mood keywords: grateful, warm, summery, content (warm brown ink)
- "sage-affirmation" vibe (IDs: "sage-affirmation-horizontal", "sage-affirmation-vertical"):
  Mood keywords: calm, gentle, encouraging, hopeful (forest sage ink)
- "dusty-rose-diary" vibe (IDs: "dusty-rose-diary-horizontal", "dusty-rose-diary-vertical"):
  Mood keywords: tender, cozy, romantic, sentimental (dusty rose ink)
- "dark-academia" vibe (IDs: "dark-academia-horizontal", "dark-academia-vertical"):
  Mood keywords: moody, introspective, literary, melancholy (dark ink #2f2418 on parchment cards)
- "kraft-vintage" vibe (IDs: "kraft-vintage-horizontal", "kraft-vintage-vertical"):
  Mood keywords: nostalgic, wistful, reflective_on_a_journey (sepia kraft ink)

Orientation Selection Rule:
- Choose "horizontal" for shorter dumps (roughly under ~350 characters of combined content) where a landscape card reads cleanly.
- Choose "vertical" for longer dumps, since the taller layout gives more total slot space before summarization is needed.
Input length: ${charCount} characters (suggested orientation: "${suggestedOrientation}").

Template ID must match the chosen vibe and orientation:
"[vibe]-[orientation]", e.g. "sunlit-botanical-horizontal", "dark-academia-vertical", "sage-affirmation-horizontal", "dusty-rose-diary-vertical", "kraft-vintage-horizontal".

Slot Constraints (ENFORCE STRICTLY):
1. template_id: MUST be one of the valid library IDs matching [vibe]-[orientation].
2. mood: MUST be one of the mood taxonomy keywords (e.g. grateful, warm, calm, gentle, tender, moody, introspective, nostalgic, wistful, etc.).
3. orientation: "horizontal" or "vertical".
4. title: <= 28 characters max. Short, poetic, display title.
5. feeling_block: <= 140 characters max. Concise prose synthesizing how they feel.
6. gratitude_list: Array of up to 3 items max, each item <= 40 characters max.
7. quote: <= 60 characters max. Short uplifting insight or takeaway extracted from the fragments.

DO NOT invent extra fields. DO NOT exceed character limits. Output JSON conforming strictly to the schema.`;

    const userPrompt = `Here are my raw thought fragments (${charCount} chars):
"""
${rawFragments}
"""

Please convert these fragments into the strict Journal Design Spec JSON following the mood taxonomy and orientation rules.`;

    const { text, modelUsed } = await generateJournalSpecWithFallback(userPrompt, systemPrompt);

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(json)?\n?/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanedText);

    // Map mood keyword to vibe using templatesConfig
    const rawMood = String(parsed.mood || '').toLowerCase().trim();
    const mappedVibe = templatesConfig.mood_to_vibe[rawMood] || 'sunlit-botanical';
    const finalOrientation: 'horizontal' | 'vertical' =
      parsed.orientation === 'vertical' || (charCount >= 350 && parsed.orientation !== 'horizontal')
        ? 'vertical'
        : 'horizontal';

    let finalTemplateId = parsed.template_id;
    if (!finalTemplateId || !ALL_TEMPLATE_IDS.includes(finalTemplateId)) {
      finalTemplateId = `${mappedVibe}-${finalOrientation}`;
    }

    // Defensive clamping to guarantee strict adherence to slot constraints
    const designSpec = {
      template_id: finalTemplateId,
      mood: parsed.mood || rawMood || mappedVibe,
      orientation: finalOrientation,
      title: String(parsed.title || 'Journal Reflection').slice(0, 28),
      feeling_block: String(parsed.feeling_block || '').slice(0, 140),
      gratitude_list: (Array.isArray(parsed.gratitude_list) ? parsed.gratitude_list : [])
        .slice(0, 3)
        .map((item: any) => String(item).slice(0, 40)),
      quote: parsed.quote ? String(parsed.quote).slice(0, 60) : undefined,
    };

    return res.json({
      success: true,
      modelUsed,
      designSpec,
    });
  } catch (error: any) {
    console.error('[API /api/gemini/design-spec Error]:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate journal design spec.',
      details: process.env.NODE_ENV !== 'production' ? String(error) : undefined,
    });
  }
});

// Vite dev middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Scrapbook Server] running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
