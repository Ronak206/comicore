import { NextRequest, NextResponse } from "next/server";
import { generateNextPage, getProjectData } from "@/lib/story-engine";

/**
 * POST /api/engine/generate-page
 *
 * Step 4: AI generates the next page. Optional user instructions.
 * Returns the page script + panels + Gemini validation.
 *
 * Body: { projectId: string, userInstructions?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId) {
      return NextResponse.json({ success: false, error: "projectId is required." }, { status: 400 });
    }

    const project = getProjectData(body.projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    const { page, validation } = await generateNextPage(body.projectId, body.userInstructions);

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
      { success: false, error: error.message || "Page generation failed" },
      { status: 500 }
    );
  }
}
