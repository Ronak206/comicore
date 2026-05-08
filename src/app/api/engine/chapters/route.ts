import { NextRequest, NextResponse } from "next/server";
import { generateChapterPlan } from "@/lib/story-engine";

/**
 * POST /api/engine/chapters
 *
 * Step 3: AI breaks the story into chapters and story beats.
 *
 * Body: { projectId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.projectId) {
      return NextResponse.json({ success: false, error: "projectId is required." }, { status: 400 });
    }

    const { chapters, storyBeats, project } = await generateChapterPlan(body.projectId);

    return NextResponse.json({
      success: true,
      data: { chapters, storyBeats, projectId: project.id, status: project.status },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Chapter plan generation failed" },
      { status: 500 }
    );
  }
}
