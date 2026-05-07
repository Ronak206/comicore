import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 *  STORY - Get story details and progress
 * ============================================
 *
 * GET /api/story/[id]
 *
 * Retrieves the full details of a story session including
 * all approved pages, current status, and character bible.
 *
 * --- Path Parameters ---
 * id: string                   // Session ID (required)
 *
 * --- Query Parameters ---
 * includePages: "true"|"false" // Include page data (default: true)
 * includeMemory: "true"|"false" // Include memory context (default: false)
 *
 * --- Response (200 OK) ---
 * {
 *   "success": true,
 *   "data": {
 *     "sessionId": string,
 *     "title": string,
 *     "genre": string,
 *     "artStyle": string,
 *     "premise": string,
 *     "characters": Array<Character>,
 *     "setting": Object,
 *     "targetPages": number,
 *     "audience": string,
 *     "language": string,
 *     "status": "setup" | "generating" | "reviewing" | "complete",
 *     "currentPage": number,           // Current page being worked on
 *     "totalApprovedPages": number,    // Pages that passed review
 *     "pages": Array<Page>,            // All approved pages
 *     "memory": {                      // Only if includeMemory=true
 *       "storyContext": string,        // Rolling summary of the story so far
 *       "activePlotThreads": string[], // Currently active plot lines
 *       "characterStates": Object,     // Where each character is right now
 *       "lastPanelDescription": string // Last panel of the most recent page
 *     },
 *     "createdAt": string,
 *     "updatedAt": string
 *   }
 * }
 *
 * --- Error Responses ---
 * 400 - Invalid session ID format
 * 404 - Session not found
 * 500 - Internal server error
 */

// Shared session store reference
const sessions: Record<string, any> = {};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Session ID is required." },
        { status: 400 }
      );
    }

    // Placeholder session for demo
    const session = {
      sessionId: id,
      title: "The Last Horizon",
      genre: "scifi",
      artStyle: "cinematic",
      premise: "In a dying universe, the last crew of the starship Meridian must travel beyond the known boundary of spacetime to find a new home for humanity.",
      characters: [
        {
          name: "Captain Mira Chen",
          role: "protagonist",
          appearance: "East Asian woman, short black hair, sharp eyes, worn blue flight suit with mission patches",
          personality: "Determined, quiet, carries the weight of command",
          backstory: "Youngest captain in fleet history. Lost her previous ship and crew three years ago.",
        },
        {
          name: "Dr. Osei Bello",
          role: "supporting",
          appearance: "West African man, tall, glasses, white lab coat, always carrying a data tablet",
          personality: "Optimistic scientist, tends to explain things too thoroughly",
          backstory: "Xenobiologist who discovered the anomaly that led to this mission.",
        },
      ],
      setting: {
        name: "The Meridian",
        description: "A long-range exploration starship, 200 years old, retrofitted multiple times. Shows its age but runs reliably.",
        timePeriod: "Year 3847",
        rules: ["Faster-than-light travel causes temporal displacement", "The boundary is not a physical wall but a zone of increasing entropy"],
      },
      targetPages: 24,
      audience: "teen",
      language: "en",
      status: "reviewing",
      currentPage: 3,
      totalApprovedPages: 2,
      pages: [],
      memory: {
        storyContext: "The Meridian has entered the outer boundary region. Captain Chen ordered all hands to battle stations after sensors detected anomalous readings. Dr. Bello believes the readings match theoretical predictions for the boundary zone.",
        activePlotThreads: ["Crossing the boundary", "Crew morale under pressure", "Bello's secret findings"],
        characterStates: {
          "Captain Mira Chen": "On the bridge, tense, issuing orders",
          "Dr. Osei Bello": "In the science lab, analyzing boundary readings",
        },
        lastPanelDescription: "Wide shot of the Meridian approaching a shimmering wall of light that stretches infinitely in all directions.",
      },
      createdAt: "2026-05-04T08:00:00Z",
      updatedAt: "2026-05-04T08:45:00Z",
    };

    const { searchParams } = new URL(request.url);
    const includeMemory = searchParams.get("includeMemory") === "true";

    const response: any = { ...session };
    if (!includeMemory) {
      delete response.memory;
    }

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
