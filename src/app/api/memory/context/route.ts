import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 *  MEMORY - Get current story context
 * ============================================
 *
 * GET /api/memory/context?sessionId=xxx
 *
 * Returns the full memory state for a story session.
 * This is what the AI uses when generating the next page
 * to maintain consistency across the entire comic.
 *
 * --- Query Parameters ---
 * sessionId: string             // Session ID (required)
 * layer: "all"|"story"|"visual"|"panel"  // Which memory layers to return (default: "all")
 * format: "full"|"summary"      // Full detail or compressed summary (default: "full")
 *
 * --- Response (200 OK) ---
 * {
 *   "success": true,
 *   "data": {
 *     "sessionId": string,
 *     "totalPages": number,           // Total pages in the comic
 *     "approvedPages": number,        // Approved so far
 *     "memoryUsage": {
 *       "contextTokens": number,      // Estimated tokens used
 *       "maxTokens": number,          // Maximum context window
 *       "utilizationPercent": number  // 0-100
 *     },
 *     "layers": {
 *       "story": {                   // Layer 1: Story Memory
 *         "premise": string,         // Original story premise
 *         "rollingSummary": string,  // Compressed summary of all approved pages
 *         "activePlotThreads": [
 *           {
 *             "id": string,
 *             "name": string,
 *             "status": "active" | "resolved" | "dormant",
 *             "lastMentionedPage": number,
 *             "description": string
 *           }
 *         ],
 *         "timeline": [              // Key events in order
 *           { "page": number, "event": string }
 *         ]
 *       },
 *       "visual": {                  // Layer 2: Visual Memory
 *         "artStyle": string,        // Current art style settings
 *         "characterSheets": [
 *           {
 *             "name": string,
 *             "appearance": string,   // Visual description
 *             "currentOutfit": string,
 *             "referenceImageUrl": string,
 *             "panelCount": number   // How many panels this character appears in
 *           }
 *         ],
 *         "styleEmbedding": string,  // Vector hash of the art style
 *         "colorPalette": string[]   // Dominant colors in use
 *       },
 *       "panel": {                   // Layer 3: Panel Memory
 *         "lastPageLayout": string,  // Layout type of the last approved page
 *         "lastPanel": {             // The final panel of the last page
 *           "description": string,
 *           "cameraAngle": string,
 *           "charactersPresent": string[],
 *           "mood": string
 *         },
 *         "pacingPattern": string,   // Current pacing (e.g., "building", "action", "resolution")
 *         "dialogueStyle": {         // Per-character dialogue patterns
 *           "Captain Mira Chen": { "tone": "authoritative", "verbosity": "terse" },
 *           "Dr. Osei Bello": { "tone": "enthusiastic", "verbosity": "detailed" }
 *         }
 *       }
 *     }
 *   }
 * }
 *
 * --- Error Responses ---
 * 400 - Missing sessionId
 * 404 - Session not found
 * 500 - Internal server error
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId is required." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        totalPages: 24,
        approvedPages: 3,
        memoryUsage: {
          contextTokens: 41200,
          maxTokens: 128000,
          utilizationPercent: 32,
        },
        layers: {
          story: {
            premise: "In a dying universe, the last crew of the starship Meridian must travel beyond the known boundary of spacetime to find a new home for humanity.",
            rollingSummary: "Pages 1-3: The Meridian entered the outer boundary region. Captain Chen ordered battle stations after anomalous sensor readings. Dr. Bello discovered the readings match theoretical predictions for the boundary zone. The crew debates whether to proceed. A mysterious signal emanates from beyond the boundary.",
            activePlotThreads: [
              { id: "t1", name: "Crossing the boundary", status: "active", lastMentionedPage: 3, description: "The Meridian approaching and entering the boundary zone." },
              { id: "t2", name: "Crew morale", status: "dormant", lastMentionedPage: 2, description: "Underlying tension about the mission's chances of success." },
              { id: "t3", name: "Bello's discovery", status: "active", lastMentionedPage: 3, description: "Dr. Bello found readings matching boundary predictions and a mysterious signal." },
            ],
            timeline: [
              { page: 1, event: "The Meridian enters the outer boundary region." },
              { page: 2, event: "Anomalous readings trigger battle stations." },
              { page: 3, event: "Bello identifies the anomaly and detects a signal." },
            ],
          },
          visual: {
            artStyle: "cinematic",
            characterSheets: [
              { name: "Captain Mira Chen", appearance: "East Asian woman, short black hair, sharp eyes, worn blue flight suit", currentOutfit: "Blue flight suit with mission patches", referenceImageUrl: "generated_001_chen.png", panelCount: 8 },
              { name: "Dr. Osei Bello", appearance: "West African man, tall, glasses, white lab coat", currentOutfit: "White lab coat, data tablet", referenceImageUrl: "generated_002_bello.png", panelCount: 5 },
            ],
            styleEmbedding: "emb_cinematic_dark_scifi_v3",
            colorPalette: ["#0A1628", "#1E3A5F", "#E8B931", "#F5F5F0", "#8B0000"],
          },
          panel: {
            lastPageLayout: "4-panel grid (2x2)",
            lastPanel: {
              description: "Wide shot of the Meridian approaching a shimmering wall of light.",
              cameraAngle: "wide-shot",
              charactersPresent: [],
              mood: "awe",
            },
            pacingPattern: "building",
            dialogueStyle: {
              "Captain Mira Chen": { tone: "authoritative", verbosity: "terse" },
              "Dr. Osei Bello": { tone: "enthusiastic", verbosity: "detailed" },
            },
          },
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
