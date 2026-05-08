import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db";

/**
 * POST /api/export/images
 *
 * Exports a comic project as PNG sequence (ZIP archive)
 *
 * Request Body:
 * {
 *   "sessionId": string,        // Project ID (required)
 *   "options": {                // Optional settings
 *     "resolution": "original" | "1080p" | "1440p" | "2160p",
 *     "transparentBg": boolean,
 *     "namingPattern": "page_001" | "p001" | "chapter_page",
 *     "dpi": number             // 72, 150, 300
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

    const title = project.title;
    
    // Calculate estimated size (PNG is largest)
    const estimatedSizeMB = Math.round(approvedPages.length * 2.5 * 10) / 10;

    // In production, this would generate actual PNG files in a ZIP
    
    return NextResponse.json({
      success: true,
      message: "PNG sequence export ready.",
      data: {
        format: "images",
        filename: `${title.replace(/\s+/g, "-").toLowerCase()}-images.zip`,
        projectId: project.id,
        title: project.title,
        genre: project.genre,
        pages: approvedPages.length,
        total_pages: project.pageGoal,
        status: "ready",
        options: {
          resolution: body.options?.resolution || "original",
          transparentBg: body.options?.transparentBg ?? false,
          namingPattern: body.options?.namingPattern || "page_001",
          dpi: body.options?.dpi || 300,
        },
        estimatedSize: `${estimatedSizeMB} MB`,
        downloadUrl: `/api/export/images/download/${project.id}`,
      },
    });
  } catch (error: any) {
    console.error("Images export error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Export failed." },
      { status: 500 }
    );
  }
}
