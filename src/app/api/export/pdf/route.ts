import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { connectDB } from "@/lib/mongodb";
import Export from "@/lib/models/Export";
import { getSession } from "@/lib/auth";

/**
 * Sanitize text for WinAnsi encoding
 */
function sanitize(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/[—–−]/g, "-")
    .replace(/[""'']/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Wrap text to fit within max width
 */
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = sanitize(text).split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Generate PDF bytes from project data
 */
async function generatePdfBytes(project: any, options: { title?: string; author?: string }): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Page settings
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const colors = {
    dark: rgb(0.15, 0.15, 0.2),
    blue: rgb(0.15, 0.35, 0.6),
    lightBlue: rgb(0.9, 0.93, 0.98),
    gray: rgb(0.5, 0.5, 0.5),
    lightGray: rgb(0.95, 0.95, 0.95),
    white: rgb(1, 1, 1),
    accent: rgb(0.85, 0.25, 0.35),
  };

  const title = sanitize(options.title || project.title);
  const author = sanitize(options.author || "Comicore AI");
  const approvedPages = project.pages.filter((p: any) => p.status === "approved");
  const totalPanels = approvedPages.reduce((acc: number, p: any) => acc + (p.panels?.length || 0), 0);

  // Helper function to add a new page
  const addPage = () => pdfDoc.addPage([pageWidth, pageHeight]);

  // ==================== COVER PAGE ====================
  const coverPage = addPage();
  
  // Top bar
  coverPage.drawRectangle({
    x: 0, y: pageHeight - 60, width: pageWidth, height: 60,
    color: colors.dark,
  });

  // Title
  const titleSize = 28;
  const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
  coverPage.drawText(title, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - 180,
    size: titleSize,
    font: fontBold,
    color: colors.dark,
  });

  // Genre
  const genre = sanitize(project.genre || "Comic");
  const genreWidth = fontItalic.widthOfTextAtSize(`A ${genre} Story`, 14);
  coverPage.drawText(`A ${genre} Story`, {
    x: (pageWidth - genreWidth) / 2,
    y: pageHeight - 220,
    size: 14,
    font: fontItalic,
    color: colors.accent,
  });

  // Author
  const authorWidth = font.widthOfTextAtSize(`by ${author}`, 12);
  coverPage.drawText(`by ${author}`, {
    x: (pageWidth - authorWidth) / 2,
    y: pageHeight - 260,
    size: 12,
    font: font,
    color: colors.gray,
  });

  // Stats boxes
  const statsY = pageHeight - 350;
  const boxWidth = 100;
  const boxHeight = 50;
  const gap = 40;
  const totalWidth = boxWidth * 3 + gap * 2;
  const startX = (pageWidth - totalWidth) / 2;

  // Pages stat
  coverPage.drawRectangle({
    x: startX, y: statsY - boxHeight, width: boxWidth, height: boxHeight,
    color: colors.lightBlue, borderColor: colors.blue, borderWidth: 1,
  });
  const pagesNum = `${approvedPages.length}`;
  coverPage.drawText(pagesNum, {
    x: startX + (boxWidth - fontBold.widthOfTextAtSize(pagesNum, 18)) / 2,
    y: statsY - 25,
    size: 18, font: fontBold, color: colors.blue,
  });
  coverPage.drawText("Pages", {
    x: startX + (boxWidth - font.widthOfTextAtSize("Pages", 9)) / 2,
    y: statsY - 42,
    size: 9, font: font, color: colors.gray,
  });

  // Panels stat
  coverPage.drawRectangle({
    x: startX + boxWidth + gap, y: statsY - boxHeight, width: boxWidth, height: boxHeight,
    color: colors.lightBlue, borderColor: colors.blue, borderWidth: 1,
  });
  const panelsNum = `${totalPanels}`;
  coverPage.drawText(panelsNum, {
    x: startX + boxWidth + gap + (boxWidth - fontBold.widthOfTextAtSize(panelsNum, 18)) / 2,
    y: statsY - 25,
    size: 18, font: fontBold, color: colors.blue,
  });
  coverPage.drawText("Panels", {
    x: startX + boxWidth + gap + (boxWidth - font.widthOfTextAtSize("Panels", 9)) / 2,
    y: statsY - 42,
    size: 9, font: font, color: colors.gray,
  });

  // Genre stat
  coverPage.drawRectangle({
    x: startX + (boxWidth + gap) * 2, y: statsY - boxHeight, width: boxWidth, height: boxHeight,
    color: colors.lightGray, borderColor: colors.gray, borderWidth: 1,
  });
  const genreShort = genre.length > 10 ? genre.substring(0, 10) : genre;
  coverPage.drawText(genreShort, {
    x: startX + (boxWidth + gap) * 2 + (boxWidth - fontBold.widthOfTextAtSize(genreShort, 12)) / 2,
    y: statsY - 25,
    size: 12, font: fontBold, color: colors.dark,
  });
  coverPage.drawText("Genre", {
    x: startX + (boxWidth + gap) * 2 + (boxWidth - font.widthOfTextAtSize("Genre", 9)) / 2,
    y: statsY - 42,
    size: 9, font: font, color: colors.gray,
  });

  // Synopsis
  if (project.synopsis) {
    const synopsisLines = wrapText(project.synopsis, contentWidth - 40, font, 10);
    let synY = pageHeight - 440;
    
    coverPage.drawText("Synopsis", {
      x: margin, y: synY,
      size: 11, font: fontBold, color: colors.dark,
    });
    synY -= 20;
    
    synopsisLines.slice(0, 6).forEach((line) => {
      coverPage.drawText(line, {
        x: margin, y: synY,
        size: 10, font: fontItalic, color: colors.gray,
      });
      synY -= 14;
    });
  }

  // Footer
  const date = new Date().toLocaleDateString();
  const footerText = `Generated with Comicore AI | ${date}`;
  coverPage.drawText(footerText, {
    x: (pageWidth - font.widthOfTextAtSize(footerText, 8)) / 2,
    y: 30,
    size: 8, font: font, color: colors.gray,
  });

  // ==================== TABLE OF CONTENTS ====================
  const tocPage = addPage();
  
  // Header
  tocPage.drawRectangle({
    x: 0, y: pageHeight - 60, width: pageWidth, height: 60,
    color: colors.dark,
  });
  const tocTitle = "Table of Contents";
  tocPage.drawText(tocTitle, {
    x: (pageWidth - fontBold.widthOfTextAtSize(tocTitle, 20)) / 2,
    y: pageHeight - 40,
    size: 20, font: fontBold, color: colors.white,
  });

  // Entries
  let tocY = pageHeight - 100;
  approvedPages.forEach((page: any, index: number) => {
    if (tocY < 80) {
      tocY = pageHeight - 80;
    }
    
    const entryNum = `${index + 1}.`;
    tocPage.drawText(entryNum, {
      x: margin, y: tocY,
      size: 11, font: fontBold, color: colors.blue,
    });
    
    const entryTitle = sanitize(page.title);
    tocPage.drawText(entryTitle, {
      x: margin + 25, y: tocY,
      size: 11, font: font, color: colors.dark,
    });
    
    const pageNum = `Page ${index + 1}`;
    tocPage.drawText(pageNum, {
      x: pageWidth - margin - font.widthOfTextAtSize(pageNum, 10),
      y: tocY,
      size: 10, font: font, color: colors.gray,
    });
    
    tocY -= 28;
  });

  // ==================== CONTENT PAGES ====================
  for (let pageIndex = 0; pageIndex < approvedPages.length; pageIndex++) {
    const page = approvedPages[pageIndex];
    const contentPage = addPage();
    let yPos = pageHeight - 60;

    // Header
    contentPage.drawLine({
      start: { x: margin, y: pageHeight - 50 },
      end: { x: pageWidth - margin, y: pageHeight - 50 },
      thickness: 1, color: colors.lightGray,
    });
    
    contentPage.drawText(title, {
      x: margin, y: pageHeight - 40,
      size: 9, font: fontBold, color: colors.gray,
    });
    
    contentPage.drawText(`Page ${pageIndex + 1}`, {
      x: pageWidth - margin - 50, y: pageHeight - 40,
      size: 9, font: font, color: colors.gray,
    });

    // Chapter Title Box
    const chapterTitle = sanitize(page.title);
    const chBoxHeight = 30;
    contentPage.drawRectangle({
      x: margin, y: yPos - chBoxHeight + 10,
      width: contentWidth, height: chBoxHeight,
      color: colors.blue,
    });
    
    const chTitleWidth = fontBold.widthOfTextAtSize(chapterTitle, 16);
    contentPage.drawText(chapterTitle, {
      x: margin + (contentWidth - chTitleWidth) / 2,
      y: yPos - 10,
      size: 16, font: fontBold, color: colors.white,
    });
    yPos -= chBoxHeight + 25;

    // Script
    if (page.script) {
      contentPage.drawText("Script:", {
        x: margin, y: yPos,
        size: 10, font: fontBold, color: colors.dark,
      });
      yPos -= 15;
      
      const scriptLines = wrapText(page.script, contentWidth, fontItalic, 10);
      scriptLines.slice(0, 4).forEach((line) => {
        contentPage.drawText(line, {
          x: margin + 10, y: yPos,
          size: 10, font: fontItalic, color: colors.gray,
        });
        yPos -= 14;
      });
      yPos -= 15;
    }

    // Panels Header
    contentPage.drawText("PANELS", {
      x: margin, y: yPos,
      size: 12, font: fontBold, color: colors.blue,
    });
    contentPage.drawLine({
      start: { x: margin, y: yPos - 3 },
      end: { x: margin + 50, y: yPos - 3 },
      thickness: 2, color: colors.accent,
    });
    yPos -= 25;

    // Panels
    for (let pi = 0; pi < page.panels.length; pi++) {
      const panel = page.panels[pi];
      
      if (yPos < 120) {
        yPos = pageHeight - 60;
      }

      // Panel number box
      const pnlTitle = `Panel ${panel.panelNumber || pi + 1}`;
      const pnlWidth = fontBold.widthOfTextAtSize(pnlTitle, 11) + 14;
      contentPage.drawRectangle({
        x: margin, y: yPos - 5,
        width: pnlWidth, height: 18,
        color: colors.dark,
      });
      contentPage.drawText(pnlTitle, {
        x: margin + 7, y: yPos,
        size: 11, font: fontBold, color: colors.white,
      });
      yPos -= 20;

      // Description
      if (panel.description) {
        const descLines = wrapText(panel.description, contentWidth - 10, font, 9);
        descLines.forEach((line) => {
          contentPage.drawText(line, {
            x: margin + 5, y: yPos,
            size: 9, font: font, color: colors.dark,
          });
          yPos -= 12;
        });
      }

      // Camera / Mood
      if (panel.cameraAngle || panel.mood) {
        const meta: string[] = [];
        if (panel.cameraAngle) meta.push(`Camera: ${panel.cameraAngle}`);
        if (panel.mood) meta.push(`Mood: ${panel.mood}`);
        contentPage.drawText(sanitize(meta.join("  |  ")), {
          x: margin + 5, y: yPos,
          size: 8, font: fontItalic, color: colors.gray,
        });
        yPos -= 14;
      }

      // Dialogue
      if (panel.dialogue && panel.dialogue.length > 0) {
        for (const d of panel.dialogue) {
          if (yPos < 80) yPos = pageHeight - 60;
          
          const isNarration = d.type === "narration";
          const isSfx = d.type === "sfx";
          const charName = sanitize(d.character);
          const prefix = isNarration ? `[${charName}]` : `${charName}:`;
          
          contentPage.drawText(prefix, {
            x: margin + 5, y: yPos,
            size: 9, font: fontBold, color: colors.blue,
          });
          yPos -= 12;
          
          const dlgLines = wrapText(sanitize(d.text), contentWidth - 20, font, 9);
          dlgLines.forEach((line) => {
            contentPage.drawText(isSfx ? `*${line}*` : line, {
              x: margin + 15, y: yPos,
              size: 9, font: isNarration || isSfx ? fontItalic : font, color: colors.dark,
            });
            yPos -= 11;
          });
          yPos -= 5;
        }
      }

      // Separator
      yPos -= 10;
      contentPage.drawLine({
        start: { x: margin + 40, y: yPos + 5 },
        end: { x: pageWidth - margin - 40, y: yPos + 5 },
        thickness: 0.5, color: colors.lightGray,
      });
      yPos -= 15;
    }

    // Footer
    contentPage.drawText(`Comicore AI  |  ${title}`, {
      x: (pageWidth - font.widthOfTextAtSize(`Comicore AI  |  ${title}`, 8)) / 2,
      y: 20,
      size: 8, font: font, color: colors.gray,
    });
  }

  // Metadata
  pdfDoc.setTitle(title);
  pdfDoc.setAuthor(author);
  pdfDoc.setCreator("Comicore AI");

  return await pdfDoc.save();
}

