import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { connectDB } from "@/lib/mongodb";
import Export from "@/lib/models/Export";
import { getSession } from "@/lib/auth";

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

// Color palette for beautiful PDF
const colors = {
  // Primary colors
  primary: rgb(0.2, 0.4, 0.8),       // Blue
  secondary: rgb(0.6, 0.3, 0.7),     // Purple
  
  // Background colors
  lightBlue: rgb(0.92, 0.95, 1.0),   // Light blue background
  lightPurple: rgb(0.95, 0.92, 0.98), // Light purple background
  lightGray: rgb(0.96, 0.96, 0.96),  // Light gray background
  
  // Text colors
  darkText: rgb(0.15, 0.15, 0.15),   // Dark text
  mediumText: rgb(0.3, 0.3, 0.3),    // Medium text
  lightText: rgb(0.5, 0.5, 0.5),     // Light text
  
  // Accent colors
  accent: rgb(0.98, 0.75, 0.2),      // Gold accent
  border: rgb(0.8, 0.8, 0.8),        // Border gray
  white: rgb(1, 1, 1),               // White
};

/**
 * Draw a rounded rectangle box
 */
function drawRoundedBox(
  page: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: any,
  borderColor: any,
  borderWidth: number = 1
) {
  // Draw filled rectangle with rounded corners approximation
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: fillColor,
    borderColor: borderColor,
    borderWidth: borderWidth,
  });
}

/**
 * Draw an underline under text
 */
function drawUnderline(
  page: any,
  text: string,
  x: number,
  y: number,
  font: any,
  fontSize: number,
  color: any,
  offset: number = 2
) {
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  page.drawLine({
    start: { x, y: y - offset },
    end: { x: x + textWidth, y: y - offset },
    thickness: 1,
    color: color,
  });
}

/**
 * Draw a decorative line separator
 */
function drawSeparator(
  page: any,
  x: number,
  y: number,
  width: number,
  color: any = colors.border
) {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 0.5,
    color: color,
  });
}

