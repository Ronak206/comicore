import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 *  EXPORT - Export comic as CBZ
 * ============================================
 *
 * POST /api/export/cbz
 *
 * Compiles all approved pages of a story session into
 * a CBZ (Comic Book ZIP) file. CBZ is a standard format
 * readable by most comic reader apps (ComicRack, YACReader, etc.).
 *
 * --- Request Body ---
 * {
 *   "sessionId": string,        // Session ID (required)
 *   "options": {                // Optional CBZ settings
 *     "imageFormat": "png" | "jpg" | "webp" (default: "png"),
 *     "imageQuality": number,   // 1-100 for jpg/webp (default: 90),
 *     "resolution": "original" | "1080p" | "1440p" | "2160p" (default: "original"),
 *     "namingPattern": "page_001" | "p001" | "chapter_page" (default: "page_001"),
 *     "includeMetadata": boolean, // Include ComicInfo.xml inside the CBZ (default: true),
 *     "metadata": {
 *       "title": string,        // Comic title
 *       "series": string,       // Series name
 *       "issue": string,        // Issue number
 *       "author": string,       // Author/writer
 *       "artist": string        // Artist (AI in this case)
 *     }
 *   }
 * }
 *
 * --- Response (200 OK) ---
 * Content-Type: application/octet-stream
 * Content-Disposition: attachment; filename="{title}.cbz"
 * Body: CBZ (ZIP) binary data
 *
 * --- Error Responses ---
 * 400 - Missing sessionId
 * 404 - Session not found
 * 409 - Cannot export: no approved pages yet
 * 422 - Cannot export: story is not complete
 * 500 - Internal server error
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

    const title = body.options?.metadata?.title || "comicore-export";

    return NextResponse.json({
      success: true,
      message: "CBZ export initiated. In production, this returns a CBZ binary stream.",
      data: {
        format: "cbz",
        filename: `${title}.cbz`,
        sessionId: body.sessionId,
        status: "queued",
        options: body.options || {
          imageFormat: "png",
          imageQuality: 90,
          resolution: "original",
          namingPattern: "page_001",
          includeMetadata: true,
        },
        estimatedSize: "12.8 MB",
        downloadUrl: `/api/export/cbz/download/${body.sessionId}?token=placeholder`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
