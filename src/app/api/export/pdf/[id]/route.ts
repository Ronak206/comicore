import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Export from "@/lib/models/Export";
import zlib from "zlib";

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

    // Get the buffer data from MongoDB
    // MongoDB stores buffers as Buffer objects
    const compressedBuffer = Buffer.isBuffer(exportDoc.compressedData) 
      ? exportDoc.compressedData 
      : Buffer.from(exportDoc.compressedData.buffer || exportDoc.compressedData);

    // Decompress the PDF data
    const decompressedBuffer = await new Promise<Buffer>((resolve, reject) => {
      zlib.gunzip(compressedBuffer, (err, result) => {
        if (err) {
          console.error("[PDF Download] Gunzip error:", err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    console.log(`[PDF Download] Decompressed size: ${decompressedBuffer.length} bytes`);

    // Verify the decompressed size matches expected
    if (decompressedBuffer.length !== exportDoc.originalSize) {
      console.warn(`[PDF Download] Size mismatch: expected ${exportDoc.originalSize}, got ${decompressedBuffer.length}`);
    }

    // Verify PDF header
    const pdfHeader = decompressedBuffer.slice(0, 5).toString();
    if (pdfHeader !== '%PDF-') {
      console.error(`[PDF Download] Invalid PDF header: ${pdfHeader}`);
      return NextResponse.json(
        { success: false, error: "Generated file is not a valid PDF." },
        { status: 500 }
      );
    }

    console.log(`[PDF Download] Valid PDF header confirmed`);

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
        "Cache-Control": "public, max-age=3600",
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
