import { NextRequest, NextResponse } from "next/server";
import { reviseCurrentPage } from "@/lib/story-engine";

/**
 * POST /api/engine/revise-page
 *
 * Revise a page based on user feedback.
 * Claude rewrites, then Gemini validates.
 *
 * Body: { projectId: string, pageId: string, feedback: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId || !body.pageId || !body.feedback?.trim()) {
      return NextResponse.json({ success: false, error: "projectId, pageId, and feedback are required." }, { status: 400 });
    }

    const { page, validation, project } = await reviseCurrentPage(
      body.projectId,
      body.pageId,
      body.feedback
    );

    return NextResponse.json({
      success: true,
      data: {
        page,
        validation,
        projectId: project.id,
        status: project.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Page revision failed" },
      { status: 500 }
    );
  }
}
