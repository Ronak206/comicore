import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import * as archiver from "archiver";

/**
 * POST /api/export/images
 *
 * Exports a comic project as PNG image sequence in a ZIP file
 * Each page becomes a separate high-resolution PNG image
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
    const quality = body.options?.quality || "high";

    // Determine resolution based on quality
    const resolutions = {
      web: { width: 1200, height: 1800 },
      high: { width: 2400, height: 3600 },
      print: { width: 3300, height: 5100 }, // 300 DPI for A4-ish
    };
    
    const { width, height } = resolutions[quality as keyof typeof resolutions] || resolutions.high;

    // Create archiver instance
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const chunks: Buffer[] = [];
    
    archive.on("data", (chunk) => {
      chunks.push(chunk);
    });

    // Generate placeholder images for each page
    const { createCanvas } = await import("canvas");
    
    approvedPages.forEach((page, index) => {
      const pageNum = String(index + 1).padStart(3, "0");
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);

      // Page border
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Header area
      ctx.fillStyle = "#111";
      ctx.fillRect(20, 20, width - 40, 100);

      // Title
      ctx.fillStyle = "#E8B931";
      ctx.font = `bold ${Math.floor(width / 30)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(page.title, width / 2, 80);

      // Genre badge
      ctx.fillStyle = "#333";
      ctx.fillRect(width - 200, 40, 150, 30);
      ctx.fillStyle = "#E8B931";
      ctx.font = `${Math.floor(width / 60)}px Arial`;
      ctx.fillText(project.genre, width - 125, 62);

      // Main content area
      const contentY = 150;
      const contentWidth = width - 100;
      const lineHeight = Math.floor(width / 40);

      // Script/Summary
      ctx.fillStyle = "#888";
      ctx.font = `${Math.floor(width / 50)}px Arial`;
      ctx.textAlign = "left";
      
      let y = contentY;
      
      if (page.script) {
        const words = page.script.split(" ");
        let line = "";
        
        words.forEach((word) => {
          const testLine = line + word + " ";
          if (ctx.measureText(testLine).width > contentWidth) {
            ctx.fillText(line, 50, y);
            line = word + " ";
            y += lineHeight;
          } else {
            line = testLine;
          }
        });
        ctx.fillText(line, 50, y);
        y += lineHeight * 2;
      }

      // Panel frames
      if (page.panels && page.panels.length > 0) {
        const panelStartY = y + 30;
        const panelHeight = Math.floor((height - panelStartY - 150) / Math.min(page.panels.length, 4));
        
        page.panels.forEach((panel, pIndex) => {
          if (pIndex >= 4) return; // Max 4 panels shown
          
          const panelY = panelStartY + (pIndex * panelHeight);
          
          // Panel border
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;
          ctx.strokeRect(50, panelY, width - 100, panelHeight - 20);
          
          // Panel number
          ctx.fillStyle = "#E8B931";
          ctx.font = `bold ${Math.floor(width / 40)}px Arial`;
          ctx.fillText(`Panel ${panel.panelNumber || pIndex + 1}`, 70, panelY + 35);
          
          // Camera angle
          if (panel.cameraAngle) {
            ctx.fillStyle = "#666";
            ctx.font = `${Math.floor(width / 60)}px Arial`;
            ctx.fillText(`[${panel.cameraAngle}]`, 200, panelY + 35);
          }
          
          // Panel description
          ctx.fillStyle = "#999";
          ctx.font = `${Math.floor(width / 55)}px Arial`;
          if (panel.description) {
            const descWords = panel.description.split(" ");
            let descLine = "";
            let descY = panelY + 70;
            
            descWords.slice(0, 30).forEach((word) => {
              const testLine = descLine + word + " ";
              if (ctx.measureText(testLine).width > width - 150) {
                ctx.fillText(descLine, 70, descY);
                descLine = word + " ";
                descY += Math.floor(lineHeight * 0.8);
                if (descY > panelY + panelHeight - 60) return;
              } else {
                descLine = testLine;
              }
            });
            if (descLine && descY < panelY + panelHeight - 60) {
              ctx.fillText(descLine, 70, descY);
            }
          }
          
          // Mood indicator
          if (panel.mood) {
            ctx.fillStyle = "#555";
            ctx.font = `italic ${Math.floor(width / 60)}px Arial`;
            ctx.textAlign = "right";
            ctx.fillText(panel.mood, width - 70, panelY + panelHeight - 40);
            ctx.textAlign = "left";
          }
        });
      }

      // Footer
      ctx.fillStyle = "#111";
      ctx.fillRect(20, height - 80, width - 40, 60);
      
      ctx.fillStyle = "#666";
      ctx.font = `${Math.floor(width / 50)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(`Page ${index + 1} of ${approvedPages.length}`, width / 2, height - 40);
      
      ctx.fillStyle = "#444";
      ctx.font = `${Math.floor(width / 70)}px Arial`;
      ctx.fillText("Generated by Comicore AI", width / 2, height - 20);

      // Add to archive with descriptive filename
      const buffer = canvas.toBuffer("image/png");
      const filename = `Page_${pageNum}_${page.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30)}.png`;
      archive.append(buffer, { name: filename });
    });

    // Add a README file
    const readme = `# ${title}

## Export Details
- Format: PNG Image Sequence
- Quality: ${quality}
- Resolution: ${width}x${height}px per page
- Total Pages: ${approvedPages.length}
- Generated: ${new Date().toISOString()}

## Files
${approvedPages.map((p, i) => `- Page ${String(i + 1).padStart(3, "0")}: ${p.title}`).join("\n")}

## About
This comic was generated by Comicore AI.
Visit https://comicore.ai for more information.
`;

    archive.append(Buffer.from(readme), { name: "README.txt" });

    // Finalize the archive
    await archive.finalize();

    await new Promise((resolve) => {
      archive.on("end", resolve);
    });

    const zipBuffer = Buffer.concat(chunks);
    const sizeMB = (zipBuffer.length / (1024 * 1024)).toFixed(2);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "-").toLowerCase()}-images.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error("Images export error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Export failed." },
      { status: 500 }
    );
  }
}
