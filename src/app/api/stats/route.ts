import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/Book";
import Page from "@/lib/models/Page";
import Character from "@/lib/models/Character";
import Export from "@/lib/models/Export";
import User from "@/lib/models/User";

/**
 * GET /api/stats
 *
 * Public endpoint - returns global stats for the homepage
 * No authentication required
 */
export async function GET() {
  try {
    await connectDB();

    // Get total counts
    const [
      totalComics,
      totalPages,
      totalCharacters,
      totalExports,
      totalUsers,
      exportsData,
    ] = await Promise.all([
      Book.countDocuments(),
      Page.countDocuments({ status: "approved" }),
      Character.countDocuments(),
      Export.countDocuments(),
      User.countDocuments(),
      Export.aggregate([
        { $group: { _id: null, totalSize: { $sum: "$originalSize" } } },
      ]),
    ]);

    // Calculate total export size
    const totalExportSize = exportsData[0]?.totalSize || 0;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentComics, recentPages] = await Promise.all([
      Book.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Page.countDocuments({ createdAt: { $gte: sevenDaysAgo }, status: "approved" }),
    ]);

    // Get genres distribution
    const genresData = await Book.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const genres = genresData.map((g) => ({
      name: g._id || "Unknown",
      count: g.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalComics,
        totalPages,
        totalCharacters,
        totalExports,
        totalUsers,
        totalExportSize: formatBytes(totalExportSize),
        recentActivity: {
          newComics: recentComics,
          newPages: recentPages,
        },
        topGenres: genres,
      },
    });
  } catch (error: any) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stats." },
      { status: 500 }
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
