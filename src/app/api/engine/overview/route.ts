import { NextRequest, NextResponse } from "next/server";
import { generateOverview } from "@/lib/story-engine";

/**
 * POST /api/engine/overview
 *
 * Step 2: AI generates a rough story overview based on project data.
 *
 * Body: { projectId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId) {
      return NextResponse.json({ success: false, error: "projectId is required." }, { status: 400 });
    }

    const { overview, project } = await generateOverview(body.projectId);

    return NextResponse.json({
      success: true,
      data: { overview, projectId: project.id, status: project.status },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Overview generation failed" },
      { status: 500 }
    );
  }
}
