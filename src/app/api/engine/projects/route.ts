import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * GET /api/engine/projects
 * Returns all projects for the current user from MongoDB
 */
export async function GET() {
  try {
    // Get current user from session
    const session = await getSession();
    const userId = session?.userId;

    // Only get projects for the logged-in user
    const projects = await getAllProjects(userId);
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
