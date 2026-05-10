import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * POST /api/export/pdf
 *
 * Exports a comic project as PDF
 *
 * Request Body:
 * {
 *   "sessionId": string,        // Project ID (required)
 *   "options": {                // Optional PDF settings
 *     "title": string,
 *     "pageSize": "a4" | "letter" | "comic",
 *     "orientation": "portrait" | "landscape",
 *     "includeCover": boolean,
 *     "quality": "web" | "print" | "high",
 *     "metadata": {
 *       "author": string,
 *       "publisher": string
 *     }
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
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
    const approvedPages = project.pages.filter(p => p.status === "approved");

    if (approvedPages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No approved pages to export. Generate and approve pages first." },
        { status: 400 }
      );
    }

    const title = body.options?.title || project.title;
    const author = body.options?.metadata?.author || "Comicore AI";

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Page dimensions (A4)
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    // Helper to add a new page
    const addPage = () => pdfDoc.addPage([pageWidth, pageHeight]);

    // Helper to wrap text
    const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

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

    // === COVER PAGE ===
    const coverPage = addPage();
    
    // Title
    const titleSize = 28;
    const titleWidth = helveticaBold.widthOfTextAtSize(title, titleSize);
    coverPage.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight - 200,
      size: titleSize,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Genre
    const genreText = `A ${project.genre} Comic`;
    const genreSize = 14;
    const genreWidth = helvetica.widthOfTextAtSize(genreText, genreSize);
    coverPage.drawText(genreText, {
      x: (pageWidth - genreWidth) / 2,
      y: pageHeight - 240,
      size: genreSize,
      font: helveticaOblique,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Author
    const authorText = `By ${author}`;
    const authorWidth = helvetica.widthOfTextAtSize(authorText, 12);
    coverPage.drawText(authorText, {
      x: (pageWidth - authorWidth) / 2,
      y: pageHeight - 280,
      size: 12,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Page count
    const pageCountText = `${approvedPages.length} Pages`;
    const pageCountWidth = helvetica.widthOfTextAtSize(pageCountText, 12);
    coverPage.drawText(pageCountText, {
      x: (pageWidth - pageCountWidth) / 2,
      y: pageHeight - 310,
      size: 12,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Synopsis (if available)
    if (project.synopsis) {
      const synopsisLines = wrapText(project.synopsis, contentWidth - 40, helvetica, 10);
      let synopsisY = pageHeight - 380;
      
      synopsisLines.slice(0, 10).forEach((line) => {
        const lineWidth = helvetica.widthOfTextAtSize(line, 10);
        coverPage.drawText(line, {
          x: (pageWidth - lineWidth) / 2,
          y: synopsisY,
          size: 10,
          font: helvetica,
          color: rgb(0.3, 0.3, 0.3),
        });
        synopsisY -= 14;
      });
    }

    // Generation info at bottom
    const genText = `Generated with Comicore AI on ${new Date().toLocaleDateString()}`;
    const genWidth = helvetica.widthOfTextAtSize(genText, 8);
    coverPage.drawText(genText, {
      x: (pageWidth - genWidth) / 2,
      y: 50,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // === TABLE OF CONTENTS ===
    const tocPage = addPage();
    
    // TOC Title
    const tocTitle = "Table of Contents";
    tocPage.drawText(tocTitle, {
      x: margin,
      y: pageHeight - 80,
      size: 18,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // TOC entries
    let tocY = pageHeight - 120;
    approvedPages.forEach((page, index) => {
      if (tocY < 80) {
        const newTocPage = addPage();
        tocY = pageHeight - 80;
      }
      
      const entryTitle = `${page.number}. ${page.title}`;
      tocPage.drawText(entryTitle, {
        x: margin,
        y: tocY,
        size: 10,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });

      const pageNum = `Page ${index + 1}`;
      tocPage.drawText(pageNum, {
        x: pageWidth - margin - helvetica.widthOfTextAtSize(pageNum, 10),
        y: tocY,
        size: 10,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });

      tocY -= 18;
    });

    // === CONTENT PAGES ===
    for (let pageIndex = 0; pageIndex < approvedPages.length; pageIndex++) {
      const page = approvedPages[pageIndex];
      const contentPage = addPage();

      let yPos = pageHeight - 80;

      // Page header
      const headerText = `${title} - Page ${pageIndex + 1}`;
      contentPage.drawText(headerText, {
        x: margin,
        y: pageHeight - 40,
        size: 8,
        font: helvetica,
        color: rgb(0.6, 0.6, 0.6),
      });

      // Page number on right
      const pageNumText = String(pageIndex + 1);
      contentPage.drawText(pageNumText, {
        x: pageWidth - margin - helvetica.widthOfTextAtSize(pageNumText, 8),
        y: pageHeight - 40,
        size: 8,
        font: helvetica,
        color: rgb(0.6, 0.6, 0.6),
      });

      // Page title
      contentPage.drawText(page.title, {
        x: margin,
        y: yPos,
        size: 16,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      yPos -= 25;

      // Chapter info if available
      const pageIndexItem = project.pageIndex.find(p => p.pageNumber === page.number);
      if (pageIndexItem?.chapterTitle) {
        const chapterText = `Chapter ${pageIndexItem.chapterNumber}: ${pageIndexItem.chapterTitle}`;
        contentPage.drawText(chapterText, {
          x: margin,
          y: yPos,
          size: 10,
          font: helveticaOblique,
          color: rgb(0.4, 0.4, 0.4),
        });
        yPos -= 20;
      }

      // Script preview
      if (page.script) {
        const scriptLines = wrapText(page.script, contentWidth, helvetica, 9);
        scriptLines.slice(0, 3).forEach((line) => {
          contentPage.drawText(line, {
            x: margin,
            y: yPos,
            size: 9,
            font: helvetica,
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
        font: helveticaBold,
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
          font: helveticaBold,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPos -= 14;

        // Panel description
        const descLines = wrapText(panel.description, contentWidth - 10, helvetica, 9);
        descLines.slice(0, 4).forEach((line) => {
          contentPage.drawText(line, {
            x: margin + 10,
            y: yPos,
            size: 9,
            font: helvetica,
            color: rgb(0.3, 0.3, 0.3),
          });
          yPos -= 12;
        });

        // Camera and mood
        if (panel.cameraAngle || panel.mood) {
          const meta = [panel.cameraAngle && `Camera: ${panel.cameraAngle}`, panel.mood && `Mood: ${panel.mood}`].filter(Boolean).join(" | ");
          contentPage.drawText(meta, {
            x: margin + 10,
            y: yPos,
            size: 8,
            font: helveticaOblique,
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

            const prefix = d.type === "narration" ? `[${d.character}]` : `${d.character}:`;
            const dialogueText = d.type === "sfx" ? `*${d.text}*` : d.text;
            
            // Character name
            contentPage.drawText(prefix, {
              x: margin + 10,
              y: yPos,
              size: 8,
              font: helveticaBold,
              color: rgb(0.2, 0.2, 0.2),
            });

            // Dialogue text
            const dialogueLines = wrapText(dialogueText, contentWidth - 50, helvetica, 8);
            const prefixWidth = helveticaBold.widthOfTextAtSize(prefix, 8);
            
            dialogueLines.forEach((line, idx) => {
              contentPage.drawText(line, {
                x: margin + 15 + prefixWidth,
                y: yPos - (idx * 10),
                size: 8,
                font: helvetica,
                color: rgb(0.3, 0.3, 0.3),
              });
            });
            yPos -= dialogueLines.length * 10 + 6;
          }
        }

        yPos += 8;
      }

      // Footer
      const footerText = `Comicore AI | ${title}`;
      const footerWidth = helvetica.widthOfTextAtSize(footerText, 7);
      contentPage.drawText(footerText, {
        x: (pageWidth - footerWidth) / 2,
        y: 30,
        size: 7,
        font: helvetica,
        color: rgb(0.7, 0.7, 0.7),
      });
    }

    // Set PDF metadata
    pdfDoc.setTitle(title);
    pdfDoc.setAuthor(author);
    pdfDoc.setSubject(`${project.genre} Comic`);
    pdfDoc.setKeywords(['comic', 'comicore', project.genre]);
    pdfDoc.setProducer('Comicore AI');
    pdfDoc.setCreator('Comicore AI');

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();

    // Return the PDF file
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
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
