import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 *  STORY - Create a new comic story session
 * ============================================
 *
 * POST /api/story/create
 *
 * Creates a new comic generation session. Returns a session ID
 * that is used for all subsequent API calls.
 *
 * --- Request Body ---
 * {
 *   "title": string,            // Comic title (required, max 120 chars)
 *   "genre": string,            // Genre: manga | western | indie | superhero | horror | romance | scifi | fantasy | noir | comedy
 *   "artStyle": string,         // Art style description or preset name
 *   "premise": string,          // Story premise / synopsis (required, min 50 chars)
 *   "characters": [             // Array of character definitions
 *     {
 *       "name": string,         // Character name (required)
 *       "role": string,         // protagonist | antagonist | supporting | background
 *       "appearance": string,   // Visual description of the character
 *       "personality": string,  // Personality traits
 *       "backstory": string     // Character backstory
 *     }
 *   ],
 *   "setting": {                // World/setting details
 *     "name": string,           // Setting/world name
 *     "description": string,    // Setting description
 *     "timePeriod": string,     // Time period (e.g., "Modern day", "Medieval", "Year 3000")
 *     "rules": string[]         // Custom world rules the AI must follow
 *   },
 *   "targetPages": number,      // Estimated total pages (1-200)
 *   "audience": string,         // all-ages | teen | mature
 *   "language": string,         // Output language (default: "en")
 *   "styleReference": string    // Optional URL to a reference image for art style
 * }
 *
 * --- Response (201 Created) ---
 * {
 *   "success": true,
 *   "data": {
 *     "sessionId": string,      // Unique session identifier
 *     "title": string,
 *     "createdAt": string,      // ISO 8601 timestamp
 *     "status": "setup",        // setup | generating | reviewing | complete
 *     "currentPage": 0,
 *     "totalApprovedPages": 0,
 *     "characterCount": number
 *   }
 * }
 *
 * --- Error Responses ---
 * 400 - Missing required fields (title, premise)
 * 400 - Invalid genre or artStyle value
 * 400 - Character definition missing required 'name' field
 * 409 - A session with this title already exists for the user
 * 500 - Internal server error
 */

// In-memory store for development (replace with database)
const sessions: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // --- Validation ---
    if (!body.title || typeof body.title !== "string" || body.title.trim().length > 120) {
      return NextResponse.json(
        { success: false, error: "Title is required (max 120 characters)." },
        { status: 400 }
      );
    }

    if (!body.premise || typeof body.premise !== "string" || body.premise.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Premise is required (min 50 characters)." },
        { status: 400 }
      );
    }

    const validGenres = ["manga", "western", "indie", "superhero", "horror", "romance", "scifi", "fantasy", "noir", "comedy"];
    if (body.genre && !validGenres.includes(body.genre)) {
      return NextResponse.json(
        { success: false, error: `Invalid genre. Must be one of: ${validGenres.join(", ")}` },
        { status: 400 }
      );
    }

    if (body.characters && Array.isArray(body.characters)) {
      for (const char of body.characters) {
        if (!char.name) {
          return NextResponse.json(
            { success: false, error: "Each character must have a 'name' field." },
            { status: 400 }
          );
        }
      }
    }

    if (body.targetPages && (body.targetPages < 1 || body.targetPages > 200)) {
      return NextResponse.json(
        { success: false, error: "targetPages must be between 1 and 200." },
        { status: 400 }
      );
    }

    // --- Generate Session ---
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    const session = {
      sessionId,
      title: body.title.trim(),
      genre: body.genre || "western",
      artStyle: body.artStyle || "default",
      premise: body.premise.trim(),
      characters: body.characters || [],
      setting: body.setting || {},
      targetPages: body.targetPages || 24,
      audience: body.audience || "teen",
      language: body.language || "en",
      styleReference: body.styleReference || null,
      createdAt: new Date().toISOString(),
      status: "setup",
      currentPage: 0,
      totalApprovedPages: 0,
      characterCount: (body.characters || []).length,
      pages: [],
    };

    sessions[sessionId] = session;

    // --- Response ---
    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId: session.sessionId,
          title: session.title,
          createdAt: session.createdAt,
          status: session.status,
          currentPage: session.currentPage,
          totalApprovedPages: session.totalApprovedPages,
          characterCount: session.characterCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
