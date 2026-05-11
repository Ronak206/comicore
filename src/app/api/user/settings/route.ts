import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";

/**
 * GET /api/user/settings
 *
 * Get user's settings/preferences
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    await connectDB();

    let settings = await Settings.findOne({ userId: session.userId });

    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({ userId: session.userId });
    }

    return NextResponse.json({
      success: true,
      data: {
        generation: settings.generation,
        notifications: settings.notifications,
        appearance: settings.appearance,
      },
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch settings." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/settings
 *
 * Update user's settings/preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    await connectDB();

    const updateData: any = {};

    if (body.generation) {
      updateData.generation = body.generation;
    }
    if (body.notifications) {
      updateData.notifications = body.notifications;
    }
    if (body.appearance) {
      updateData.appearance = body.appearance;
    }

    const settings = await Settings.findOneAndUpdate(
      { userId: session.userId },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      data: {
        generation: settings.generation,
        notifications: settings.notifications,
        appearance: settings.appearance,
      },
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings." },
      { status: 500 }
    );
  }
}
