import { NextRequest, NextResponse } from "next/server";
import { promisify } from "util";
import zlib from "zlib";
import { connectDB } from "@/lib/mongodb";
import Export from "@/lib/models/Export";

const gunzip = promisify(zlib.gunzip);

/**
 * GET /api/export/pdf/[id]
 *
 * Retrieves compressed PDF from MongoDB, decompresses it, and returns for download.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Export ID is required." },
        { status: 400 }
      );
    }

    // Find the export document
    const exportDoc = await Export.findById(id);

    if (!exportDoc) {
      return NextResponse.json(
        { success: false, error: "Export not found." },
        { status: 404 }
      );
    }

    if (exportDoc.status !== "completed") {
      return NextResponse.json(
        { success: false, error: `Export status: ${exportDoc.status}` },
        { status: 400 }
      );
    }

    if (!exportDoc.compressedData) {
      return NextResponse.json(
        { success: false, error: "No PDF data found." },
        { status: 404 }
      );
    }

    console.log(`[PDF Download] Fetching export ${id}`);
    console.log(`[PDF Download] Compressed size: ${exportDoc.compressedSize} bytes`);
    console.log(`[PDF Download] Original size: ${exportDoc.originalSize} bytes`);

    // Decompress the PDF data
    const decompressedBuffer = await gunzip(exportDoc.compressedData);

    console.log(`[PDF Download] Decompressed size: ${decompressedBuffer.length} bytes`);

    // Verify the decompressed size matches expected
    if (decompressedBuffer.length !== exportDoc.originalSize) {
      console.warn(`[PDF Download] Size mismatch: expected ${exportDoc.originalSize}, got ${decompressedBuffer.length}`);
    }

    // Generate safe filename
    const safeFilename = exportDoc.title
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase() || "comic";

    // Return the PDF file
    return new NextResponse(decompressedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}.pdf"`,
        "Content-Length": decompressedBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error("PDF download error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Download failed." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/export/pdf/[id]
 *
 * Deletes an export document from MongoDB (cleanup).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Export ID is required." },
        { status: 400 }
      );
    }

    const result = await Export.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Export not found." },
        { status: 404 }
      );
    }

    console.log(`[PDF Export] Deleted export ${id}`);

    return NextResponse.json({
      success: true,
      message: "Export deleted successfully.",
    });
  } catch (error: any) {
    console.error("PDF delete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Delete failed." },
      { status: 500 }
    );
  }
}
