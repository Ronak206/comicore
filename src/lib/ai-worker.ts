/**
 * Comicore AI Worker Client
 *
 * Direct API calls to AI models for comic generation.
 * API: api.aisubscription.shop
 * Primary Model: google/gemini-2.5-flash
 *
 * Features:
 * - Automatic retry with exponential backoff for rate limits
 * - Multiple fallback models on failure
 *
 * Endpoints:
 *   aiWrite()   — Story, dialogue, scripts
 *   aiThink()   — Deep planning, revision analysis
 *   aiMemory()  — World-building, consistency checks
 *   aiGenerate()— Pipeline: Write → Validate
 */

// ─── Config ──────────────────────────────────────

const API_URL = "https://api.aisubscription.shop/v1/chat/completions";
const API_KEY = process.env.AI_API_KEY || "sk-onRjqG1aC1qN1lrpArhdn16QjqTExJW2hX-ZSqkMNgY";

// Model configuration with fallbacks (in priority order)
const PRIMARY_MODEL = process.env.AI_MODEL || "google/gemini-2.5-flash";

const FALLBACK_MODELS = [
  "google/gemini-2.5-flash-lite",
  "google/gemini-3.1-flash-lite-preview",
  "google/gemini-2.5-pro",
  "google/gemini-3.1-pro-preview",
  "Qwen/Qwen3.6-27B",
  "minimax-m2.5-thinking",
  "ibnzterrell/Meta-Llama-3.3-70B-Instruct-AWQ-INT4",
];

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

console.log("[AI Worker] Initialized with AI Subscription API");
console.log("[AI Worker] Primary Model:", PRIMARY_MODEL);
console.log("[AI Worker] Fallback Models:", FALLBACK_MODELS.length, "models available");

// ─── Types ───────────────────────────────────────

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  system: string;
  user: string;
  history?: Message[];
  maxTokens?: number;
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
  pipeline: "write → validate";
  write: {
    forced_model: string;
    actual_model: string;
    content: string;
  };
  validate: {
    forced_model: string;
    actual_model: string;
    validation: string;
  };
}

// ─── Utility: Delay ──────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Internal API Call with Retry & Fallback ──────────────────────────────

async function callAI(
  model: string, 
  messages: Message[], 
  maxTokens: number = 4096,
  retryCount: number = 0,
  isFallback: boolean = false
): Promise<any> {
  const currentModel = isFallback ? model : PRIMARY_MODEL;
  console.log(`[AI Worker] Calling model: ${currentModel}${retryCount > 0 ? ` (retry ${retryCount})` : ''}${isFallback ? ' [fallback]' : ''}`);
  
  if (!API_KEY) {
    throw new Error("AI_API_KEY is not configured. Please add it to your .env.local file.");
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        model: currentModel, 
        messages,
        max_tokens: maxTokens,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.error?.message || data.error || "Request failed";
      const errorCode = data.error?.code || res.status;
      
      // Handle rate limiting (429) with retry
      if (errorCode === 429 || res.status === 429) {
        console.warn(`[AI Worker] Rate limited on model ${currentModel}`);
        
        // Try with exponential backoff first
        if (retryCount < MAX_RETRIES) {
          const backoffDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`[AI Worker] Retrying in ${backoffDelay}ms...`);
          await delay(backoffDelay);
          return callAI(model, messages, maxTokens, retryCount + 1, isFallback);
        }
        
        // If retries exhausted, try fallback models
        if (!isFallback) {
          console.log("[AI Worker] Primary model retries exhausted, trying fallback models...");
          for (const fallbackModel of FALLBACK_MODELS) {
            try {
              console.log(`[AI Worker] Trying fallback model: ${fallbackModel}`);
              const fallbackRes = await fetch(API_URL, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                  model: fallbackModel, 
                  messages,
                  max_tokens: maxTokens,
                }),
              });

              if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                console.log(`[AI Worker] Fallback model ${fallbackModel} succeeded`);
                return fallbackData;
              } else {
                const errData = await fallbackRes.json();
                console.warn(`[AI Worker] Fallback ${fallbackModel} failed:`, errData.error?.message || fallbackRes.status);
              }
            } catch (fallbackError: any) {
              console.warn(`[AI Worker] Fallback model ${fallbackModel} error:`, fallbackError.message);
            }
          }
        }
        
        throw new Error(`Rate limited on all models. Please try again later.`);
      }
      
      console.error(`[AI Worker] API error (${res.status}):`, data.error);
      throw new Error(`AI API error (${res.status}): ${errorMessage}`);
    }

    console.log(`[AI Worker] Response received from ${currentModel}`);
    console.log(`[AI Worker] Tokens used - Prompt: ${data.usage?.prompt_tokens}, Completion: ${data.usage?.completion_tokens}`);
    
    return data;
  } catch (error: any) {
    // Network errors - retry
    if (error.cause?.code === 'ECONNRESET' || error.cause?.code === 'ETIMEDOUT') {
      if (retryCount < MAX_RETRIES) {
        const backoffDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[AI Worker] Network error, retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
        return callAI(model, messages, maxTokens, retryCount + 1, isFallback);
      }
    }
    
    console.error(`[AI Worker] Fetch failed for ${currentModel}:`, error.message);
    throw error;
  }
}

