import { NextRequest, NextResponse } from "next/server";
import { createNewProject, addProjectCharacter, updateProjectWorld, updateProjectStyle } from "@/lib/story-engine";

/**
 * POST /api/engine/setup
 *
 * Creates a new comic project with initial data.
 * Step 1 of the story engine flow.
 *
 * Body: {
 *   title, genre, synopsis, tone, targetAudience, pageGoal,
 *   characters: [{ name, role, description, appearance, personality }],
 *   world: { setting, timePeriod, atmosphere, technology, keyLocations, rules },
 *   style: { artStyle, colorPalette, panelDensity, ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: "Title is required." }, { status: 400 });
    }

    if (!body.synopsis?.trim()) {
      return NextResponse.json({ success: false, error: "Synopsis is required." }, { status: 400 });
    }

    // Create project
    const project = await createNewProject({
      title: body.title,
      genre: body.genre || "Sci-Fi",
      synopsis: body.synopsis,
      tone: body.tone || "Dark, dramatic",
      targetAudience: body.targetAudience || "Young Adult / Adult",
      pageGoal: body.pageGoal || 24,
    });

    // Add characters if provided
    if (body.characters && Array.isArray(body.characters)) {
      for (const char of body.characters) {
        if (char.name?.trim()) {
          await addProjectCharacter(project.id, {
            name: char.name.trim(),
            role: char.role || "Supporting",
            description: char.description || "",
            appearance: char.appearance || "",
            personality: char.personality || "",
          });
        }
      }
    }

    // Update world if provided
    if (body.world) {
      await updateProjectWorld(project.id, {
        setting: body.world.setting || "",
        timePeriod: body.world.timePeriod || "",
        atmosphere: body.world.atmosphere || "",
        technology: body.world.technology || "",
        keyLocations: body.world.keyLocations || "",
        rules: body.world.rules || "",
      });
    }

    // Update style if provided
    if (body.style) {
      await updateProjectStyle(project.id, {
        artStyle: body.style.artStyle || "noir-cyberpunk",
        colorPalette: body.style.colorPalette || "dominated-dark",
        panelDensity: body.style.panelDensity || "medium",
        speechBubbleStyle: body.style.speechBubbleStyle || "standard",
        narrationStyle: body.style.narrationStyle || "present",
        detailLevel: body.style.detailLevel || "high",
        referenceNotes: body.style.referenceNotes || "",
      });
    }

    // Re-fetch to get all updated data
    const { getProjectData } = await import("@/lib/story-engine");
    const finalProject = await getProjectData(project.id);

    return NextResponse.json({ success: true, data: finalProject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Setup failed" },
      { status: 500 }
    );
  }
}
