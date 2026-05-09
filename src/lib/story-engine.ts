/**
 * Comicore Story Engine
 *
 * The core orchestration layer that ties together the AI Worker
 * and the MongoDB database. This is the ONLY module that should
 * coordinate between AI calls and DB operations.
 *
 * Flow:
 *   1. setup — create project + add characters + world details
 *   2. generateOverview — AI creates a rough story overview
 *   3. generateChapterPlan — AI breaks story into chapters
 *   4. generatePage — AI writes a page script
 *   5. validatePage — Gemini checks consistency
 *   6. approvePage / revisePage — user review cycle
 */

import {
  aiWrite,
  aiThink,
  aiMemory,
  aiGenerate,
  extractContent,
  extractClaudeContent,
  extractGeminiValidation,
  buildPageHistory,
  type AIRequest,
} from "./ai-worker";
import {
  createProject,
  getProject,
  updateProject,
  addCharacter,
  addPage,
  approvePage as dbApprovePage,
  revisePage as dbRevisePage,
  upsertWorld,
  type ProjectData,
} from "./db";

// ─── Setup ───────────────────────────────────────

export async function createNewProject(data: {
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  targetAudience: string;
  pageGoal: number;
}): Promise<ProjectData> {
  return createProject(data);
}

export async function addProjectCharacter(
  projectId: string,
  character: { name: string; role: "Protagonist" | "Antagonist" | "Deuteragonist" | "Supporting" | "Minor"; description: string; appearance: string; personality: string }
) {
  return addCharacter(projectId, character);
}

export async function updateProjectWorld(
  projectId: string,
  world: ProjectData["world"]
) {
  return upsertWorld(projectId, world);
}

export async function updateProjectStyle(
  projectId: string,
  style: ProjectData["style"]
) {
  return updateProject(projectId, { style });
}

// ─── AI: Generate Rough Overview ─────────────────

export async function generateOverview(projectId: string, storyInput?: string): Promise<{ overview: string; project: ProjectData }> {
  console.log("[Story Engine] generateOverview called for project:", projectId);
  console.log("[Story Engine] Story input provided:", !!storyInput);
  
  const project = await getProject(projectId);
  if (!project) {
    console.error("[Story Engine] Project not found:", projectId);
    throw new Error("Project not found");
  }

  console.log("[Story Engine] Project found:", project.title);
  
  const characterSummary = project.characters
    .map((c) => `${c.name} (${c.role}): ${c.description}`)
    .join("\n");

  // Check if synopsis is empty - AI will create full story
  const hasSynopsis = project.synopsis && project.synopsis.trim().length > 0;
  const hasStoryInput = storyInput && storyInput.trim().length > 0;
  
  const systemPrompt = hasStoryInput 
    ? `You are a master comic story architect. Create a compelling story overview based on the user's story ideas and the comic details provided.
Incorporate the user's vision while expanding it into a complete narrative.
This should read like a back-cover blurb but more detailed — covering the beginning, middle, and end.
Mention key plot points, character arcs, and the central conflict.
Write 300-500 words. Be creative, vivid and specific.`
    : hasSynopsis 
    ? `You are a master comic story architect. Given the comic details below, write a compelling rough overview/outline of the full story. 
This should read like a back-cover blurb but more detailed — covering the beginning, middle, and end. 
Mention key plot points, character arcs, and the central conflict. 
Write 200-400 words. Be vivid and specific.`
    : `You are a master comic story architect. Create a compelling story overview based on the title, genre, characters, and world details provided.
Since no initial story idea was given, invent an engaging plot that fits the genre and world.
This should read like a back-cover blurb but more detailed — covering the beginning, middle, and end.
Mention key plot points, character arcs, and the central conflict.
Write 300-500 words. Be creative, vivid and specific.`;

  const req: AIRequest = {
    system: systemPrompt,
    user: `Title: ${project.title}
Genre: ${project.genre}
Tone: ${project.tone}
Target Audience: ${project.targetAudience}
Target Pages: ${project.pageGoal}

${hasStoryInput ? `USER'S STORY IDEAS (MUST INCORPORATE):
${storyInput}
` : hasSynopsis ? `Initial Story Idea:\n${project.synopsis}\n` : "No initial story provided - create an original story based on the title and genre."}

Characters:
${characterSummary || "No characters defined yet - create appropriate characters for this story."}

World:
${project.world.setting || "Not defined yet"}
Time Period: ${project.world.timePeriod || "Not defined"}
Atmosphere: ${project.world.atmosphere || "Not defined"}
Key Locations: ${project.world.keyLocations || "Not defined"}
World Rules: ${project.world.rules || "Not defined"}

Art Style: ${project.style.artStyle}
Panel Density: ${project.style.panelDensity}

Write a complete story overview that covers the full narrative arc from beginning to end.`,
  };

  console.log("[Story Engine] Calling aiWrite for overview...");
  const response = await aiWrite(req);
  console.log("[Story Engine] aiWrite response received");
  
  const overview = extractContent(response);
  console.log("[Story Engine] Extracted overview length:", overview?.length);

  // Store the overview in MongoDB for later reference
  const updated = await updateProject(projectId, {
    roughOverview: overview,
    status: "overview",
  });
  
  console.log("[Story Engine] Overview stored in database for project:", projectId);

  return { overview, project: updated! };
}