// ─── Public API ──────────────────────────────────

/**
 * Write endpoint — uses configured model for story writing
 * Best for: story writing, dialogue, scripts, image prompts
 */
export async function aiWrite(req: AIRequest): Promise<SingleModelResponse> {
  const messages: Message[] = [
    { role: "system", content: req.system },
    ...(req.history || []),
    { role: "user", content: req.user },
  ];

  const data = await callAI(PRIMARY_MODEL, messages, req.maxTokens || 4096);

  return {
    task: "write",
    forced_model: PRIMARY_MODEL,
    actual_model: data.model,
    response: data,
  };
}

/**
 * Think endpoint — uses configured model for deep thinking
 * Best for: deep planning, revision analysis, story architecture
 */
export async function aiThink(req: AIRequest): Promise<SingleModelResponse> {
  const messages: Message[] = [
    { role: "system", content: req.system },
    ...(req.history || []),
    { role: "user", content: req.user },
  ];

  const data = await callAI(PRIMARY_MODEL, messages, req.maxTokens || 8192);

  return {
    task: "think",
    forced_model: PRIMARY_MODEL,
    actual_model: data.model,
    response: data,
  };
}

/**
 * Memory endpoint — uses configured model for context-heavy tasks
 * Best for: world-building, consistency checks, long context tasks
 */
export async function aiMemory(req: AIRequest): Promise<SingleModelResponse> {
  const messages: Message[] = [
    { role: "system", content: req.system },
    ...(req.history || []),
    { role: "user", content: req.user },
  ];

  const data = await callAI(PRIMARY_MODEL, messages, req.maxTokens || 8192);

  return {
    task: "memory",
    forced_model: PRIMARY_MODEL,
    actual_model: data.model,
    response: data,
  };
}

/**
 * Generate endpoint — Pipeline: Write → Validate
 * Best for: generating content that needs immediate consistency check
 * Returns both the generated content AND the validation result
 */
export async function aiGenerate(req: AIRequest): Promise<PipelineResponse> {
  console.log("[AI Worker] Starting pipeline: Write → Validate");
  
  // Step 1 — Generate content
  const writeMessages: Message[] = [
    { role: "system", content: req.system },
    ...(req.history || []),
    { role: "user", content: req.user },
  ];

  const writeData = await callAI(PRIMARY_MODEL, writeMessages, req.maxTokens || 4096);
  const writeOutput = writeData.choices?.[0]?.message?.content || "";
  console.log("[AI Worker] Write output length:", writeOutput.length);

  // Step 2 — Validate
  const validateMessages: Message[] = [
    {
      role: "system",
      content: "You are a continuity validator. Review the generated content for: 1) Character consistency 2) Plot holes 3) Visual continuity 4) Timeline accuracy. Reply with APPROVED if clean, or list specific issues."
    },
    {
      role: "user",
      content: `Context:\n${(req.history || []).map(m => `${m.role}: ${m.content}`).join("\n")}\n\nGenerated content:\n${writeOutput}\n\nValidate this content.`
    }
  ];

  const validateData = await callAI(PRIMARY_MODEL, validateMessages, 2048);
  const validateOutput = validateData.choices?.[0]?.message?.content || "";
  console.log("[AI Worker] Validation output length:", validateOutput.length);

  return {
    task: "generate",
    pipeline: "write → validate",
    write: {
      forced_model: PRIMARY_MODEL,
      actual_model: writeData.model,
      content: writeOutput,
    },
    validate: {
      forced_model: PRIMARY_MODEL,
      actual_model: validateData.model,
      validation: validateOutput,
    },
  };
}

// ─── Helpers ─────────────────────────────────────

/** Extract text content from a single model response */
export function extractContent(res: SingleModelResponse): string {
  return res.response?.choices?.[0]?.message?.content || "";
}

/** Extract text from write output in pipeline response */
export function extractClaudeContent(res: PipelineResponse): string {
  return res.write?.content || "";
}

/** Extract validation text from validate output in pipeline response */
export function extractGeminiValidation(res: PipelineResponse): string {
  return res.validate?.validation || "";
}

/** Check if validation passed */
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
