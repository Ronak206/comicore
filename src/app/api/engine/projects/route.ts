import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/db";

/**
 * GET /api/engine/projects
 * Returns all projects from MongoDB
 */
export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
