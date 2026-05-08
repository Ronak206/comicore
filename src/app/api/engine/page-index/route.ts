import { NextRequest, NextResponse } from "next/server";
import { generatePageIndex, getProjectData } from "@/lib/story-engine";

/**
 * POST /api/engine/page-index
 *
 * Generates a page-by-page index showing all planned pages
 * This is shown to the user for approval before actual page generation
 *
 * Body: { projectId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId) {
      return NextResponse.json({ success: false, error: "projectId is required." }, { status: 400 });
    }

    const project = await getProjectData(body.projectId);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    const { pageIndex } = await generatePageIndex(body.projectId);

    return NextResponse.json({
      success: true,
      data: {
        pageIndex,
        projectId: project.id,
        total_pages: project.pageGoal,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Page index generation failed" },
      { status: 500 }
    );
  }
}
