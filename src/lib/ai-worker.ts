/**
 * Comicore AI Worker Client
 *
 * Calls the Cloudflare Worker for model routing.
 * The Worker handles which model to use per endpoint and the pipeline flow.
 *
 * Worker URL: https://comicore.robin241205.workers.dev
 *
 * Endpoints:
 *   POST /write    — Claude Sonnet 4.5 (story, dialogue, scripts)
 *   POST /think    — Claude 4.5 Thinking (deep planning, revision)
 *   POST /memory   — Gemini 3.1 Pro (world-building, consistency)
 *   POST /generate — Pipeline: Claude writes → Gemini validates
 */

// ─── Config ──────────────────────────────────────

const WORKER_URL = process.env.AI_WORKER_URL || "https://comicore.ai-worker.workers.dev";

console.log("[AI Worker] Using worker URL:", WORKER_URL);

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

// ─── Internal Fetch Wrapper ──────────────────────

async function callWorker(endpoint: string, body: AIRequest): Promise<Response> {
  const url = `${WORKER_URL}${endpoint}`;
  console.log(`[AI Worker] Calling ${endpoint}...`, { url });
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system: body.system,
        user: body.user,
        history: body.history || [],
      }),
    });

    console.log(`[AI Worker] Response status for ${endpoint}:`, res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
      console.error(`[AI Worker] Error for ${endpoint}:`, errorData);
      throw new Error(`AI Worker error (${res.status}): ${errorData.error || "Request failed"}`);
    }

    return res;
  } catch (error: any) {
    console.error(`[AI Worker] Fetch failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// ─── Public API ──────────────────────────────────

/**
 * Write endpoint — uses Claude Sonnet 4.5
 * Best for: story writing, dialogue, scripts, image prompts
 */
export async function aiWrite(req: AIRequest): Promise<SingleModelResponse> {
  const res = await callWorker("/write", req);
  return res.json();
}

/**
 * Think endpoint — uses Claude 4.5 Thinking
 * Best for: deep planning, revision analysis, story architecture
 */
export async function aiThink(req: AIRequest): Promise<SingleModelResponse> {
  const res = await callWorker("/think", req);
  return res.json();
}

/**
 * Memory endpoint — uses Gemini 3.1 Pro
 * Best for: world-building, consistency checks, long context tasks
 */
export async function aiMemory(req: AIRequest): Promise<SingleModelResponse> {
  const res = await callWorker("/memory", req);
  return res.json();
}

/**
 * Generate endpoint — Pipeline: Claude writes → Gemini validates
 * Best for: generating content that needs immediate consistency check
 * Returns both the generated content AND the validation result
 */
export async function aiGenerate(req: AIRequest): Promise<PipelineResponse> {
  const res = await callWorker("/generate", req);
  return res.json();
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
