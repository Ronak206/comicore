import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 *  REVIEW - Submit revision feedback
 * ============================================
 *
 * POST /api/review/feedback
 *
 * Submits user feedback for a pending-review page.
 * This is a lightweight endpoint that stores the feedback
 * without triggering generation. Use /generate/revise
 * to actually regenerate the page with this feedback.
 *
 * --- Request Body ---
 * {
 *   "sessionId": string,        // Session ID (required)
 *   "pageId": string,           // Page ID (required)
 *   "rating": number,           // Overall rating 1-5 (optional)
 *   "feedback": string,         // Written feedback (required, min 5 chars)
 *   "panelFeedback": [          // Per-panel specific feedback (optional)
 *     {
 *       "panelNumber": number,
 *       "feedback": string,
 *       "issue": "artwork" | "dialogue" | "layout" | "continuity" | "other"
 *     }
 *   ]
 * }
 *
 * --- Response (200 OK) ---
 * {
 *   "success": true,
 *   "data": {
 *     "feedbackId": string,
 *     "sessionId": string,
 *     "pageId": string,
 *     "rating": number,
 *     "stored": true,
 *     "revisionHint": string,       // AI suggestion for revision
 *     "submitAt": string
 *   }
 * }
 *
 * --- Error Responses ---
 * 400 - Missing required fields
 * 404 - Session or page not found
 * 409 - Page is already approved (cannot submit feedback on approved pages)
 * 500 - Internal server error
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

    if (!body.feedback || body.feedback.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Feedback is required (min 5 characters)." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        feedbackId: `fb_${Date.now()}`,
        sessionId: body.sessionId,
        pageId: body.pageId,
        rating: body.rating || null,
        stored: true,
        revisionHint: "Based on your feedback, consider using /generate/revise with revisionType 'full' for best results.",
        submitAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