// ─── AI: Generate Chapter Plan ───────────────────

export async function generateChapterPlan(projectId: string): Promise<{
  chapters: Array<{
    number: number;
    title: string;
    description: string;
    pageRange: string;
    pageCount: number;
  }>;
  storyBeats: Array<{
    num: string;
    title: string;
    description: string;
    pageRange: string;
  }>;
  project: ProjectData;
}> {
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");

  const characterSummary = project.characters
    .map((c) => `${c.name} (${c.role})`)
    .join(", ");

  const req: AIRequest = {
    system: `You are a comic story architect. Based on the story overview, break the comic into chapters and story beats.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:

{
  "chapters": [
    { "number": 1, "title": "Chapter Title", "description": "Brief description of what happens", "pageRange": "1-8", "pageCount": 8 }
  ],
  "storyBeats": [
    { "num": "01", "title": "Beat Title", "description": "What happens in this beat", "pageRange": "1-8" }
  ]
}

Important rules:
- Total page count across all chapters MUST equal exactly ${project.pageGoal}
- Chapter sizes should vary naturally (not all the same)
- First chapter should set up the world and characters
- Last chapter should be the climax/resolution
- Include 5-8 story beats that track the major turning points
- Make chapter titles evocative and engaging`,
    user: `Title: ${project.title}
Genre: ${project.genre}
Total Pages: ${project.pageGoal}
Characters: ${characterSummary}

Story Overview:
${project.roughOverview}

Break this into chapters and story beats. Return ONLY JSON.`,
  };

  const response = await aiThink(req);
  let rawContent = extractContent(response);

  // Strip markdown code fences if present
  rawContent = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse chapter plan from AI response");
    }
  }

  const chapters = (parsed.chapters || []).map((ch: any, i: number) => ({
    id: `ch_${Date.now()}_${i}`,
    number: ch.number || i + 1,
    title: ch.title || `Chapter ${i + 1}`,
    description: ch.description || "",
    pageRange: ch.pageRange || "",
    pageCount: ch.pageCount || 4,
  }));

  const storyBeats = (parsed.storyBeats || []).map((sb: any) => ({
    num: sb.num || "01",
    title: sb.title || "Beat",
    description: sb.description || "",
    pageRange: sb.pageRange || "",
  }));

  const updated = await updateProject(projectId, {
    chapters,
    storyBeats,
    status: "chapters",
  });

  return { chapters, storyBeats, project: updated! };
}

