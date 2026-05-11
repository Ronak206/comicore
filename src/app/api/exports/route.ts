import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Export from "@/lib/models/Export";

/**
 * GET /api/exports
 *
 * Lists all exports with their details (without the binary data)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const bookId = searchParams.get("bookId");

    // Build query
    const query: any = {};
    if (bookId) {
      query.bookId = bookId;
    }

    // Fetch exports without the large binary data
    const exports = await Export.find(query)
      .select("-compressedData") // Exclude binary data for list view
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Format response
    const formattedExports = exports.map((exp) => ({
      id: exp._id.toString(),
      bookId: exp.bookId.toString(),
      title: exp.title,
      format: exp.format.toUpperCase(),
      status: exp.status,
      pageCount: exp.pageCount,
      originalSize: formatBytes(exp.originalSize),
      compressedSize: formatBytes(exp.compressedSize),
      compressionRatio: `${Math.round((1 - exp.compressedSize / exp.originalSize) * 100)}%`,
      options: exp.options,
      createdAt: exp.createdAt.toISOString(),
      downloadUrl: `/api/export/pdf/${exp._id}`,
    }));

    // Get summary stats
    const totalExports = await Export.countDocuments();
    const totalSize = await Export.aggregate([
      { $group: { _id: null, total: { $sum: "$originalSize" } } },
    ]);

    return NextResponse.json({
      success: true,
      data: formattedExports,
      stats: {
        totalExports,
        totalSize: totalSize[0]?.total ? formatBytes(totalSize[0].total) : "0 KB",
      },
    });
  } catch (error: any) {
    console.error("List exports error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list exports." },
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
