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
    console.log("[Page Index API] Received request with projectId:", body.projectId);

    if (!body.projectId) {
      console.error("[Page Index API] Missing projectId");
      return NextResponse.json({ success: false, error: "projectId is required." }, { status: 400 });
    }

    const project = await getProjectData(body.projectId);
    if (!project) {
      console.error("[Page Index API] Project not found:", body.projectId);
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    console.log("[Page Index API] Project found:", project.title, "Page goal:", project.pageGoal);
    console.log("[Page Index API] Rough overview length:", project.roughOverview?.length || 0);
    
    const { pageIndex } = await generatePageIndex(body.projectId);
    console.log("[Page Index API] Generated", pageIndex.length, "pages");

    return NextResponse.json({
      success: true,
      data: {
        pageIndex,
        projectId: project.id,
        total_pages: project.pageGoal,
      },
    });
  } catch (error: any) {
    console.error("[Page Index API] Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Page index generation failed" },
      { status: 500 }
    );
  }
}