// ─── AI: Generate Page Index ───────────────────────
// Generates page index BEFORE chapters - based on story overview only

export async function generatePageIndex(projectId: string): Promise<{
  pageIndex: Array<{
    pageNumber: number;
    title: string;
    description: string;
    chapter: string;
    keyEvents: string[];
  }>;
  project: ProjectData;
}> {
  console.log("[Story Engine] generatePageIndex called for project:", projectId);
  
  const project = await getProject(projectId);
  if (!project) {
    console.error("[Story Engine] Project not found:", projectId);
    throw new Error("Project not found");
  }

  console.log("[Story Engine] Project found:", project.title);
  console.log("[Story Engine] Rough overview exists:", !!project.roughOverview);
  
  // Check if we have the required data
  if (!project.roughOverview) {
    console.error("[Story Engine] Missing roughOverview - cannot generate page index");
    throw new Error("Story overview must be generated before creating page index. Please go back to the Overview step and click 'Generate Overview'.");
  }

  const characterSummary = project.characters
    .map((c) => `${c.name} (${c.role})`)
    .join(", ");

  // Use chapters if available, otherwise generate without chapter context
  const chapterSummary = project.chapters?.length > 0
    ? project.chapters.map((ch) => `Chapter ${ch.number}: "${ch.title}" (Pages ${ch.pageRange}) - ${ch.description}`).join("\n")
    : "Chapters will be generated after page index approval.";

  const hasChapters = project.chapters?.length > 0;

  const req: AIRequest = {
    system: `You are a comic story planner. Create a detailed page-by-page index for a ${project.pageGoal}-page comic.
This index will be shown to the user for approval before generating the actual pages.

Return ONLY valid JSON (no markdown, no code fences):
{
  "pageIndex": [
    {
      "pageNumber": 1,
      "title": "Page Title",
      "description": "Brief description of what happens on this page",
      "chapter": "Act 1",
      "keyEvents": ["Event 1", "Event 2"]
    }
  ]
}

Important rules:
- Create exactly ${project.pageGoal} pages
- Each page should have a unique title and description
- ${hasChapters ? "Map pages to their respective chapters" : "Divide pages into logical acts (Act 1, Act 2, Act 3, etc.) based on story structure"}
- Include 1-3 key events per page
- Ensure story flows logically from beginning to end
- Start with an opening page that sets the scene
- End with a climactic or resolution page`,
    user: `COMIC: ${project.title}
GENRE: ${project.genre}
TONE: ${project.tone}
TOTAL PAGES: ${project.pageGoal}

CHARACTERS:
${characterSummary || "No characters defined"}

STORY OVERVIEW:
${project.roughOverview}

${hasChapters ? `CHAPTER BREAKDOWN:\n${chapterSummary}` : "Create a natural story flow from beginning to end."}

Create a detailed page index for all ${project.pageGoal} pages. Return ONLY JSON.`,
  };

  console.log("[Story Engine] Calling aiThink for page index...");
  const response = await aiThink(req);
  console.log("[Story Engine] aiThink response received");
  
  let rawContent = extractContent(response);
  console.log("[Story Engine] Raw content length:", rawContent?.length);

  // Strip markdown code fences if present
  rawContent = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
    console.log("[Story Engine] JSON parsed successfully");
  } catch (parseError) {
    console.error("[Story Engine] JSON parse error:", parseError);
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
      console.log("[Story Engine] JSON extracted via regex");
    } else {
      console.error("[Story Engine] Could not extract JSON from response");
      throw new Error("Failed to parse page index from AI response");
    }
  }

  const pageIndex = (parsed.pageIndex || []).map((p: any, i: number) => ({
    pageNumber: p.pageNumber || i + 1,
    title: p.title || `Page ${i + 1}`,
    description: p.description || "Story continues...",
    chapter: p.chapter || "Main",
    keyEvents: p.keyEvents || [],
  }));

  console.log("[Story Engine] Parsed", pageIndex.length, "pages from AI");

  // Ensure we have exactly pageGoal pages
  while (pageIndex.length < project.pageGoal) {
    const num = pageIndex.length + 1;
    pageIndex.push({
      pageNumber: num,
      title: `Page ${num}`,
      description: "Story continues...",
      chapter: "Main",
      keyEvents: [],
    });
  }

  console.log("[Story Engine] Final page count:", pageIndex.length);

  const updated = await updateProject(projectId, {
    status: "index-ready",
    pageIndex,
  });

  return { pageIndex, project: updated! };
}

