import { NextRequest, NextResponse } from "next/server";
import { generateOverview } from "@/lib/story-engine";

/**
 * POST /api/engine/overview
 *
 * Step 2: AI generates a rough story overview based on project data.
 *
 * Body: { projectId: string, storyInput?: string }
 * - projectId: Required - The project ID
 * - storyInput: Optional - User's brief story description/ideas to incorporate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[Overview API] Received request with projectId:", body.projectId);
    console.log("[Overview API] Story input provided:", !!body.storyInput);

    if (!body.projectId) {
      console.error("[Overview API] Missing projectId");
      return NextResponse.json({ success: false, error: "projectId is required." }, { status: 400 });
    }

    console.log("[Overview API] Calling generateOverview...");
    const { overview, project } = await generateOverview(body.projectId, body.storyInput);
    console.log("[Overview API] Overview generated successfully, length:", overview?.length);

    return NextResponse.json({
      success: true,
      data: { overview, projectId: project.id, status: project.status },
    });
  } catch (error: any) {
    console.error("[Overview API] Error:", error.message, error.stack);
    return NextResponse.json(
      { success: false, error: error.message || "Overview generation failed" },
      { status: 500 }
    );
  }
}
