/**
 * Comicore API Client
 *
 * Loosely coupled API module — all frontend API calls in one place.
 * Components import from here instead of using fetch() directly.
 *
 * Usage:
 *   import API from "@/lib/api";
 *   const project = await API.projects.list();
 *   const book = await API.projects.get("project_id");
 */

const BASE = "/api";

// ─── Helper ─────────────────────────────────────

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data.data;
}

// ─── Projects (Books) ───────────────────────────

const projects = {
  /**
   * List all projects
   * GET /api/engine/projects
   */
  async list() {
    return request("/engine/projects");
  },

  /**
   * Get a single project with all data (characters, world, pages, chapters)
   * GET /api/engine/project/:id
   */
  async get(id) {
    return request(`/engine/project/${id}`);
  },

  /**
   * Create a new project with characters, world, and style
   * POST /api/engine/setup
   *
   * @param {Object} data
   * @param {string} data.title - Comic title
   * @param {string} data.genre - Genre
   * @param {string} data.synopsis - Story synopsis
   * @param {string} data.tone - Tone/mood
   * @param {string} data.targetAudience - Target audience
   * @param {number} data.pageGoal - Target page count
   * @param {Array}  data.characters - Character list
   * @param {Object} data.world - World settings
   * @param {Object} data.style - Art style settings
   */
  async create(data) {
    return request("/engine/setup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── AI Overview ────────────────────────────────

const overview = {
  /**
   * Generate AI story overview for a project
   * POST /api/engine/overview
   */
  async generate(projectId) {
    return request("/engine/overview", {
      method: "POST",
      body: JSON.stringify({ projectId }),
    });
  },
};

// ─── Chapters ───────────────────────────────────

const chapters = {
  /**
   * Generate chapter plan via AI
   * POST /api/engine/chapters
   */
  async generate(projectId) {
    return request("/engine/chapters", {
      method: "POST",
      body: JSON.stringify({ projectId }),
    });
  },
};

// ─── Page Generation ────────────────────────────

const pages = {
  /**
   * Generate the next page (Claude writes + Gemini validates)
   * POST /api/engine/generate-page
   */
  async generate(projectId, userInstructions) {
    return request("/engine/generate-page", {
      method: "POST",
      body: JSON.stringify({
        projectId,
        userInstructions: userInstructions || undefined,
      }),
    });
  },

  /**
   * Approve a page
   * POST /api/engine/review-page
   */
  async approve(projectId, pageId) {
    return request("/engine/review-page", {
      method: "POST",
      body: JSON.stringify({ projectId, pageId }),
    });
  },

  /**
   * Revise a page with feedback
   * POST /api/engine/revise-page
   */
  async revise(projectId, pageId, feedback) {
    return request("/engine/revise-page", {
      method: "POST",
      body: JSON.stringify({ projectId, pageId, feedback }),
    });
  },
};

// ─── Export ─────────────────────────────────────

const API = {
  projects,
  overview,
  chapters,
  pages,
};

export default API;
