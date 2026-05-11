import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Font mapping for PDF
const PDF_FONTS: Record<string, StandardFonts> = {
  times: StandardFonts.TimesRoman,
  "times-bold": StandardFonts.TimesRomanBold,
  "times-italic": StandardFonts.TimesRomanItalic,
  helvetica: StandardFonts.Helvetica,
  "helvetica-bold": StandardFonts.HelveticaBold,
  "helvetica-italic": StandardFonts.HelveticaOblique,
  courier: StandardFonts.Courier,
  "courier-bold": StandardFonts.CourierBold,
  "courier-italic": StandardFonts.CourierOblique,
};

interface PdfSettings {
  font: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  bgColor: string;
  textColor: string;
  margin: number;
  padding: number;
  textAlign: "left" | "center" | "right" | "justify";
  bold: boolean;
  italic: boolean;
}

// Convert hex color to RGB values (0-1 range)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 1, g: 1, b: 1 };
}

// Get the appropriate font
function getFontName(settings: PdfSettings): StandardFonts {
  let fontKey = settings.font;

  if (settings.bold && settings.italic) {
    fontKey = `${settings.font}-bold`;
  } else if (settings.bold) {
    fontKey = `${settings.font}-bold`;
  } else if (settings.italic) {
    fontKey = `${settings.font}-italic`;
  }

  return PDF_FONTS[fontKey] || StandardFonts.TimesRoman;
}

// Wrap text to fit within page width
function wrapText(
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/(\s+)/);
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word.trim() + " ";
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
  }

  return lines;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, settings } = body as { text: string; settings: PdfSettings };

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "No text provided" },
        { status: 400 }
      );
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed font
    const fontName = getFontName(settings);
    const font = await pdfDoc.embedFont(fontName);

    // Page dimensions (A4)
    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // Margins in points (mm to points: 1mm ≈ 2.8346 points)
    const marginPoints = settings.margin * 2.8346;
    const paddingPoints = settings.padding * 2.8346;

    // Content area
    const contentWidth = pageWidth - marginPoints * 2 - paddingPoints * 2;
    const contentHeight = pageHeight - marginPoints * 2 - paddingPoints * 2;

    // Colors
    const bgColor = hexToRgb(settings.bgColor);
    const textColor = hexToRgb(settings.textColor);

    // Font size in points
    const fontSize = settings.fontSize;

    // Line height
    const lineHeightPoints = fontSize * settings.lineHeight;

    // Wrap text
    const lines = wrapText(text, font, fontSize, contentWidth);

    // Calculate pages needed
    const linesPerPage = Math.floor(contentHeight / lineHeightPoints) - 1;
    const pagesNeeded = Math.ceil(lines.length / linesPerPage);

    // Create pages
    for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Draw background
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
        color: rgb(bgColor.r, bgColor.g, bgColor.b),
      });

      // Get lines for this page
      const startLine = pageIndex * linesPerPage;
      const endLine = Math.min(startLine + linesPerPage, lines.length);
      const pageLines = lines.slice(startLine, endLine);

      // Draw text
      let yPosition = pageHeight - marginPoints - paddingPoints - fontSize;

      for (const line of pageLines) {
        let xPosition = marginPoints + paddingPoints;

        // Text alignment
        if (settings.textAlign === "center") {
          const textWidth = font.widthOfTextAtSize(line, fontSize);
          xPosition = (pageWidth - textWidth) / 2;
        } else if (settings.textAlign === "right") {
          const textWidth = font.widthOfTextAtSize(line, fontSize);
          xPosition = pageWidth - marginPoints - paddingPoints - textWidth;
        }

        page.drawText(line, {
          x: xPosition,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(textColor.r, textColor.g, textColor.b),
        });

        yPosition -= lineHeightPoints;
      }
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Return PDF
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="document.pdf"',
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