/**
 * Generate PDF bytes from project data with beautiful styling
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

    // Top decorative bar
    drawRoundedBox(coverPage, 0, pageHeight - 80, pageWidth, 80, 0, colors.primary, colors.primary);

    // Title background box
    const titleBoxY = pageHeight - 220;
    const titleBoxHeight = 100;
    drawRoundedBox(coverPage, margin - 10, titleBoxY - titleBoxHeight, contentWidth + 20, titleBoxHeight + 20, 0, colors.lightBlue, colors.primary, 2);

    // Title
    const titleSize = 32;
    const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
    const titleY = titleBoxY - 35;
    coverPage.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: titleY,
      size: titleSize,
      font: fontBold,
      color: colors.primary,
    });
    
    // Underline for title
    drawUnderline(coverPage, title, (pageWidth - titleWidth) / 2, titleY, fontBold, titleSize, colors.accent, 8);

    // Genre with italic styling
    const genreText = sanitizeForPdf(`${project.genre} Comic`);
    const genreSize = 16;
    const genreWidth = fontOblique.widthOfTextAtSize(genreText, genreSize);
    coverPage.drawText(genreText, {
      x: (pageWidth - genreWidth) / 2,
      y: pageHeight - 280,
      size: genreSize,
      font: fontOblique,
      color: colors.secondary,
    });

    // Author box
    const authorBoxY = pageHeight - 340;
    drawRoundedBox(coverPage, margin + 80, authorBoxY - 30, contentWidth - 160, 40, 0, colors.white, colors.border, 1);
    
    const authorText = sanitizeForPdf(`Written by ${author}`);
    const authorWidth = font.widthOfTextAtSize(authorText, 12);
    coverPage.drawText(authorText, {
      x: (pageWidth - authorWidth) / 2,
      y: authorBoxY - 10,
      size: 12,
      font: font,
      color: colors.mediumText,
    });

    // Stats row with boxes
    const statsY = pageHeight - 420;
    const statBoxWidth = 120;
    const statBoxHeight = 50;
    const statGap = 30;
    const totalStatsWidth = statBoxWidth * 3 + statGap * 2;
    const statsStartX = (pageWidth - totalStatsWidth) / 2;

    // Pages stat
    drawRoundedBox(coverPage, statsStartX, statsY - statBoxHeight, statBoxWidth, statBoxHeight, 0, colors.lightPurple, colors.secondary, 1);
    const pagesText = `${approvedPages.length}`;
    const pagesWidth = fontBold.widthOfTextAtSize(pagesText, 20);
    coverPage.drawText(pagesText, {
      x: statsStartX + (statBoxWidth - pagesWidth) / 2,
      y: statsY - 22,
      size: 20,
      font: fontBold,
      color: colors.secondary,
    });
    const pagesLabel = "Pages";
    const pagesLabelWidth = font.widthOfTextAtSize(pagesLabel, 9);
    coverPage.drawText(pagesLabel, {
      x: statsStartX + (statBoxWidth - pagesLabelWidth) / 2,
      y: statsY - 40,
      size: 9,
      font: font,
      color: colors.lightText,
    });

    // Panels stat
    const totalPanels = approvedPages.reduce((acc: number, p: any) => acc + (p.panels?.length || 0), 0);
    drawRoundedBox(coverPage, statsStartX + statBoxWidth + statGap, statsY - statBoxHeight, statBoxWidth, statBoxHeight, 0, colors.lightBlue, colors.primary, 1);
    const panelsText = `${totalPanels}`;
    const panelsWidth = fontBold.widthOfTextAtSize(panelsText, 20);
    coverPage.drawText(panelsText, {
      x: statsStartX + statBoxWidth + statGap + (statBoxWidth - panelsWidth) / 2,
      y: statsY - 22,
      size: 20,
      font: fontBold,
      color: colors.primary,
    });
    const panelsLabel = "Panels";
    const panelsLabelWidth = font.widthOfTextAtSize(panelsLabel, 9);
    coverPage.drawText(panelsLabel, {
      x: statsStartX + statBoxWidth + statGap + (statBoxWidth - panelsLabelWidth) / 2,
      y: statsY - 40,
      size: 9,
      font: font,
      color: colors.lightText,
    });

    // Genre stat
    drawRoundedBox(coverPage, statsStartX + (statBoxWidth + statGap) * 2, statsY - statBoxHeight, statBoxWidth, statBoxHeight, 0, colors.lightGray, colors.border, 1);
    const genreLabel = "Genre";
    const genreLabelWidth = font.widthOfTextAtSize(genreLabel, 9);
    coverPage.drawText(genreLabel, {
      x: statsStartX + (statBoxWidth + statGap) * 2 + (statBoxWidth - genreLabelWidth) / 2,
      y: statsY - 40,
      size: 9,
      font: font,
      color: colors.lightText,
    });
    const genreVal = sanitizeForPdf(project.genre || "Comic");
    const genreValWidth = fontBold.widthOfTextAtSize(genreVal, 11);
    coverPage.drawText(genreVal, {
      x: statsStartX + (statBoxWidth + statGap) * 2 + (statBoxWidth - genreValWidth) / 2,
      y: statsY - 22,
      size: 11,
      font: fontBold,
      color: colors.darkText,
    });

    // Synopsis section with box
    if (project.synopsis) {
      const synopsisBoxY = pageHeight - 560;
      const synopsisBoxHeight = 100;
      drawRoundedBox(coverPage, margin - 10, synopsisBoxY - synopsisBoxHeight, contentWidth + 20, synopsisBoxHeight + 10, 0, colors.lightGray, colors.border, 1);
      
      // Synopsis header
      const synopsisHeader = "Synopsis";
      coverPage.drawText(synopsisHeader, {
        x: margin + 5,
        y: synopsisBoxY - 15,
        size: 11,
        font: fontBold,
        color: colors.primary,
      });
      drawUnderline(coverPage, synopsisHeader, margin + 5, synopsisBoxY - 15, fontBold, 11, colors.primary, 3);

      // Synopsis text
      const synopsisLines = wrapText(project.synopsis, contentWidth - 20, fontOblique, 10);
      let synopsisY = synopsisBoxY - 35;
      synopsisLines.slice(0, 5).forEach((line) => {
        coverPage.drawText(line, {
          x: margin + 5,
          y: synopsisY,
          size: 10,
          font: fontOblique,
          color: colors.mediumText,
        });
        synopsisY -= 15;
      });
    }

    // Bottom decorative bar
    drawRoundedBox(coverPage, 0, 0, pageWidth, 40, 0, colors.primary, colors.primary);

    // Generation info centered in bottom bar
    const genText = sanitizeForPdf(`Generated with Comicore AI  |  ${new Date().toLocaleDateString()}`);
    const genWidth = font.widthOfTextAtSize(genText, 9);
    coverPage.drawText(genText, {
      x: (pageWidth - genWidth) / 2,
      y: 15,
      size: 9,
      font: font,
      color: colors.white,
    });
  }

  // === TABLE OF CONTENTS ===
  if (includeToc) {
    const tocPage = addPage();

    // TOC Header with background
    drawRoundedBox(tocPage, margin - 10, pageHeight - 100, contentWidth + 20, 50, 0, colors.primary, colors.primary);
    
    const tocTitle = "Table of Contents";
    const tocTitleWidth = fontBold.widthOfTextAtSize(tocTitle, 22);
    tocPage.drawText(tocTitle, {
      x: (pageWidth - tocTitleWidth) / 2,
      y: pageHeight - 75,
      size: 22,
      font: fontBold,
      color: colors.white,
    });

    // TOC entries with alternating backgrounds
    let tocY = pageHeight - 140;
    approvedPages.forEach((page: any, index: number) => {
      if (tocY < 80) {
        const newTocPage = addPage();
        tocY = pageHeight - 80;
      }

      // Alternating row background
      const rowBg = index % 2 === 0 ? colors.lightBlue : colors.white;
      drawRoundedBox(tocPage, margin - 5, tocY - 5, contentWidth + 10, 25, 0, rowBg, rowBg);

      const entryTitle = sanitizeForPdf(`${page.number}. ${page.title}`);
      tocPage.drawText(entryTitle, {
        x: margin + 5,
        y: tocY + 5,
        size: 11,
        font: font,
        color: colors.darkText,
      });

      // Page number in a small box
      const pageNum = `${index + 1}`;
      const pageNumWidth = fontBold.widthOfTextAtSize(pageNum, 10);
      const pageNumBoxX = pageWidth - margin - 30;
      
      drawRoundedBox(tocPage, pageNumBoxX, tocY, 25, 18, 0, colors.secondary, colors.secondary);
      tocPage.drawText(pageNum, {
        x: pageNumBoxX + (25 - pageNumWidth) / 2,
        y: tocY + 5,
        size: 10,
        font: fontBold,
        color: colors.white,
      });

      tocY -= 30;
    });

    // Bottom decorative line
    drawSeparator(tocPage, margin, 60, contentWidth, colors.primary);
  }

  // === CONTENT PAGES (Clean & Structured) ===
  for (let pageIndex = 0; pageIndex < approvedPages.length; pageIndex++) {
    const page = approvedPages[pageIndex];
    const contentPage = addPage();

    let yPos = pageHeight - 60;

    // Simple header bar
    contentPage.drawLine({
      start: { x: margin, y: pageHeight - 50 },
      end: { x: pageWidth - margin, y: pageHeight - 50 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Title on left
    contentPage.drawText(sanitizeForPdf(title), {
      x: margin,
      y: pageHeight - 40,
      size: 9,
      font: fontBold,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Page number on right
    contentPage.drawText(`Page ${pageIndex + 1}`, {
      x: pageWidth - margin - 50,
      y: pageHeight - 40,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // === CHAPTER NAME (Prominent) ===
    const pageTitle = sanitizeForPdf(page.title);
    
    // Chapter box with background
    const chapterBoxHeight = 35;
    contentPage.drawRectangle({
      x: margin,
      y: yPos - chapterBoxHeight + 10,
      width: contentWidth,
      height: chapterBoxHeight,
      color: rgb(0.15, 0.35, 0.65),
    });
    
    // Chapter name text (white, centered in box)
    const chapterTitleWidth = fontBold.widthOfTextAtSize(pageTitle, 16);
    contentPage.drawText(pageTitle, {
      x: margin + (contentWidth - chapterTitleWidth) / 2,
      y: yPos - 15,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    
    yPos -= chapterBoxHeight + 25;

    // === SCRIPT SECTION (if available) ===
    if (page.script) {
      // Script label
      contentPage.drawText("Script:", {
        x: margin,
        y: yPos,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPos -= 15;
      
      // Script content (italic)
      const scriptLines = wrapText(page.script, contentWidth, fontOblique, 10);
      scriptLines.slice(0, 5).forEach((line) => {
        contentPage.drawText(line, {
          x: margin + 10,
          y: yPos,
          size: 10,
          font: fontOblique,
          color: rgb(0.35, 0.35, 0.35),
        });
        yPos -= 14;
      });
      
      yPos -= 15;
      
      // Separator after script
      contentPage.drawLine({
        start: { x: margin + 50, y: yPos + 5 },
        end: { x: pageWidth - margin - 50, y: yPos + 5 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      yPos -= 20;
    }

    // === PANELS SECTION ===
    // Panels header
    contentPage.drawText("PANELS", {
      x: margin,
      y: yPos,
      size: 11,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.6),
    });
    
    // Underline for panels header
    const panelsHeaderWidth = fontBold.widthOfTextAtSize("PANELS", 11);
    contentPage.drawLine({
      start: { x: margin, y: yPos - 3 },
      end: { x: margin + panelsHeaderWidth, y: yPos - 3 },
      thickness: 1.5,
      color: rgb(0.2, 0.2, 0.6),
    });
    
    yPos -= 25;

    // Panel content
    for (let panelIndex = 0; panelIndex < page.panels.length; panelIndex++) {
      const panel = page.panels[panelIndex];

      // Check if we need a new page
      if (yPos < 120) {
        const newContentPage = addPage();
        yPos = pageHeight - 60;
      }

      // Panel header box
      const panelHeader = `Panel ${panel.panelNumber || panelIndex + 1}`;
      const panelHeaderWidth = fontBold.widthOfTextAtSize(panelHeader, 11) + 16;
      
      contentPage.drawRectangle({
        x: margin,
        y: yPos - 5,
        width: panelHeaderWidth,
        height: 18,
        color: rgb(0.3, 0.3, 0.6),
      });
      
      contentPage.drawText(panelHeader, {
        x: margin + 8,
        y: yPos,
        size: 11,
        font: fontBold,
        color: rgb(1, 1, 1),
      });
      
      yPos -= 20;

      // Panel description
      if (panel.description) {
        const descLines = wrapText(panel.description, contentWidth - 10, font, 9);
        descLines.forEach((line) => {
          contentPage.drawText(line, {
            x: margin + 5,
            y: yPos,
            size: 9,
            font: font,
            color: rgb(0.25, 0.25, 0.25),
          });
          yPos -= 12;
        });
      }

      // Camera and mood
      if (panel.cameraAngle || panel.mood) {
        const meta = [];
        if (panel.cameraAngle) meta.push(`Camera: ${panel.cameraAngle}`);
        if (panel.mood) meta.push(`Mood: ${panel.mood}`);
        const metaText = sanitizeForPdf(meta.join("   |   "));
        contentPage.drawText(metaText, {
          x: margin + 5,
          y: yPos,
          size: 8,
          font: fontOblique,
          color: rgb(0.45, 0.45, 0.45),
        });
        yPos -= 14;
      }

      // Dialogue
      if (panel.dialogue && panel.dialogue.length > 0) {
        yPos -= 3;
        
        for (const d of panel.dialogue) {
          if (yPos < 80) {
            const newContentPage = addPage();
            yPos = pageHeight - 60;
          }

          const isNarration = d.type === "narration";
          const isSfx = d.type === "sfx";
          const charName = sanitizeForPdf(d.character);
          const dialogueText = sanitizeForPdf(d.text);

          // Character name
          const prefix = isNarration ? `[${charName}]` : `${charName}:`;
          contentPage.drawText(prefix, {
            x: margin + 5,
            y: yPos,
            size: 9,
            font: fontBold,
            color: rgb(0.2, 0.2, 0.5),
          });
          yPos -= 12;

          // Dialogue text
          const dialogueLines = wrapText(dialogueText, contentWidth - 15, font, 9);
          dialogueLines.forEach((line) => {
            const displayText = isSfx ? `*${line}*` : line;
            contentPage.drawText(displayText, {
              x: margin + 15,
              y: yPos,
              size: 9,
              font: isNarration || isSfx ? fontOblique : font,
              color: rgb(0.3, 0.3, 0.3),
            });
            yPos -= 11;
          });
          yPos -= 5;
        }
      }

      // Spacing and separator between panels
      yPos -= 12;
      
      // Dashed separator line between panels
      const dashLength = 3;
      const dashGap = 3;
      const separatorY = yPos + 5;
      const separatorStartX = margin + 40;
      const separatorEndX = pageWidth - margin - 40;
      
      for (let x = separatorStartX; x < separatorEndX; x += dashLength + dashGap) {
        const endX = Math.min(x + dashLength, separatorEndX);
        contentPage.drawLine({
          start: { x, y: separatorY },
          end: { x: endX, y: separatorY },
          thickness: 0.5,
          color: rgb(0.75, 0.75, 0.75),
        });
      }
      
      yPos -= 15;
    }

    // Footer
    const footerText = sanitizeForPdf(`Comicore AI  |  ${title}`);
    const footerWidth = font.widthOfTextAtSize(footerText, 8);
    contentPage.drawText(footerText, {
      x: (pageWidth - footerWidth) / 2,
      y: 20,
      size: 8,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
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
    // Get current user session
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

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

    // Compress PDF using zlib (gzip)
    const zlib = await import('zlib');
    const gzipPromise = () => new Promise<Buffer>((resolve, reject) => {
      zlib.gzip(Buffer.from(pdfBytes), (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const compressedBuffer = await gzipPromise();
    const compressedSize = compressedBuffer.length;

    console.log(`[PDF Export] Compressed: ${compressedSize} bytes (${Math.round((1 - compressedSize / originalSize) * 100)}% reduction)`);

    // Store in MongoDB with user ID
    const exportDoc = await Export.create({
      bookId: project.id,
      userId: session.userId,
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
