import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 *  GENERATE - Create the next comic page
 * ============================================
 *
 * POST /api/generate/page
 *
 * Generates the next page of the comic based on:
 *   1. The full story memory (plot, characters, world rules)
 *   2. The last approved page (for continuity)
 *   3. The page-level instructions (optional overrides)
 *
 * This is the core generation endpoint. It calls the Story Engine
 * to write the page script, then the Image Generator to create
 * panel artwork, and assembles them into a complete page.
 *
 * --- Request Body ---
 * {
 *   "sessionId": string,        // Session ID (required)
 *   "pageInstructions": {       // Optional per-page overrides
 *     "mood": string,           // e.g., "tense", "lighthearted", "dark"
 *     "focus": string,          // e.g., "dialogue-heavy", "action", "establishing shot"
 *     "notes": string,          // Free-text instructions for this page
 *     "panelCount": number,     // Override panel count (1-9)
 *   },
 *   "dialogueStyle": string     // Optional: override dialogue tone for this page
 * }
 *
 * --- Response (200 OK) ---
 * {
 *   "success": true,
 *   "data": {
 *     "pageId": string,           // Unique page identifier
 *     "pageNumber": number,       // Page number in the sequence
 *     "sessionId": string,
 *     "status": "pending_review", // pending_review | approved | revised
 *     "script": {                 // The page script before rendering
 *       "pageDescription": string,  // AI-written page description
 *       "panels": [                // Array of panel definitions
 *         {
 *           "panelNumber": number,
 *           "layout": {             // Panel dimensions and position
 *             "x": number, "y": number, "width": number, "height": number
 *           },
 *           "description": string,   // What happens in this panel
 *           "dialogue": [            // Speech bubbles
 *             {
 *               "character": string,  // Character name
 *               "text": string,       // Dialogue text
 *               "type": "speech" | "thought" | "narration" | "sfx"
 *             }
 *           ],
 *           "cameraAngle": string,   // e.g., "close-up", "wide-shot", "over-shoulder"
 *           "mood": string
 *         }
 *       ]
 *     },
 *     "panels": [                  // Rendered panel data
 *       {
 *         "panelNumber": number,
 *         "imageUrl": string,       // Base64 or URL to generated image
 *         "width": number,
 *         "height": number
 *       }
 *     ],
 *     "generatedAt": string        // ISO 8601 timestamp
 *   }
 * }
 *
 * --- Error Responses ---
 * 400 - Missing sessionId
 * 404 - Session not found
 * 409 - Current page is pending review (must approve/revise first)
 * 422 - Cannot generate: story is complete (all pages approved)
 * 500 - Internal server error or AI generation failure
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId is required." },
        { status: 400 }
      );
    }

    // --- Simulated page generation ---
    const pageNumber = Math.floor(Math.random() * 20) + 1;
    const panelCount = body.pageInstructions?.panelCount || Math.floor(Math.random() * 4) + 3;

    const panels: Array<{
      panelNumber: number;
      layout: { x: number; y: number; width: number; height: number };
      description: string;
      dialogue: Array<{ character: string; text: string; type: string }>;
      cameraAngle: string;
      mood: string;
    }> = [];
    for (let i = 0; i < panelCount; i++) {
      panels.push({
        panelNumber: i + 1,
        layout: {
          x: i === 0 ? 0 : 50,
          y: i === 0 ? 0 : 300,
          width: i === 0 ? 600 : 300,
          height: i === 0 ? 280 : 250,
        },
        description: `Panel ${i + 1}: A dramatic scene unfolds as the characters face a critical moment in the story.`,
        dialogue: i % 2 === 0 ? [
          {
            character: "Captain Mira Chen",
            text: i === 0 ? "All hands, brace for transition." : "We're through. I can't believe it.",
            type: "speech",
          },
        ] : [],
        cameraAngle: ["close-up", "wide-shot", "medium-shot", "over-shoulder"][i % 4],
        mood: body.pageInstructions?.mood || "tense",
      });
    }

    const pageId = `page_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      data: {
        pageId,
        pageNumber,
        sessionId: body.sessionId,
        status: "pending_review",
        script: {
          pageDescription: `Page ${pageNumber}: The crew navigates through the boundary zone. Tension builds as the ship's systems flicker. Dr. Bello discovers something extraordinary in the sensor data that changes everything they thought they knew about the boundary.`,
          panels,
        },
        panels: panels.map((p) => ({
          panelNumber: p.panelNumber,
          imageUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTExIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UGFuZWwgJHtwLnBhbmVsTnVtYmVyfTwvdGV4dD48L3N2Zz4=`,
          width: 600,
          height: 400,
        })),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
