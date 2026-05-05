# Comicore

<p align="center">
  <strong>AI-Powered Comic Generation Engine</strong>
</p>

<p align="center">
  Page-by-page comic creation with memory-aware storytelling, user review workflows, and collaborative world-building.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-black?logo=react" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-black?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## Overview

Comicore is an intelligent comic generation system that allows users to create full comic books page by page. Users provide story information, and the AI generates each comic page sequentially. After every page is generated, the user reviews it before the next page is created, ensuring creative control throughout the entire process.

### Core Philosophy

- **Story-First Approach** - The AI remembers the entire narrative, character arcs, and visual style across all pages
- **Human-in-the-Loop** - Every page is reviewed by the user before proceeding, giving full creative direction
- **Memory-Aware Generation** - Advanced memory system ensures consistency across characters, settings, plot threads, and art style
- **Collaborative by Design** - Built for teams to work together on different parts of the system

---

## How It Works

```
User Input (Story Details) --> AI Story Engine --> Generate Page 1 --> User Review
                                                                      |
                                                                  Approved?
                                                                      |
                                                          Yes --------+-------- No
                                                          |                     |
                                                    Generate Page 2         Revise Page 1
                                                          |                     |
                                                    User Review <-- ---------+
                                                          |
                                                     Continue...
                                                          |
                                                    Final Comic Export
```

### Step-by-Step Flow

1. **Story Setup** - User provides the comic premise, characters, setting, art style, and any reference images
2. **Page Generation** - AI generates the next comic page (panels, dialogue, artwork) based on the story context and all previous pages
3. **User Review** - User reviews the generated page and can:
   - **Approve** - Lock the page and move to the next one
   - **Request Revision** - Provide feedback to regenerate with changes
   - **Edit Manually** - Make direct edits to panels, dialogue, or layout
4. **Context Memory Update** - The memory system absorbs the approved page's content, updating character states, plot progression, and visual continuity
5. **Repeat** - The cycle continues until all pages are complete
6. **Export** - Compile all approved pages into a final comic book (PDF, CBZ, or image sequence)

---

## What's Built

### UI (feature/ui-review branch)

The frontend is a dark-themed, comic-panel-inspired website built with Next.js 16, React 19, Tailwind CSS 4, and shadcn/ui. Design choices:

- **Single accent color** (gold `#E8B931` on black `#0A0A0A`) - no color variation
- **Single font family** (Geist Sans) throughout - no font variation
- **No hover effects on cards** - static, brutalist design
- **Comic-panel inspired** - dashed dividers, halftone dot patterns, film grain overlay, corner brackets, text-stroke headings
- **Not AI-generated looking** - raw, handcrafted aesthetic

#### Pages

| Page | Description |
|------|-------------|
| **Landing Page** | Hero section, features grid, how-it-works steps, masonry gallery, memory system explainer, CTA, footer |
| **Sign Up** | Split-panel layout with decorative left panel (feature highlights) and form right panel |
| **Log In** | Split-panel layout with stats dashboard mockup and form |

#### Landing Page Sections

1. **Navbar** - Fixed dark navbar with logo, navigation links, Log In/Sign Up buttons, mobile hamburger menu
2. **Hero** - Bold `text-stroke` heading, social proof stats, dual CTAs, animated browser mockup showing comic editor preview with panel grid
3. **Features** - 9-card grid with `1px` gap borders (Story Engine, Panel Artwork, Smart Layouts, Page Review, Memory System, Character Bible, Dialogue Writer, Style Transfer, Export)
4. **How It Works** - 4-step process with inline visual mockups (Describe, Generate, Review, Build)
5. **Gallery** - Masonry layout with dual marquee banners scrolling genre names
6. **Memory System** - 3 memory layers, compression strategy diagram, performance stats bar
7. **CTA + Footer** - Final call-to-action and 4-column footer

#### Components Structure

