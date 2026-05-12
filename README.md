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
│    └── Gemini 2.0 Flash (story bible creation)      │
│                                                      │
│  Page Generation Loop                                │
│    ├── Gemini 2.0 Flash (plan page)                 │
│    ├── Gemini 2.0 Flash (write script + dialogue)   │
│    └── Gemini 2.0 Flash (consistency validation)    │
│                                                      │
│  User Review → Revision                              │
│    └── Gemini 2.0 Flash (process feedback)          │
│                                                      │
│  Memory System                                       │
│    ├── Gemini 2.0 Flash (page summaries)            │
│    └── Gemini 2.0 Flash (context database)          │
│                                                      │
│  Export                                              │
│    └── pdf-lib (PDF generation)                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## AI Worker (Direct Gemini API)

The AI worker makes direct calls to Google's Gemini API for all AI operations. No external routing layer is needed.

### Configuration

Set your Gemini API key in `.env`:

```env
API_KEY=your-google-gemini-api-key-here
```

Get your API key from: https://makersuite.google.com/app/apikey

### Available Functions

| Function | Purpose |
|----------|---------|
| `aiWrite()` | Story, dialogue, scripts, image prompts |
| `aiThink()` | Deep planning, revision analysis |
| `aiMemory()` | World-building, consistency checks |
| `aiGenerate()` | Pipeline: Write → Validate |

### Usage Example

```typescript
import { aiWrite, extractContent } from "@/lib/ai-worker";

const response = await aiWrite({
  system: "You are a comic writer. Write detailed panel-by-panel scripts.",
  user: "Write page 3 where the hero confronts the villain in a rainstorm.",
  history: [
    { role: "assistant", content: "Page 2 summary: Hero arrived at the warehouse..." }
  ]
});

const script = extractContent(response);
```

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
| **Database** | MongoDB + Mongoose | Data persistence |
| **Auth** | JWT + NextAuth.js | Authentication |
| **AI - Text** | Google Gemini 2.0 Flash | Story, dialogue, plot |
| **AI - Image** | SDXL / DALL-E / Flux | Panel artwork (planned) |
| **Memory** | MongoDB | Context & story storage |
| **Export** | pdf-lib | PDF generation |

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