/**
 * POST /api/export/pdf
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    if (!body.sessionId) {
      return NextResponse.json({ success: false, error: "sessionId is required." }, { status: 400 });
    }

    const project = await getProject(body.sessionId);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    const approvedPages = project.pages.filter((p: any) => p.status === "approved");
    if (approvedPages.length === 0) {
      return NextResponse.json({ success: false, error: "No approved pages to export." }, { status: 400 });
    }

    const options = {
      title: body.options?.title || project.title,
      author: body.options?.metadata?.author || "Comicore AI",
    };

    console.log(`[PDF Export] Generating PDF for: ${options.title}`);

    const pdfBytes = await generatePdfBytes(project, options);
    const originalSize = pdfBytes.length;

    console.log(`[PDF Export] Generated: ${originalSize} bytes`);

    // Compress
    const zlib = await import('zlib');
    const compressedBuffer = await new Promise<Buffer>((resolve, reject) => {
      zlib.gzip(Buffer.from(pdfBytes), (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const compressedSize = compressedBuffer.length;
    console.log(`[PDF Export] Compressed: ${compressedSize} bytes`);

    // Store in MongoDB
    const exportDoc = await Export.create({
      bookId: project.id,
      userId: session.userId,
      title: options.title,
      format: "pdf",
      status: "completed",
      compressedData: compressedBuffer,
      originalSize,
      compressedSize,
      pageCount: approvedPages.length,
    });

    console.log(`[PDF Export] Stored with ID: ${exportDoc._id}`);

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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