```
src/components/comicore/
├── Navbar.tsx            # Fixed navigation bar
├── HeroSection.tsx       # Hero with browser mockup
├── FeaturesSection.tsx   # 9-card feature grid
├── HowItWorksSection.tsx # 4-step process
├── GallerySection.tsx    # Masonry gallery + marquees
├── MemorySection.tsx     # Memory system explainer
├── CTASection.tsx        # Final call-to-action
├── Footer.tsx            # Site footer
├── SignUpPage.tsx        # Sign up (dummy/placeholder)
└── LoginPage.tsx         # Log in (dummy/placeholder)
```

### API Routes (feature/ui-review branch)

9 REST API routes with full JSDoc documentation (request schema, response schema, error codes):

```
src/app/api/
├── story/
│   ├── create/route.ts     # POST - Create new comic session
│   └── [id]/route.ts       # GET  - Get story details and progress
├── generate/
│   ├── page/route.ts       # POST - Generate next comic page
│   └── revise/route.ts     # POST - Revise a page with feedback
├── review/
│   ├── approve/route.ts    # POST - Approve and lock a page
│   └── feedback/route.ts   # POST - Submit revision feedback
├── memory/
│   └── context/route.ts    # GET  - Get full story memory state
└── export/
    ├── pdf/route.ts        # POST - Export comic as PDF
    └── cbz/route.ts        # POST - Export comic as CBZ
```

#### API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/story/create` | Create a new comic story session with title, characters, genre, art style, premise |
| `GET` | `/api/story/[id]` | Get full story details, progress, approved pages, optional memory context |
| `POST` | `/api/generate/page` | Generate the next comic page (script + panels + artwork) |
| `POST` | `/api/generate/revise` | Revise a page based on user feedback (full/artwork/dialogue/layout only) |
| `POST` | `/api/review/approve` | Approve and lock a page, triggers memory system update |
| `POST` | `/api/review/feedback` | Store user feedback with per-panel ratings |
| `GET` | `/api/memory/context` | Get the full 3-layer memory state (story, visual, panel) |
| `POST` | `/api/export/pdf` | Export all approved pages as PDF |
| `POST` | `/api/export/cbz` | Export as CBZ (Comic Book ZIP) |

> All endpoints return placeholder/dummy data matching the documented schema. Ready to be wired to real AI services.

---

## Memory System Architecture

The biggest challenge in long-form comic generation is **context consistency**. Comicore solves this with a multi-layered memory system:

### Layer 1: Story Memory (Semantic)
- Tracks the overall plot arc, chapter structure, and narrative beats
- Stores character relationships, motivations, and development arcs
- Maintains a timeline of events and their consequences
- Uses a **rolling summary** approach - condensing older pages into high-level summaries while keeping recent pages in full detail

### Layer 2: Visual Memory (Character Consistency)
- Stores character design references (appearance, clothing, expressions)
- Tracks character position, poses, and visual changes across pages
- Maintains art style consistency through style embedding
- Uses **character sheets** that evolve as the story progresses

### Layer 3: Panel Memory (Page Continuity)
- Tracks panel layouts, pacing patterns, and visual flow
- Remembers the last panel of each page for seamless transitions
- Stores dialogue style and tone for each character

### Memory Compression Strategy

To handle unlimited pages without running out of context:

| Memory Type | Storage | Retrieval |
|------------|---------|-----------|
| Recent Pages (last 3-5) | Full detail | Direct access |
| Older Pages | Rolling summary | Semantic search |
| Character Bible | Structured JSON | Always available |
| World Rules | Fact database | Always available |
| Art Style | Embedding vectors | Similarity search |
| Plot Threads | Status tracker | Active query |

---

## AI Pipeline

