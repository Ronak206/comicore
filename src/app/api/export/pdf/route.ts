import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { promisify } from "util";
import zlib from "zlib";
import { connectDB } from "@/lib/mongodb";
import Export from "@/lib/models/Export";

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Sanitize text for WinAnsi encoding (pdf-lib standard fonts)
 * Removes characters that can't be encoded
 */
function sanitizeForPdf(text: string): string {
  if (!text) return "";

  return text
    // Replace newlines with spaces
    .replace(/[\r\n]+/g, " ")
    // Replace various dashes with simple dash
    .replace(/[—–−]/g, "-")
    // Replace smart quotes with simple quotes
    .replace(/[""'']/g, '"')
    // Replace ellipsis
    .replace(/…/g, "...")
    // Remove other non-ASCII characters
    .replace(/[^\x00-\x7F]/g, "")
    // Replace multiple spaces with single space
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate PDF bytes from project data
 */
async function generatePdfBytes(
  project: any,
  options: {
    title?: string;
    font?: string;
    fontSize?: number;
    includeCover?: boolean;
    includeToc?: boolean;
    includePageNumbers?: boolean;
    metadata?: { author?: string };
  }
): Promise<Uint8Array> {
  const approvedPages = project.pages.filter((p: any) => p.status === "approved");

  const title = sanitizeForPdf(options.title || project.title);
  const author = sanitizeForPdf(options.metadata?.author || "Comicore AI");
  const fontId = options.font || "helvetica";

  // Create PDF document
  const pdfDoc = await PDFDocument.create();

  // Embed fonts based on selection
  let font: any;
  let fontBold: any;
  let fontOblique: any;

  switch (fontId) {
    case "times":
      font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      fontOblique = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      break;
    case "courier":
      font = await pdfDoc.embedFont(StandardFonts.Courier);
      fontBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
      fontOblique = await pdfDoc.embedFont(StandardFonts.CourierOblique);
      break;
    default:
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  }

  // Page dimensions (A4)
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Helper to add a new page
  const addPage = () => pdfDoc.addPage([pageWidth, pageHeight]);

  // Helper to wrap text
  const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
    const sanitized = sanitizeForPdf(text);
    const words = sanitized.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const includeCover = options.includeCover !== false;
  const includeToc = options.includeToc !== false;
  const includePageNumbers = options.includePageNumbers !== false;

  // === COVER PAGE ===
  if (includeCover) {
    const coverPage = addPage();

    // Title
    const titleSize = 28;
    const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
    coverPage.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight - 200,
      size: titleSize,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Genre
    const genreText = sanitizeForPdf(`A ${project.genre} Comic`);
    const genreSize = 14;
    const genreWidth = font.widthOfTextAtSize(genreText, genreSize);
    coverPage.drawText(genreText, {
      x: (pageWidth - genreWidth) / 2,
      y: pageHeight - 240,
      size: genreSize,
      font: fontOblique,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Author
    const authorText = sanitizeForPdf(`By ${author}`);
    const authorWidth = font.widthOfTextAtSize(authorText, 12);
    coverPage.drawText(authorText, {
      x: (pageWidth - authorWidth) / 2,
      y: pageHeight - 280,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Page count
    const pageCountText = `${approvedPages.length} Pages`;
    const pageCountWidth = font.widthOfTextAtSize(pageCountText, 12);
    coverPage.drawText(pageCountText, {
      x: (pageWidth - pageCountWidth) / 2,
      y: pageHeight - 310,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Synopsis (if available)
    if (project.synopsis) {
      const synopsisLines = wrapText(project.synopsis, contentWidth - 40, font, 10);
      let synopsisY = pageHeight - 380;

      synopsisLines.slice(0, 10).forEach((line) => {
        const lineWidth = font.widthOfTextAtSize(line, 10);
        coverPage.drawText(line, {
          x: (pageWidth - lineWidth) / 2,
          y: synopsisY,
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        synopsisY -= 14;
      });
    }

    // Generation info at bottom
    const genText = sanitizeForPdf(`Generated with Comicore AI on ${new Date().toLocaleDateString()}`);
    const genWidth = font.widthOfTextAtSize(genText, 8);
    coverPage.drawText(genText, {
      x: (pageWidth - genWidth) / 2,
      y: 50,
      size: 8,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  // === TABLE OF CONTENTS ===
  if (includeToc) {
    const tocPage = addPage();

    // TOC Title
    const tocTitle = "Table of Contents";
    tocPage.drawText(tocTitle, {
      x: margin,
      y: pageHeight - 80,
      size: 18,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // TOC entries
    let tocY = pageHeight - 120;
    approvedPages.forEach((page: any, index: number) => {
      if (tocY < 80) {
        const newTocPage = addPage();
        tocY = pageHeight - 80;
      }

      const entryTitle = sanitizeForPdf(`${page.number}. ${page.title}`);
      tocPage.drawText(entryTitle, {
        x: margin,
        y: tocY,
        size: 10,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });

      const pageNum = `Page ${index + 1}`;
      tocPage.drawText(pageNum, {
        x: pageWidth - margin - font.widthOfTextAtSize(pageNum, 10),
        y: tocY,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });

      tocY -= 18;
    });
  }

  // === CONTENT PAGES ===
  for (let pageIndex = 0; pageIndex < approvedPages.length; pageIndex++) {
    const page = approvedPages[pageIndex];
    const contentPage = addPage();

    let yPos = pageHeight - 80;

    // Page header
    if (includePageNumbers) {
      const headerText = sanitizeForPdf(`${title} - Page ${pageIndex + 1}`);
      contentPage.drawText(headerText, {
        x: margin,
        y: pageHeight - 40,
        size: 8,
        font: font,
        color: rgb(0.6, 0.6, 0.6),
      });

      // Page number on right
      const pageNumText = String(pageIndex + 1);
      contentPage.drawText(pageNumText, {
        x: pageWidth - margin - font.widthOfTextAtSize(pageNumText, 8),
        y: pageHeight - 40,
        size: 8,
        font: font,
        color: rgb(0.6, 0.6, 0.6),
      });
    }

    // Page title
    contentPage.drawText(sanitizeForPdf(page.title), {
      x: margin,
      y: yPos,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    yPos -= 25;

    // Chapter info if available
    const pageIndexItem = project.pageIndex?.find((p: any) => p.pageNumber === page.number);
    if (pageIndexItem?.chapterTitle) {
      const chapterText = sanitizeForPdf(`Chapter ${pageIndexItem.chapterNumber}: ${pageIndexItem.chapterTitle}`);
      contentPage.drawText(chapterText, {
        x: margin,
        y: yPos,
        size: 10,
        font: fontOblique,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPos -= 20;
    }

    // Script preview
    if (page.script) {
      const scriptLines = wrapText(page.script, contentWidth, font, 9);
      scriptLines.slice(0, 3).forEach((line) => {
        contentPage.drawText(line, {
          x: margin,
          y: yPos,
          size: 9,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPos -= 12;
      });
      yPos -= 10;
    }

    // Panels header
    contentPage.drawText("Panels", {
      x: margin,
      y: yPos,
      size: 12,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    yPos -= 18;

    // Panel content
    for (let panelIndex = 0; panelIndex < page.panels.length; panelIndex++) {
      const panel = page.panels[panelIndex];

      // Check if we need a new page
      if (yPos < 150) {
        const newContentPage = addPage();
        yPos = pageHeight - 80;
      }

      // Panel number
      const panelTitle = `Panel ${panel.panelNumber || panelIndex + 1}`;
      contentPage.drawText(panelTitle, {
        x: margin,
        y: yPos,
        size: 10,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPos -= 14;

      // Panel description
      const descLines = wrapText(panel.description, contentWidth - 10, font, 9);
      descLines.slice(0, 4).forEach((line) => {
        contentPage.drawText(line, {
          x: margin + 10,
          y: yPos,
          size: 9,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPos -= 12;
      });

      // Camera and mood
      if (panel.cameraAngle || panel.mood) {
        const meta = sanitizeForPdf(
          [panel.cameraAngle && `Camera: ${panel.cameraAngle}`, panel.mood && `Mood: ${panel.mood}`]
            .filter(Boolean)
            .join(" | ")
        );
        contentPage.drawText(meta, {
          x: margin + 10,
          y: yPos,
          size: 8,
          font: fontOblique,
          color: rgb(0.5, 0.5, 0.5),
        });
        yPos -= 14;
      }

      // Dialogue
      if (panel.dialogue && panel.dialogue.length > 0) {
        for (const d of panel.dialogue) {
          if (yPos < 80) {
            const newContentPage = addPage();
            yPos = pageHeight - 80;
          }

          const prefix = sanitizeForPdf(d.type === "narration" ? `[${d.character}]` : `${d.character}:`);
          const dialogueText = sanitizeForPdf(d.type === "sfx" ? `*${d.text}*` : d.text);

          // Character name
          contentPage.drawText(prefix, {
            x: margin + 10,
            y: yPos,
            size: 8,
            font: fontBold,
            color: rgb(0.2, 0.2, 0.2),
          });

          // Dialogue text
          const dialogueLines = wrapText(dialogueText, contentWidth - 50, font, 8);
          const prefixWidth = fontBold.widthOfTextAtSize(prefix, 8);

          dialogueLines.forEach((line, idx) => {
            contentPage.drawText(line, {
              x: margin + 15 + prefixWidth,
              y: yPos - idx * 10,
              size: 8,
              font: font,
              color: rgb(0.3, 0.3, 0.3),
            });
          });
          yPos -= dialogueLines.length * 10 + 6;
        }
      }

      yPos += 8;
    }

    // Footer
    const footerText = sanitizeForPdf(`Comicore AI | ${title}`);
    const footerWidth = font.widthOfTextAtSize(footerText, 7);
    contentPage.drawText(footerText, {
      x: (pageWidth - footerWidth) / 2,
      y: 30,
      size: 7,
      font: font,
      color: rgb(0.7, 0.7, 0.7),
    });
  }

  // Set PDF metadata
  pdfDoc.setTitle(title);
  pdfDoc.setAuthor(author);
  pdfDoc.setSubject(sanitizeForPdf(`${project.genre} Comic`));
  pdfDoc.setKeywords(["comic", "comicore", sanitizeForPdf(project.genre)]);
  pdfDoc.setProducer("Comicore AI");
  pdfDoc.setCreator("Comicore AI");

  // Generate PDF bytes
  return await pdfDoc.save();
}

/**
 * POST /api/export/pdf
 *
 * Generates a PDF, compresses it, and stores in MongoDB.
 * Returns export ID for later download.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
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
    const approvedPages = project.pages.filter((p: any) => p.status === "approved");

    if (approvedPages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No approved pages to export. Generate and approve pages first." },
        { status: 400 }
      );
    }

    const options = {
      title: body.options?.title || project.title,
      font: body.options?.font || "helvetica",
      fontSize: body.options?.fontSize || 10,
      includeCover: body.options?.includeCover !== false,
      includeToc: body.options?.includeToc !== false,
      includePageNumbers: body.options?.includePageNumbers !== false,
      metadata: body.options?.metadata || { author: "Comicore AI" },
    };

    // Generate PDF bytes
    const pdfBytes = await generatePdfBytes(project, options);
    const originalSize = pdfBytes.length;

    console.log(`[PDF Export] Generated PDF: ${originalSize} bytes`);

    // Compress PDF using gzip
    const compressedBuffer = await gzip(Buffer.from(pdfBytes));
    const compressedSize = compressedBuffer.length;

    console.log(`[PDF Export] Compressed: ${compressedSize} bytes (${Math.round((1 - compressedSize / originalSize) * 100)}% reduction)`);

    // Store in MongoDB
    const exportDoc = await Export.create({
      bookId: project.id,
      title: options.title,
      format: "pdf",
      status: "completed",
      compressedData: compressedBuffer,
      originalSize,
      compressedSize,
      options: {
        font: options.font,
        fontSize: options.fontSize,
        includeCover: options.includeCover,
        includeToc: options.includeToc,
        includePageNumbers: options.includePageNumbers,
      },
      pageCount: approvedPages.length,
    });

    console.log(`[PDF Export] Stored in MongoDB with ID: ${exportDoc._id}`);

    // Return export ID and metadata
    return NextResponse.json({
      success: true,
      data: {
        exportId: exportDoc._id.toString(),
        title: options.title,
        format: "pdf",
        pageCount: approvedPages.length,
        originalSize,
        compressedSize,
        downloadUrl: `/api/export/pdf/${exportDoc._id}`,
      },
    });
  } catch (error: any) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Export failed." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export/pdf/[id]
 *
 * Retrieves and decompresses PDF from MongoDB for download.
 * This is handled in the dynamic route file.
 */