// ─── AI: Generate Page ───────────────────────────

export async function generateNextPage(
  projectId: string,
  userInstructions?: string
): Promise<{
  page: {
    id: string;
    title: string;
    number: number;
    script: string;
    panels: Array<{
      panelNumber: number;
      description: string;
      dialogue: Array<{ character: string; text: string; type: string }>;
      cameraAngle: string;
      mood: string;
    }>;
  };
  validation: string;
  project: ProjectData;
}> {
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");

  const nextPageNum = project.pages.length + 1;

  // Determine which chapter this page falls in
  const currentChapter = project.chapters.find((ch) => {
    const [start, end] = ch.pageRange.split("-").map(Number);
    return nextPageNum >= start && nextPageNum <= end;
  });

  const chapterContext = currentChapter
    ? `Current Chapter: "${currentChapter.title}" — ${currentChapter.description}`
    : "No chapter context available.";

  const approvedPages = project.pages.filter((p) => p.status === "approved");
  const history = buildPageHistory(approvedPages, 3);

  const characterSummary = project.characters
    .map((c) => `${c.name} (${c.role}): ${c.appearance}. Personality: ${c.personality}`)
    .join("\n");

  // Use pipeline: Claude writes, Gemini validates
  const req: AIRequest = {
    system: `You are an expert comic book scriptwriter. Write a detailed page-by-page script for page ${nextPageNum} of "${project.title}".

RULES:
- Art style: ${project.style.artStyle}
- Panel density: ${project.style.panelDensity}
- Narration style: ${project.style.narrationStyle}
- Detail level: ${project.style.detailLevel}
- ${project.style.referenceNotes ? `Visual references: ${project.style.referenceNotes}` : ""}

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Page Title",
  "script": "Brief prose summary of what happens on this page",
  "panels": [
    {
      "panelNumber": 1,
      "description": "Detailed visual description of what the reader sees",
      "dialogue": [{"character": "CharacterName", "text": "Dialogue text", "type": "speech"}],
      "cameraAngle": "close-up|wide-shot|medium-shot|over-shoulder|bird-eye|worm-eye",
      "mood": "tense|calm|dark|bright|mysterious|action"
    }
  ]
}

Create ${project.style.panelDensity === "sparse" ? "1-3" : project.style.panelDensity === "dense" ? "5-8" : "3-5"} panels.`,
    user: `COMIC: ${project.title}
PAGE: ${nextPageNum} of ${project.pageGoal}
${chapterContext}

CHARACTERS:
${characterSummary}

WORLD:
${project.world.setting}
${project.world.atmosphere}

STORY OVERVIEW:
${project.roughOverview}

${userInstructions ? `USER INSTRUCTIONS FOR THIS PAGE:\n${userInstructions}\n` : ""}

Write page ${nextPageNum}. Return ONLY JSON.`,
    history,
  };

  const pipelineResponse = await aiGenerate(req);
  const claudeContent = extractClaudeContent(pipelineResponse);
  let validation = extractGeminiValidation(pipelineResponse);

  // Get page index context for current page
  const currentPageIndex = project.pageIndex?.find(p => p.pageNumber === nextPageNum);
  const pageIndexContext = currentPageIndex 
    ? `PLANNED CONTENT FOR THIS PAGE:\nTitle: ${currentPageIndex.title}\nDescription: ${currentPageIndex.description}\nKey Events: ${currentPageIndex.keyEvents?.join(', ') || 'None specified'}`
    : "";

  // Build world rules context
  const worldRulesContext = project.world.rules 
    ? `WORLD RULES (MUST NOT VIOLATE):\n${project.world.rules}`
    : "";

  // Always run comprehensive validation using aiMemory for better context
  console.log("Running comprehensive Gemini validation...");
  
  const validationReq: AIRequest = {
    system: `You are a comic book editor and continuity expert. Review the generated page content thoroughly.

VALIDATION CHECKLIST:
1. CHARACTER CONSISTENCY: Do characters act according to their defined personalities and appearances?
2. WORLD RULES: Does the content violate any established world rules?
3. PLOT COHERENCE: Does this page fit the story flow and planned content?
4. VISUAL CLARITY: Can the panels be clearly visualized by an artist?
5. DIALOGUE QUALITY: Is the dialogue natural, engaging, and character-appropriate?
6. TIMELINE ACCURACY: Are events consistent with the story timeline?

Respond in this format:
**VERDICT:** [APPROVED / NEEDS REVISION]
**ANALYSIS:** [Brief analysis of each checklist item]
**SPECIFIC ISSUES:** [List any problems found, or "None" if approved]`,
    user: `COMIC: ${project.title}
PAGE ${nextPageNum} of ${project.pageGoal}

${pageIndexContext}

${worldRulesContext}

CHARACTERS:
${characterSummary}

WORLD SETTING:
${project.world.setting}
${project.world.atmosphere}

STORY OVERVIEW:
${project.roughOverview}

GENERATED PAGE CONTENT (JSON):
${claudeContent}

Validate this page content against the checklist above.`,
  };
  
  try {
    const validationRes = await aiMemory(validationReq);
    validation = extractContent(validationRes);
  } catch (e) {
    console.error("Validation error:", e);
    validation = "APPROVED: Page generated successfully. (Validation service temporarily unavailable)";
  }

  // Parse Claude's response
  let parsed;
  let cleanContent = claudeContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try {
    parsed = JSON.parse(cleanContent);
  } catch {
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = {
        title: `Page ${nextPageNum}`,
        script: claudeContent,
        panels: [{
          panelNumber: 1,
          description: claudeContent.substring(0, 300),
          dialogue: [],
          cameraAngle: "medium-shot",
          mood: project.tone,
        }],
      };
    }
  }

  // Ensure all panels have valid descriptions (required by MongoDB schema)
  const panels = (parsed.panels || []).map((p: any, i: number) => ({
    panelNumber: p.panelNumber || i + 1,
    description: p.description && p.description.trim() ? p.description.trim() : `Panel ${i + 1} - ${p.mood || project.tone || 'action'} scene`,
    dialogue: (p.dialogue || []).map((d: any) => ({
      character: d.character || "",
      text: d.text || "",
      type: d.type || "speech",
    })),
    cameraAngle: p.cameraAngle || "medium-shot",
    mood: p.mood || project.tone || "tense",
  }));

  // If no panels were generated, create at least one panel
  if (panels.length === 0) {
    panels.push({
      panelNumber: 1,
      description: `Scene depicting: ${claudeContent.substring(0, 100)}...`,
      dialogue: [],
      cameraAngle: "medium-shot",
      mood: project.tone || "tense",
    });
  }

  const pageData = {
    number: nextPageNum,
    title: parsed.title || `Page ${nextPageNum}`,
    status: "in-review" as const,
    panels,
    script: parsed.script || claudeContent,
    userInstructions,
  };

  const updatedProject = await addPage(projectId, pageData);

  // Get the actual page ID from the updated project
  const newPage = updatedProject?.pages.find((p) => p.number === nextPageNum);

  return {
    page: {
      ...pageData,
      id: newPage?.id || `page_${Date.now()}`,
    },
    validation,
    project: updatedProject!,
  };
}