```
┌─────────────────────────────────────────────────────┐
│                   COMICORE PIPELINE                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Story Setup                                         │
│    └── claude-sonnet-4.5 (story bible creation)     │
│                                                      │
│  Page Generation Loop                                │
│    ├── claude-sonnet-4.5-thinking (plan page)       │
│    ├── claude-sonnet-4.5 (write script + dialogue)  │
│    ├── gpt-4o (structured layout/JSON output)       │
│    └── glm-5-thinking (consistency validation)      │
│                                                      │
│  User Review → Revision                              │
│    └── deepseek-3.2-thinking (process feedback)     │
│                                                      │
│  Memory System                                       │
│    ├── claude-haiku-4.5 (page summaries)            │
│    └── glm-5-thinking (context database)            │
│                                                      │
│  Export                                              │
│    └── gpt-4o (format conversion scripts)           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## AI Worker Router (Cloudflare)

The AI routing layer is deployed as a **Cloudflare Worker** that dispatches tasks between **Claude** (writer/planner) and **Gemini** (memory/validator). All AI calls from the Next.js backend proxy through this worker.

### Worker Source

```js
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const API_KEY = "sk-onRjqG1aC1qN1lrpArhdn16QjqTExJW2hX-ZSqkMNgY"; // move to env later

      // ─── Health / model info ───
      if (path === "/") {
        return new Response(JSON.stringify({
          service: "Comicore AI Router",
          models: {
            claude: "claude-sonnet-4.5",
            gemini: "google/gemini-3.1-pro-preview"
          },
          endpoints: {
            "/write":   "Claude — story, dialogue, scripts, image prompts",
            "/think":   "Claude — deep planning, revision analysis",
            "/memory":  "Gemini — world-building, consistency checks, long context",
            "/generate":"Pipeline — Claude writes → Gemini validates → returns both"
          }
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }

      // ─── Body parser (works for GET & POST) ───
      let bodyData = {};
      if (request.method === "POST") {
        bodyData = await request.json().catch(() => ({}));
      }

      const systemPrompt = bodyData.system || url.searchParams.get("system") || "You are a helpful AI assistant.";
      const userInput    = bodyData.user    || url.searchParams.get("user")    || "Hello!";
      const history      = bodyData.history || [];                              // [{role,content}, …]

      // ─── Route to correct model ───
      let model;
      let taskType;

      if (path === "/write") {
        model    = "claude-sonnet-4.5";
        taskType = "write";
      } else if (path === "/think") {
        model    = "claude-sonnet-4.5-thinking";
        taskType = "think";
      } else if (path === "/memory") {
        model    = "google/gemini-3.1-pro-preview";
        taskType = "memory";
      } else if (path === "/generate") {
        // ─── PIPELINE: Claude writes → Gemini validates ───
        return handlePipeline(systemPrompt, userInput, history, API_KEY);
      } else {
        return new Response(JSON.stringify({
          error: "Unknown endpoint. Use /write, /think, /memory, or /generate"
        }), { status: 404, headers: { "Content-Type": "application/json" } });
      }

      // ─── Single model call ───
      const messages = [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userInput }
      ];

      const apiResponse = await fetch("https://api.aisubscription.shop/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model, messages })
      });

      const data = await apiResponse.json();

      return new Response(JSON.stringify({
        task:          taskType,
        forced_model:  model,
        actual_model:  data.model,
        response:      data
      }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};

// ─────────────────────────────────────────────
// PIPELINE: Claude writes → Gemini validates
// ─────────────────────────────────────────────
async function handlePipeline(systemPrompt, userInput, history, API_KEY) {
  const claudeMessages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userInput }
  ];

  // Step 1 — Claude generates content
  const claudeRes = await fetch("https://api.aisubscription.shop/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4.5",
      messages: claudeMessages
    })
  });
  const claudeData = await claudeRes.json();
  const claudeOutput = claudeData.choices?.[0]?.message?.content || "";

  // Step 2 — Gemini validates
  const geminiMessages = [
    {
      role: "system",
      content: "You are a continuity validator. Review the generated content for: 1) Character consistency 2) Plot holes 3) Visual continuity 4) Timeline accuracy. Reply with APPROVED if clean, or list specific issues."
    },
    {
      role: "user",
      content: `Context:\n${history.map(m => `${m.role}: ${m.content}`).join("\n")}\n\nGenerated content:\n${claudeOutput}\n\nValidate this content.`
    }
  ];

  const geminiRes = await fetch("https://api.aisubscription.shop/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-pro-preview",
      messages: geminiMessages
    })
  });
  const geminiData = await geminiRes.json();
  const geminiOutput = geminiData.choices?.[0]?.message?.content || "";

  return new Response(JSON.stringify({
    task: "generate",
    pipeline: "claude_write → gemini_validate",
    claude: {
      forced_model: "claude-sonnet-4.5",
      actual_model: claudeData.model,
      content: claudeOutput
    },
    gemini: {
      forced_model: "google/gemini-3.1-pro-preview",
      actual_model: geminiData.model,
      validation: geminiOutput
    }
  }, null, 2), {
    headers: { "Content-Type": "application/json" }
  });
}
```

### Endpoints

| Endpoint | Model | Purpose |
|----------|-------|---------|
| `GET /` | — | Health check + model info |
| `POST /write` | Claude Sonnet 4.5 | Story, dialogue, scripts, image prompts |
| `POST /think` | Claude 4.5 Thinking | Deep planning, revision analysis |
| `POST /memory` | Gemini 3.1 Pro | World-building, consistency, long context |
| `POST /generate` | **Both** | Claude writes → Gemini validates |

### Request Format

All `POST` endpoints accept the same JSON body:

```json
{
  "system": "System prompt defining the AI's role",
  "user": "The user's input / instruction",
  "history": [
    {"role": "assistant", "content": "Previous response..."},
    {"role": "user", "content": "Previous user input..."}
  ]
}
```

### Response Format

**Single model (`/write`, `/think`, `/memory`):**

```json
{
  "task": "write",
  "forced_model": "claude-sonnet-4.5",
  "actual_model": "claude-sonnet-4.5-20250514",
  "response": { /* full API response */ }
}
```

**Pipeline (`/generate`):**

```json
{
  "task": "generate",
  "pipeline": "claude_write → gemini_validate",
  "claude": {
    "forced_model": "claude-sonnet-4.5",
    "actual_model": "claude-sonnet-4.5-20250514",
    "content": "Generated script content..."
  },
  "gemini": {
    "forced_model": "google/gemini-3.1-pro-preview",
    "actual_model": "gemini-3.1-pro-preview",
    "validation": "APPROVED — No consistency issues found."
  }
}
```

### Usage Examples

**Write a page script:**

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/write \
  -H "Content-Type: application/json" \
  -d '{
    "system": "You are a comic writer. Write detailed panel-by-panel scripts.",
    "user": "Write page 3 of my comic where the hero confronts the villain in a rainstorm.",
    "history": [
      {"role": "assistant", "content": "Page 2 summary: Hero arrived at the warehouse..."}
    ]
  }'
```

