/**
 * Comicore AI Worker Client
 *
 * Direct API calls to AI models for comic generation.
 * Models:
 *   - Claude Sonnet 4.5 (story, dialogue, scripts)
 *   - Claude Sonnet 4.5 Thinking (deep planning, revision)
 *   - Gemini 3.1 Pro (world-building, consistency checks)
 *
 * Endpoints:
 *   aiWrite()   — Claude Sonnet 4.5 (story, dialogue, scripts)
 *   aiThink()   — Claude 4.5 Thinking (deep planning, revision)
 *   aiMemory()  — Gemini 3.1 Pro (world-building, consistency)
 *   aiGenerate()— Pipeline: Claude writes → Gemini validates
 */

// ─── Config ──────────────────────────────────────

const API_URL = "https://api.aisubscription.shop/v1/chat/completions";
const API_KEY = process.env.AI_API_KEY || "sk-onRjqG1aC1qN1lrpArhdn16QjqTExJW2hX-ZSqkMNgY";

const MODELS = {
  write: "claude-sonnet-4.5",
  think: "claude-sonnet-4.5-thinking",
  memory: "google/gemini-3.1-pro-preview",
};

console.log("[AI Worker] Initialized with direct API calls");

// ─── Types ───────────────────────────────────────

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  system: string;
  user: string;
  history?: Message[];
}

export interface SingleModelResponse {
  task: string;
  forced_model: string;
  actual_model: string;
  response: {
    id: string;
    choices: Array<{
      message: { role: string; content: string };
      finish_reason: string;
    }>;
    model: string;
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };
}

export interface PipelineResponse {
  task: "generate";
  pipeline: "claude_write → gemini_validate";
  claude: {
    forced_model: string;
    actual_model: string;
    content: string;
  };
  gemini: {
    forced_model: string;
    actual_model: string;
    validation: string;
  };
}

// ─── Internal API Call ──────────────────────────────

async function callAI(model: string, messages: Message[]): Promise<any> {
  console.log(`[AI Worker] Calling model: ${model}`);
  
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
      console.error(`[AI Worker] API error (${res.status}):`, errorData);
      throw new Error(`AI API error (${res.status}): ${errorData.error || "Request failed"}`);
    }

    const data = await res.json();
    console.log(`[AI Worker] Response received from ${model}`);
    
    return data;
  } catch (error: any) {
    console.error(`[AI Worker] Fetch failed for ${model}:`, error.message);
    throw error;
  }
}

// ─── Public API ──────────────────────────────────

/**
 * Write endpoint — uses Claude Sonnet 4.5
 * Best for: story writing, dialogue, scripts, image prompts
 */
export async function aiWrite(req: AIRequest): Promise<SingleModelResponse> {
  const messages: Message[] = [
    { role: "system", content: req.system },
    ...(req.history || []),
    { role: "user", content: req.user },
  ];

  const data = await callAI(MODELS.write, messages);

  return {
    task: "write",
    forced_model: MODELS.write,
    actual_model: data.model,
    response: data,
  };
}

/**
 * Think endpoint — uses Claude 4.5 Thinking
 * Best for: deep planning, revision analysis, story architecture
 */
export async function aiThink(req: AIRequest): Promise<SingleModelResponse> {
  const messages: Message[] = [
    { role: "system", content: req.system },
    ...(req.history || []),
    { role: "user", content: req.user },
  ];

  const data = await callAI(MODELS.think, messages);

  return {
    task: "think",
    forced_model: MODELS.think,
    actual_model: data.model,
    response: data,
  };
}

/**
 * Memory endpoint — uses Gemini 3.1 Pro
 * Best for: world-building, consistency checks, long context tasks
 */
export async function aiMemory(req: AIRequest): Promise<SingleModelResponse> {
  const messages: Message[] = [
    { role: "system", content: req.system },
    ...(req.history || []),
    { role: "user", content: req.user },
  ];

  const data = await callAI(MODELS.memory, messages);

  return {
    task: "memory",
    forced_model: MODELS.memory,
    actual_model: data.model,
    response: data,
  };
}

/**
 * Generate endpoint — Pipeline: Claude writes → Gemini validates
 * Best for: generating content that needs immediate consistency check
 * Returns both the generated content AND the validation result
 */
export async function aiGenerate(req: AIRequest): Promise<PipelineResponse> {
  console.log("[AI Worker] Starting pipeline: Claude write → Gemini validate");
  
  // Step 1 — Claude generates content
  const claudeMessages: Message[] = [
    { role: "system", content: req.system },
    ...(req.history || []),
    { role: "user", content: req.user },
  ];

  const claudeData = await callAI(MODELS.write, claudeMessages);
  const claudeOutput = claudeData.choices?.[0]?.message?.content || "";
  console.log("[AI Worker] Claude output length:", claudeOutput.length);

  // Step 2 — Gemini validates
  const geminiMessages: Message[] = [
    {
      role: "system",
      content: "You are a continuity validator. Review the generated content for: 1) Character consistency 2) Plot holes 3) Visual continuity 4) Timeline accuracy. Reply with APPROVED if clean, or list specific issues."
    },
    {
      role: "user",
      content: `Context:\n${(req.history || []).map(m => `${m.role}: ${m.content}`).join("\n")}\n\nGenerated content:\n${claudeOutput}\n\nValidate this content.`
    }
  ];

  const geminiData = await callAI(MODELS.memory, geminiMessages);
  const geminiOutput = geminiData.choices?.[0]?.message?.content || "";
  console.log("[AI Worker] Gemini validation length:", geminiOutput.length);

  return {
    task: "generate",
    pipeline: "claude_write → gemini_validate",
    claude: {
      forced_model: MODELS.write,
      actual_model: claudeData.model,
      content: claudeOutput,
    },
    gemini: {
      forced_model: MODELS.memory,
      actual_model: geminiData.model,
      validation: geminiOutput,
    },
  };
}

// ─── Helpers ─────────────────────────────────────

/** Extract text content from a single model response */
export function extractContent(res: SingleModelResponse): string {
  return res.response?.choices?.[0]?.message?.content || "";
}

/** Extract text from Claude output in pipeline response */
export function extractClaudeContent(res: PipelineResponse): string {
  return res.claude?.content || "";
}

/** Extract validation text from Gemini output in pipeline response */
export function extractGeminiValidation(res: PipelineResponse): string {
  return res.gemini?.validation || "";
}

/** Check if Gemini validation passed */
export function isValidationApproved(res: PipelineResponse): boolean {
  const validation = extractGeminiValidation(res).toUpperCase();
  return validation.includes("APPROVED");
}

/** Build history array from page summaries (for context) */
export function buildPageHistory(pages: Array<{ script: string }>, maxPages: number = 5): Message[] {
  const recentPages = pages.slice(-maxPages);
  return recentPages.map((page) => ({
    role: "assistant" as const,
    content: page.script,
  }));
}