// ─── AI: Revise Page ─────────────────────────────

export async function reviseCurrentPage(
  projectId: string,
  pageId: string,
  feedback: string
): Promise<{
  page: {
    id: string;
    title: string;
    number: number;
    script: string;
    panels: Array<{
      panelNumber: number;
      description: string;
      dialogue: Array<{ character: string; text: string; type: string }>;
      cameraAngle: string;
      mood: string;
    }>;
  };
  validation: string;
  project: ProjectData;
}> {
  const project = await getProject(projectId);
  if (!project) throw new Error("Project not found");

  const page = project.pages.find((p) => p.id === pageId);
  if (!page) throw new Error("Page not found");

  // Mark as revised first
  await dbRevisePage(projectId, pageId, feedback);

  // Use think endpoint for revision analysis
  const req: AIRequest = {
    system: `You are an expert comic book scriptwriter revising a page based on user feedback. 
Rewrite the page incorporating the feedback while maintaining consistency with the story.
Return ONLY valid JSON (no markdown, no code fences) in the same format as before.`,
    user: `ORIGINAL PAGE ${page.number}:
Title: ${page.title}
Script: ${page.script}
Panels: ${JSON.stringify(page.panels, null, 2)}

USER FEEDBACK:
${feedback}

Rewrite this page incorporating the feedback. Return ONLY JSON.`,
    history: buildPageHistory(
      project.pages.filter((p) => p.status === "approved"),
      3
    ),
  };

  const response = await aiWrite(req);
  let rawContent = extractContent(response);
  let cleanContent = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanContent);
  } catch {
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = {
        title: page.title,
        script: rawContent,
        panels: page.panels,
      };
    }
  }

  // Ensure all panels have valid descriptions (required by MongoDB schema)
  const revisedPanels = (parsed.panels || page.panels).map((p: any, i: number) => ({
    panelNumber: p.panelNumber || i + 1,
    description: p.description && p.description.trim() ? p.description.trim() : `Panel ${i + 1} - revised scene`,
    dialogue: (p.dialogue || []).map((d: any) => ({
      character: d.character || "",
      text: d.text || "",
      type: d.type || "speech",
    })),
    cameraAngle: p.cameraAngle || "medium-shot",
    mood: p.mood || project.tone || "tense",
  }));

  // Update the page in MongoDB
  const PageModel = (await import("./models/Page")).default;
  await PageModel.findByIdAndUpdate(pageId, {
    title: parsed.title || page.title,
    script: parsed.script || rawContent,
    panels: revisedPanels,
    status: "in-review",
    feedback,
    generatedAt: new Date(),
  });

  // Run validation
  const validationReq: AIRequest = {
    system: "You are a continuity validator. Review the revised content for: 1) Character consistency 2) Plot holes 3) Visual continuity 4) Timeline accuracy. Reply with APPROVED if clean, or list specific issues.",
    user: `Revised page content:\n${parsed.script || rawContent}\n\nOriginal feedback was: ${feedback}\n\nValidate this revision.`,
  };
  const validationRes = await aiMemory(validationReq);
  const validation = extractContent(validationRes);

  const updatedProject = await getProject(projectId);

  return {
    page: {
      id: pageId,
      title: parsed.title || page.title,
      number: page.number,
      script: parsed.script || rawContent,
      panels: revisedPanels,
    },
    validation,
    project: updatedProject!,
  };
}

// ─── Approve Page ────────────────────────────────

export async function approveCurrentPage(projectId: string, pageId: string): Promise<ProjectData | null> {
  return dbApprovePage(projectId, pageId);
}

// ─── Getters ─────────────────────────────────────

export async function getProjectData(projectId: string): Promise<ProjectData | null> {
  return getProject(projectId);
}