**Deep planning with thinking model:**

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/think \
  -H "Content-Type: application/json" \
  -d '{
    "system": "You are a comic story architect. Plan story arcs and character development.",
    "user": "Plan the 3-issue arc for the villain reveal. Include twist timing and emotional beats.",
    "history": []
  }'
```

**Validate consistency with Gemini:**

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/memory \
  -H "Content-Type: application/json" \
  -d '{
    "system": "You track all story continuity for a comic.",
    "user": "Check: On page 1 the hero wore a blue jacket. On page 5 he wears a red hoodie. Is this explained?",
    "history': [/* all previous pages */]
  }'
```

**Full pipeline (write + validate in one call):**

```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system": "You are a comic script writer.",
    "user": "Write page 4 — the villain origin flashback",
    "history": [/* pages 1-3 */]
  }'
```

Returns both Claude's generated script **and** Gemini's validation in a single response.

---

## Project Structure

```
comicore/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with Geist fonts
│   │   ├── page.tsx              # Main entry (client-side routing)
│   │   ├── globals.css           # Global styles + custom CSS
│   │   └── api/
│   │       ├── story/
│   │       │   ├── create/route.ts
│   │       │   └── [id]/route.ts
│   │       ├── generate/
│   │       │   ├── page/route.ts
│   │       │   └── revise/route.ts
│   │       ├── review/
│   │       │   ├── approve/route.ts
│   │       │   └── feedback/route.ts
│   │       ├── memory/
│   │       │   └── context/route.ts
│   │       └── export/
│   │           ├── pdf/route.ts
│   │           └── cbz/route.ts
│   ├── components/
│   │   ├── comicore/             # Comicore-specific components
│   │   │   ├── Navbar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── GallerySection.tsx
│   │   │   ├── MemorySection.tsx
│   │   │   ├── CTASection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── SignUpPage.tsx
│   │   │   └── LoginPage.tsx
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # React hooks
│   └── lib/                      # Utilities
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.mjs
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack framework |
| **UI** | React 19 | Component library |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **Components** | shadcn/ui | Pre-built UI components |
| **Language** | TypeScript 5 | Type safety |
| **Icons** | Lucide React | Icon library |
| **Animation** | Framer Motion | Page transitions |
| **Database** | Prisma ORM | Data persistence (planned) |
| **Auth** | NextAuth.js | Authentication (planned) |
| **AI - Text** | LLM (GPT-4 / Claude) | Story, dialogue, plot (planned) |
| **AI - Image** | SDXL / DALL-E / Flux | Panel artwork (planned) |
| **Memory** | Vector DB (pgvector) | Semantic memory search (planned) |
| **Export** | Puppeteer / Sharp | PDF and CBZ generation (planned) |

---

## Branch Strategy (Team Collaboration)

This project uses a **branch-per-feature** workflow for 3 team members:

| Branch | Owner Focus | Status |
|--------|------------|--------|
| `main` | Production-ready code | Protected |
| `dev` | Integration branch | Active |
| `feature/ui-review` | Landing page, sign up, log in, API routes, components | In Progress |
| `feature/memory-system` | Memory architecture, context management, character bible, rolling summaries | Pending |
| `feature/story-engine` | Story generation logic, plot engine, dialogue system, panel layout | Pending |

### Workflow Rules

1. Each team member works on their feature branch
2. Pull requests target the `dev` branch
3. `dev` is periodically merged into `main` for releases
4. Never commit directly to `main`
5. Write meaningful commit messages

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or Bun

### Installation

```bash
# Clone the repository
git clone https://github.com/Ronak206/comicore.git
cd comicore

