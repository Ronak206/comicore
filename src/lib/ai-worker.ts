/**
 * Comicore AI Worker Client
 *
 * Direct API calls to Google Gemini for comic generation.
 * API: Google Generative AI (Gemini)
 *
 * Features:
 * - Direct Gemini API integration
 * - Automatic retry with exponential backoff
 * - Simple, lightweight implementation
 *
 * Endpoints:
 *   aiWrite()   — Story, dialogue, scripts
 *   aiThink()   — Deep planning, revision analysis
 *   aiMemory()  — World-building, consistency checks
 *   aiGenerate()— Pipeline: Write → Validate
 */

// ─── Config ──────────────────────────────────────

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const API_KEY = process.env.API_KEY || "";

// Model configuration
const MODEL = "gemini-2.0-flash";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

console.log("[AI Worker] Initialized with Google Gemini API");
console.log("[AI Worker] Model:", MODEL);

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
  model: string;
  response: {
    text: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

export interface PipelineResponse {
  task: "generate";
  pipeline: "write → validate";
  write: {
    model: string;
    content: string;
  };
  validate: {
    model: string;
    validation: string;
  };
}

// ─── Utility: Delay ──────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Build Gemini Request Body ──────────────────────────────────

function buildGeminiRequest(system: string, user: string, history?: Message[], maxTokens?: number): any {
  // Build contents array from history
  const contents: any[] = [];
  
  // Add system instruction as first user message (Gemini doesn't have system role)
  // We'll prepend it to the actual user message
  
  // Add conversation history
  if (history && history.length > 0) {
    history.forEach(msg => {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    });
  }
  
  // Combine system prompt with user message
  const fullPrompt = system ? `${system}\n\n---\n\n${user}` : user;
  
  contents.push({
    role: "user",
    parts: [{ text: fullPrompt }]
  });
  
  return {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens || 8192,
      temperature: 0.7,
      topP: 0.95,
    }
  };
}

// ─── Internal API Call with Retry ──────────────────────────────

async function callGemini(
  system: string,
  user: string,
  history?: Message[],
  maxTokens: number = 8192,
  retryCount: number = 0
): Promise<string> {
  console.log(`[AI Worker] Calling Gemini${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
  
  if (!API_KEY) {
    throw new Error("API_KEY is not configured. Please add it to your .env file.");
  }

  try {
    const url = `${API_URL}/${MODEL}:generateContent?key=${API_KEY}`;
    const body = buildGeminiRequest(system, user, history, maxTokens);
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.error?.message || "Request failed";
      
      // Handle rate limiting (429) with retry
      if (res.status === 429 && retryCount < MAX_RETRIES) {
        const backoffDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[AI Worker] Rate limited, retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
        return callGemini(system, user, history, maxTokens, retryCount + 1);
      }
      
      console.error(`[AI Worker] API error (${res.status}):`, data);
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    console.log(`[AI Worker] Response received, length: ${text.length}`);
    
    return text;
  } catch (error: any) {
    // Network errors - retry
    if (error.cause?.code === 'ECONNRESET' || error.cause?.code === 'ETIMEDOUT') {
      if (retryCount < MAX_RETRIES) {
        const backoffDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[AI Worker] Network error, retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
        return callGemini(system, user, history, maxTokens, retryCount + 1);
      }
    }
    
    console.error(`[AI Worker] Fetch failed:`, error.message);
    throw error;
  }
}

// ─── Public API ──────────────────────────────────

/**
 * Write endpoint — uses Gemini for story writing
 * Best for: story writing, dialogue, scripts, image prompts
 */
export async function aiWrite(req: AIRequest): Promise<SingleModelResponse> {
  const text = await callGemini(req.system, req.user, req.history, req.maxTokens || 4096);

  return {
    task: "write",
    model: MODEL,
    response: {
      text,
    },
  };
}

/**
 * Think endpoint — uses Gemini for deep thinking
 * Best for: deep planning, revision analysis, story architecture
 */
export async function aiThink(req: AIRequest): Promise<SingleModelResponse> {
  const text = await callGemini(req.system, req.user, req.history, req.maxTokens || 8192);

  return {
    task: "think",
    model: MODEL,
    response: {
      text,
    },
  };
}

/**
 * Memory endpoint — uses Gemini for context-heavy tasks
 * Best for: world-building, consistency checks, long context tasks
 */
export async function aiMemory(req: AIRequest): Promise<SingleModelResponse> {
  const text = await callGemini(req.system, req.user, req.history, req.maxTokens || 8192);

  return {
    task: "memory",
    model: MODEL,
    response: {
      text,
    },
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
  const writeOutput = await callGemini(req.system, req.user, req.history, req.maxTokens || 4096);
  console.log("[AI Worker] Write output length:", writeOutput.length);

  // Step 2 — Validate
  const validateSystem = "You are a continuity validator. Review the generated content for: 1) Character consistency 2) Plot holes 3) Visual continuity 4) Timeline accuracy. Reply with APPROVED if clean, or list specific issues.";
  const validateUser = `Context:\n${(req.history || []).map(m => `${m.role}: ${m.content}`).join("\n")}\n\nGenerated content:\n${writeOutput}\n\nValidate this content.`;
  
  const validateOutput = await callGemini(validateSystem, validateUser, [], 2048);
  console.log("[AI Worker] Validation output length:", validateOutput.length);

  return {
    task: "generate",
    pipeline: "write → validate",
    write: {
      model: MODEL,
      content: writeOutput,
    },
    validate: {
      model: MODEL,
      validation: validateOutput,
    },
  };
}

// ─── Helpers ─────────────────────────────────────

/** Extract text content from a single model response */
export function extractContent(res: SingleModelResponse): string {
  return res.response?.text || "";
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
