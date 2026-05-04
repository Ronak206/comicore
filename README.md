# Comicore

<p align="center">
  <strong>AI-Powered Comic Generation Engine</strong>
</p>

<p align="center">
  Page-by-page comic creation with memory-aware storytelling, user review workflows, and collaborative world-building.
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

## Project Structure

```
comicore/
├── client/                     # Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── create/
│   │   │   ├── page.tsx       # Story setup wizard
│   │   │   └── [sessionId]/
│   │   │       ├── page.tsx   # Main generation workspace
│   │   │       └── review/
│   │   │           └── page.tsx # Page review interface
│   │   └── gallery/
│   │       └── page.tsx       # Completed comics gallery
│   ├── components/
│   │   ├── panels/            # Comic panel components
│   │   ├── editor/            # Page editing tools
│   │   ├── review/            # Review workflow UI
│   │   └── story/             # Story setup forms
│   └── lib/
│       ├── api.ts             # API client
│       └── store.ts           # State management
├── server/                     # Backend (Node.js / Python)
│   ├── api/
│   │   ├── story.ts           # Story management endpoints
│   │   ├── generate.ts        # Page generation endpoints
│   │   ├── review.ts          # Review workflow endpoints
│   │   └── export.ts          # Export endpoints
│   ├── services/
│   │   ├── story-engine/      # Core story logic
│   │   │   ├── plotter.ts     # Plot generation
│   │   │   ├── dialoguer.ts   # Dialogue generation
│   │   │   └── panelizer.ts   # Panel layout generation
│   │   ├── memory/            # Memory system
│   │   │   ├── story-memory.ts
│   │   │   ├── visual-memory.ts
│   │   │   ├── character-bible.ts
│   │   │   └── compressor.ts  # Memory compression
│   │   ├── image-gen/         # Image generation
│   │   │   ├── panel-renderer.ts
│   │   │   └── style-consistency.ts
│   │   └── export/            # Export service
│   │       ├── pdf-exporter.ts
│   │       └── cbz-exporter.ts
│   └── db/
│       ├── schema.prisma      # Database schema
│       └── migrations/
├── shared/                     # Shared types and utils
│   ├── types/
│   │   ├── story.ts
│   │   ├── comic.ts
│   │   └── memory.ts
│   └── constants/
├── docs/                       # Documentation
│   ├── architecture.md
│   ├── memory-system.md
│   └── api-reference.md
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── README.md
└── LICENSE
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 + React 19 | UI framework |
| **Styling** | Tailwind CSS + shadcn/ui | Component library |
| **Backend API** | Next.js API Routes / FastAPI | Server endpoints |
| **Database** | PostgreSQL + Prisma ORM | Data persistence |
| **AI - Text** | LLM (GPT-4 / Claude) | Story, dialogue, plot |
| **AI - Image** | SDXL / DALL-E / Flux | Panel artwork generation |
| **Memory** | Vector DB (Pinecone / pgvector) | Semantic memory search |
| **Cache** | Redis | Session and memory caching |
| **Export** | Puppeteer / Sharp | PDF and image processing |
| **Auth** | NextAuth.js | User authentication |

---

## Branch Strategy (Team Collaboration)

This project uses a **branch-per-feature** workflow for 3 team members:

| Branch | Owner Focus | Description |
|--------|------------|-------------|
| `main` | - | Production-ready code, protected |
| `dev` | - | Integration branch, all features merge here first |
| `feature/memory-system` | Team Member 1 | Memory architecture, context management, character bible, rolling summaries |
| `feature/ui-review` | Team Member 2 | Review workflow UI, page editor, approval system, revision controls |
| `feature/story-engine` | Team Member 3 | Story generation logic, plot engine, dialogue system, panel layout |

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
- PostgreSQL 15+
- Redis
- Python 3.11+ (for ML services)
- API keys for LLM and Image Generation providers

### Installation

```bash
# Clone the repository
git clone https://github.com/Ronak206/comicore.git
cd comicore

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Set up database
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/comicore

# Redis
REDIS_URL=redis://localhost:6379

# AI Providers
OPENAI_API_KEY=your_openai_key
REPLICATE_API_KEY=your_replicate_key  # For image generation

# Vector DB
PINECONE_API_KEY=your_pinecone_key

# Auth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

---

## API Endpoints (Planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/story/create` | Create a new comic story session |
| `GET` | `/api/story/[id]` | Get story details and progress |
| `POST` | `/api/generate/page` | Generate the next comic page |
| `POST` | `/api/generate/revise` | Revise a specific page |
| `POST` | `/api/review/approve` | Approve and lock a page |
| `POST` | `/api/review/feedback` | Submit revision feedback |
| `GET` | `/api/memory/context` | Get current story context |
| `POST` | `/api/export/pdf` | Export comic as PDF |
| `POST` | `/api/export/cbz` | Export comic as CBZ |

---

## Roadmap

### Phase 1 - Foundation
- [ ] Project scaffolding and setup
- [ ] Database schema and migrations
- [ ] Basic story creation form
- [ ] User authentication

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