# Switch to the UI branch (has all current code)
git checkout feature/ui-review

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:3000         - Landing page
# http://localhost:3000/#signup - Sign up
# http://localhost:3000/#login  - Log in
```

### Testing API Endpoints

```bash
# Create a story session
curl -X POST http://localhost:3000/api/story/create \
  -H "Content-Type: application/json" \
  -d '{"title":"My Comic","premise":"A hero saves the world from an ancient evil that has awakened after a thousand years of slumber."}'

# Get story details
curl http://localhost:3000/api/story/session123?includeMemory=true

# Generate a page
curl -X POST http://localhost:3000/api/generate/page \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"session_123","pageInstructions":{"mood":"dark","panelCount":4}}'

# Get memory context
curl "http://localhost:3000/api/memory/context?sessionId=session_123"
```

---

## Roadmap

### Phase 1 - Foundation (Current)
- [x] Project scaffolding and setup
- [x] Landing page with all sections
- [x] Sign up page (placeholder)
- [x] Log in page (placeholder)
- [x] API route structure with documentation
- [ ] Database schema and Prisma setup
- [ ] User authentication (NextAuth.js)

### Phase 2 - Core Generation
- [ ] Story engine (plot + dialogue generation)
- [ ] Memory system (story + visual layers)
- [ ] Image generation pipeline
- [ ] Panel layout generation

### Phase 3 - Review Workflow
- [ ] Page review interface
- [ ] Approval and revision system
- [ ] User feedback integration
- [ ] Manual editing tools

### Phase 4 - Memory & Consistency
- [ ] Character bible system
- [ ] Rolling summary compression
- [ ] Visual consistency engine
- [ ] Vector DB semantic search

### Phase 5 - Export & Polish
- [ ] PDF export
- [ ] CBZ export
- [ ] Gallery view for completed comics
- [ ] Sharing and collaboration features

---

## Contributing

1. Check out your assigned feature branch
2. Create a sub-branch for your task: `feature/memory-system/my-task`
3. Make your changes with clear commit messages
4. Open a Pull Request targeting the `dev` branch
5. Get at least one review before merging

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with AI, creativity, and teamwork.
</p>
