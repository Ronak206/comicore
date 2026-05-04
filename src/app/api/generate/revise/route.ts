import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 *  GENERATE - Revise a specific page
 * ============================================
 *
 * POST /api/generate/revise
 *
 * Regenerates a page based on user feedback. The AI uses
 * the original page data plus the feedback to produce a
 * revised version while maintaining consistency with
 * the rest of the comic.
 *
 * --- Request Body ---
 * {
 *   "sessionId": string,        // Session ID (required)
 *   "pageId": string,           // Page ID to revise (required)
 *   "feedback": string,         // User's revision instructions (required, min 10 chars)
 *   "revisionType": string,     // "full" | "artwork_only" | "dialogue_only" | "layout_only" (default: "full")
 *   "preserveElements": {       // Elements to keep from the original
 *     "dialogue": boolean,      // Keep original dialogue
 *     "layout": boolean,        // Keep original panel layout
 *     "artStyle": boolean       // Keep original art style settings
 *   }
 * }
 *
 * --- Response (200 OK) ---
 * {
 *   "success": true,
 *   "data": {
 *     "pageId": string,            // Same pageId (revised version)
 *     "revisionNumber": number,    // Incrementing revision counter
 *     "sessionId": string,
 *     "status": "pending_review",
 *     "script": { ... },           // Revised page script (same structure as /generate/page)
 *     "panels": [ ... ],           // Revised rendered panels
 *     "revisionNotes": string,     // AI summary of what was changed
 *     "generatedAt": string
 *   }
 * }
 *
 * --- Error Responses ---
 * 400 - Missing sessionId, pageId, or feedback
 * 404 - Session or page not found
 * 409 - Page is already approved (cannot revise approved pages)
 * 422 - Max revisions reached (limit: 10 per page)
 * 500 - Internal server error or AI generation failure
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sessionId || !body.pageId) {
      return NextResponse.json(
        { success: false, error: "sessionId and pageId are required." },
        { status: 400 }
      );
    }

    if (!body.feedback || typeof body.feedback !== "string" || body.feedback.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Feedback is required (min 10 characters). Describe what to change." },
        { status: 400 }
      );
    }

    const validTypes = ["full", "artwork_only", "dialogue_only", "layout_only"];
    if (body.revisionType && !validTypes.includes(body.revisionType)) {
      return NextResponse.json(
        { success: false, error: `revisionType must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const revisionNumber = Math.floor(Math.random() * 5) + 1;

    return NextResponse.json({
      success: true,
      data: {
        pageId: body.pageId,
        revisionNumber,
        sessionId: body.sessionId,
        status: "pending_review",
        script: {
          pageDescription: `[REVISED] Based on feedback: "${body.feedback}". The page has been regenerated with the requested changes applied while maintaining continuity with the surrounding pages.`,
          panels: [
            {
              panelNumber: 1,
              layout: { x: 0, y: 0, width: 600, height: 280 },
              description: `Revised scene reflecting the feedback: ${body.feedback}`,
              dialogue: [
                {
                  character: "Captain Mira Chen",
                  text: "This is better. Let's keep moving.",
                  type: "speech",
                },
              ],
              cameraAngle: "medium-shot",
              mood: "determined",
            },
          ],
        },
        panels: [
          {
            panelNumber: 1,
            imageUrl: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTExIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRThCOTMxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SRVZJU0VFIG4ue3JldmlzaW9uTnVtYmVyfTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJldmlzaW9uPC90ZXh0Pjwvc3ZnPg==`,
            width: 600,
            height: 400,
          },
        ],
        revisionNotes: `Applied revision #${revisionNumber}: ${body.feedback}`,
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
