import { NextRequest, NextResponse } from "next/server";

/**
 * ============================================
 *  EXPORT - Export comic as PDF
 * ============================================
 *
 * POST /api/export/pdf
 *
 * Compiles all approved pages of a story session into
 * a single PDF file ready for download or printing.
 *
 * --- Request Body ---
 * {
 *   "sessionId": string,        // Session ID (required)
 *   "options": {                // Optional PDF settings
 *     "pageSize": "a4" | "letter" | "comic" (default: "comic"),
 *     "orientation": "portrait" | "landscape" (default: "portrait"),
 *     "includeCover": boolean,  // Generate a cover page (default: true)
 *     "includeCredits": boolean, // Add credits page at the end (default: true),
 *     "quality": "web" | "print" | "high" (default: "web"),
 *     "bleed": boolean,         // Include print bleed marks (default: false),
 *     "metadata": {
 *       "author": string,       // Author name
 *       "publisher": string,    // Publisher name
 *       "isbn": string          // ISBN (optional)
 *     }
 *   }
 * }
 *
 * --- Response (200 OK) ---
 * Content-Type: application/pdf
 * Content-Disposition: attachment; filename="{title}.pdf"
 * Body: PDF binary data
 *
 * --- Error Responses ---
 * 400 - Missing sessionId
 * 404 - Session not found
 * 409 - Cannot export: no approved pages yet
 * 422 - Cannot export: story is not complete (has pending pages)
 *   (set ?force=true to export partial comics)
 * 500 - Internal server error or PDF generation failure
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

    const title = body.options?.title || "comicore-export";

    return NextResponse.json({
      success: true,
      message: "PDF export initiated. In production, this returns a PDF binary stream.",
      data: {
        format: "pdf",
        filename: `${title}.pdf`,
        sessionId: body.sessionId,
        status: "queued",
        options: body.options || {
          pageSize: "comic",
          orientation: "portrait",
          includeCover: true,
          includeCredits: true,
          quality: "web",
        },
        estimatedSize: "4.2 MB",
        downloadUrl: `/api/export/pdf/download/${body.sessionId}?token=placeholder`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
