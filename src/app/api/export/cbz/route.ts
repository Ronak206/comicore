import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db";

/**
 * POST /api/export/cbz
 *
 * Exports a comic project as CBZ (Comic Book ZIP)
 *
 * Request Body:
 * {
 *   "sessionId": string,        // Project ID (required)
 *   "options": {                // Optional CBZ settings
 *     "imageFormat": "png" | "jpg" | "webp",
 *     "imageQuality": number,   // 1-100 for jpg/webp
 *     "resolution": "original" | "1080p" | "1440p" | "2160p",
 *     "includeMetadata": boolean,
 *     "metadata": {
 *       "title": string,
 *       "series": string,
 *       "issue": string,
 *       "author": string
 *     }
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId (projectId) is required." },
        { status: 400 }
      );
    }

    // Fetch project from database
    const project = await getProject(body.sessionId);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found." },
        { status: 404 }
      );
    }

    // Check if project has approved pages
    const approvedPages = project.pages.filter(p => p.status === "approved");
    
    if (approvedPages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No approved pages to export. Generate and approve pages first." },
        { status: 400 }
      );
    }

    const title = body.options?.metadata?.title || project.title;
    
    // Calculate estimated size based on pages (CBZ is usually larger than PDF)
    const estimatedSizeMB = Math.round(approvedPages.length * 1.2 * 10) / 10;

    // In production, this would generate an actual CBZ file
    // For now, return the export details
    
    return NextResponse.json({
      success: true,
      message: "CBZ export ready.",
      data: {
        format: "cbz",
        filename: `${title.replace(/\s+/g, "-").toLowerCase()}.cbz`,
        projectId: project.id,
        title: project.title,
        genre: project.genre,
        pages: approvedPages.length,
        total_pages: project.pageGoal,
        status: "ready",
        options: {
          imageFormat: body.options?.imageFormat || "png",
          imageQuality: body.options?.imageQuality || 90,
          resolution: body.options?.resolution || "original",
          namingPattern: body.options?.namingPattern || "page_001",
          includeMetadata: body.options?.includeMetadata ?? true,
        },
        estimatedSize: `${estimatedSizeMB} MB`,
        downloadUrl: `/api/export/cbz/download/${project.id}`,
      },
    });
  } catch (error: any) {
    console.error("CBZ export error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Export failed." },
      { status: 500 }
    );
  }
}
