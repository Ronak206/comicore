import { NextRequest, NextResponse } from "next/server";
import { approveCurrentPage } from "@/lib/story-engine";

/**
 * POST /api/engine/review-page
 *
 * Approve a page. Locks it and updates memory.
 *
 * Body: { projectId: string, pageId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId || !body.pageId) {
      return NextResponse.json({ success: false, error: "projectId and pageId are required." }, { status: 400 });
    }

    const project = await approveCurrentPage(body.projectId, body.pageId);

    if (!project) {
      return NextResponse.json({ success: false, error: "Project or page not found." }, { status: 404 });
    }

    const approvedCount = project.pages.filter((p) => p.status === "approved").length;

    return NextResponse.json({
      success: true,
      data: {
        projectId: project.id,
        pageId: body.pageId,
        totalApprovedPages: approvedCount,
        totalPages: project.pageGoal,
        storyComplete: approvedCount >= project.pageGoal,
        status: project.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Page approval failed" },
      { status: 500 }
    );
  }
}
