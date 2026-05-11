import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/Book";
import Page from "@/lib/models/Page";
import Character from "@/lib/models/Character";
import Export from "@/lib/models/Export";

/**
 * GET /api/user/stats
 *
 * Returns stats for the current user
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
    const userId = session.userId;

    // Get user's books
    const books = await Book.find({ userId }).select("_id").lean();
    const bookIds = books.map((b) => b._id);

    // Get counts in parallel
    const [totalComics, totalPages, totalCharacters, totalExports, exportsData] =
      await Promise.all([
        Book.countDocuments({ userId }),
        Page.countDocuments({ bookId: { $in: bookIds }, status: "approved" }),
        Character.countDocuments({ bookId: { $in: bookIds } }),
        Export.countDocuments({
          $or: [{ userId }, { bookId: { $in: bookIds } }],
        }),
        Export.aggregate([
          {
            $match: {
              $or: [{ userId }, { bookId: { $in: bookIds } }],
            },
          },
          { $group: { _id: null, totalSize: { $sum: "$originalSize" } } },
        ]),
      ]);

    // Plan limits
    const planLimits = {
      free: { comics: 3, pages: 50 },
      pro: { comics: 25, pages: 500 },
      enterprise: { comics: -1, pages: -1 }, // unlimited
    };

    const plan = (session.plan || "free") as keyof typeof planLimits;
    const limits = planLimits[plan];

    return NextResponse.json({
      success: true,
      data: {
        totalComics,
        totalPages,
        totalCharacters,
        totalExports,
        totalExportSize: exportsData[0]?.totalSize || 0,
        plan: {
          name: plan.charAt(0).toUpperCase() + plan.slice(1),
          limits,
          usage: {
            comics: totalComics,
            pages: totalPages,
          },
        },
      },
    });
  } catch (error: any) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
