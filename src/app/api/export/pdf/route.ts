import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/db";
import { connectDB } from "@/lib/mongodb";
import Export from "@/lib/models/Export";
import { getSession } from "@/lib/auth";
import puppeteer from "puppeteer";

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generate HTML content for the comic PDF using AI-inspired beautiful styling
 */
function generateComicHtml(project: any, options: {
  title?: string;
  author?: string;
  includeCover?: boolean;
  includeToc?: boolean;
}): string {
  const title = escapeHtml(options.title || project.title);
  const author = escapeHtml(options.author || "Comicore AI");
  const approvedPages = project.pages.filter((p: any) => p.status === "approved");
  const totalPanels = approvedPages.reduce((acc: number, p: any) => acc + (p.panels?.length || 0), 0);
  const genre = escapeHtml(project.genre || "Comic");
  const synopsis = escapeHtml(project.synopsis || "");
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Reset and Base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 0;
    }
    
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #ffffff;
    }
    
    /* Page Container */
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      page-break-after: always;
      position: relative;
    }
    
    .page:last-child {
      page-break-after: auto;
    }
    
    /* ==================== COVER PAGE ==================== */
    .cover-page {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .cover-page::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #e94560, #f39c12, #e94560);
    }
    
    .cover-page::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #e94560, #f39c12, #e94560);
    }
    
    .cover-decoration {
      position: absolute;
      width: 300px;
      height: 300px;
      border: 2px solid rgba(233, 69, 96, 0.2);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    .cover-decoration::before {
      content: '';
      position: absolute;
      width: 250px;
      height: 250px;
      border: 1px solid rgba(243, 156, 18, 0.3);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    
    .cover-content {
      position: relative;
      z-index: 10;
    }
    
    .cover-title {
      font-size: 42px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 15px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      background: linear-gradient(135deg, #ffffff, #e0e0e0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .cover-genre {
      font-size: 16px;
      font-style: italic;
      color: #e94560;
      margin-bottom: 30px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    
    .cover-author {
      font-size: 14px;
      color: rgba(255,255,255,0.8);
      margin-bottom: 40px;
    }
    
    .cover-stats {
      display: flex;
      gap: 30px;
      justify-content: center;
      margin-bottom: 40px;
    }
    
    .stat-box {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 10px;
      padding: 15px 25px;
      text-align: center;
      backdrop-filter: blur(5px);
    }
    
    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #f39c12;
    }
    
    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.6);
    }
    
    .cover-synopsis {
      max-width: 80%;
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      line-height: 1.8;
      font-style: italic;
      border-left: 3px solid #e94560;
      padding-left: 20px;
      text-align: left;
    }
    
    .cover-footer {
      position: absolute;
      bottom: 30px;
      font-size: 10px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 1px;
    }
    
    /* ==================== TABLE OF CONTENTS ==================== */
    .toc-page {
      background: #fafafa;
    }
    
    .toc-header {
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      color: #ffffff;
      padding: 20px 30px;
      margin: -20mm -20mm 30px -20mm;
      text-align: center;
    }
    
    .toc-title {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    
    .toc-list {
      list-style: none;
    }
    
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      margin-bottom: 8px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    
    .toc-item:nth-child(odd) {
      background: #f0f4f8;
    }
    
    .toc-page-title {
      font-size: 13px;
      color: #1a1a2e;
      font-weight: 500;
    }
    
    .toc-page-number {
      background: linear-gradient(135deg, #e94560, #c23a51);
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: 600;
    }
    
    /* ==================== CONTENT PAGES ==================== */
    .content-page {
      background: #ffffff;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 25px;
    }
    
    .header-title {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .header-page-num {
      font-size: 12px;
      color: #999;
    }
    
    /* Chapter Title */
    .chapter-title {
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      color: #ffffff;
      padding: 15px 25px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 25px;
      box-shadow: 0 4px 15px rgba(26, 26, 46, 0.3);
    }
    
    .chapter-title h1 {
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    /* Script Section */
    .script-section {
      background: #f8f9fa;
      border-left: 4px solid #f39c12;
      padding: 15px 20px;
      margin-bottom: 25px;
      border-radius: 0 8px 8px 0;
    }
    
    .script-label {
      font-size: 11px;
      font-weight: 600;
      color: #f39c12;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    
    .script-content {
      font-size: 12px;
      color: #555;
      font-style: italic;
      line-height: 1.7;
    }
    
    /* Panels Section */
    .panels-header {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a2e;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 3px solid #e94560;
      display: inline-block;
    }
    
    /* Panel Item */
    .panel-item {
      margin-bottom: 25px;
      padding: 20px;
      background: #fafafa;
      border-radius: 10px;
      border: 1px solid #e8e8e8;
      position: relative;
    }
    
    .panel-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #e94560, #f39c12);
      border-radius: 10px 0 0 10px;
    }
    
    .panel-header {
      display: inline-block;
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      color: #ffffff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 15px;
      letter-spacing: 1px;
    }
    
    .panel-description {
      font-size: 12px;
      color: #333;
      line-height: 1.7;
      margin-bottom: 12px;
      padding-left: 10px;
    }
    
    .panel-meta {
      display: flex;
      gap: 15px;
      margin-bottom: 12px;
      padding-left: 10px;
    }
    
    .meta-tag {
      font-size: 10px;
      padding: 4px 10px;
      border-radius: 12px;
      font-weight: 500;
    }
    
    .meta-camera {
      background: #e8f4fd;
      color: #1976d2;
    }
    
    .meta-mood {
      background: #fff3e0;
      color: #f57c00;
    }
    
    /* Dialogue */
    .dialogue-section {
      margin-top: 12px;
      padding-left: 10px;
    }
    
    .dialogue-item {
      margin-bottom: 12px;
      padding: 10px 15px;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e8e8e8;
    }
    
    .dialogue-character {
      font-size: 11px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 5px;
      display: inline-block;
      padding: 2px 8px;
      background: #e8f4fd;
      border-radius: 4px;
    }
    
    .dialogue-narrator {
      font-style: italic;
      background: #f5f5f5;
      color: #666;
    }
    
    .dialogue-text {
      font-size: 11px;
      color: #444;
      line-height: 1.6;
      padding-left: 10px;
    }
    
    .dialogue-text.sfx {
      font-style: italic;
      color: #888;
    }
    
    /* Panel Separator */
    .panel-separator {
      height: 1px;
      background: linear-gradient(90deg, transparent, #ddd, transparent);
      margin: 20px 0;
    }
    
    /* Footer */
    .page-footer {
      position: absolute;
      bottom: 15mm;
      left: 20mm;
      right: 20mm;
      text-align: center;
      font-size: 9px;
      color: #999;
      letter-spacing: 1px;
    }
    
    /* No Print */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  ${options.includeCover !== false ? `
  <!-- COVER PAGE -->
  <div class="page cover-page">
    <div class="cover-decoration"></div>
    <div class="cover-content">
      <h1 class="cover-title">${title}</h1>
      <p class="cover-genre">${genre}</p>
      <p class="cover-author">Written by ${author}</p>
      
      <div class="cover-stats">
        <div class="stat-box">
          <div class="stat-number">${approvedPages.length}</div>
          <div class="stat-label">Pages</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${totalPanels}</div>
          <div class="stat-label">Panels</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${genre}</div>
          <div class="stat-label">Genre</div>
        </div>
      </div>
      
      ${synopsis ? `
      <div class="cover-synopsis">
        ${synopsis.substring(0, 500)}${synopsis.length > 500 ? '...' : ''}
      </div>
      ` : ''}
    </div>
    <div class="cover-footer">Generated with Comicore AI | ${date}</div>
  </div>
  ` : ''}
  
  ${options.includeToc !== false ? `
  <!-- TABLE OF CONTENTS -->
  <div class="page toc-page">
    <div class="toc-header">
      <h2 class="toc-title">Table of Contents</h2>
    </div>
    <ul class="toc-list">
      ${approvedPages.map((page: any, index: number) => `
        <li class="toc-item">
          <span class="toc-page-title">${index + 1}. ${escapeHtml(page.title)}</span>
          <span class="toc-page-number">Page ${index + 1}</span>
        </li>
      `).join('')}
    </ul>
  </div>
  ` : ''}
  
  <!-- CONTENT PAGES -->
  ${approvedPages.map((page: any, pageIndex: number) => `
  <div class="page content-page">
    <div class="page-header">
      <span class="header-title">${title}</span>
      <span class="header-page-num">Page ${pageIndex + 1}</span>
    </div>
    
    <div class="chapter-title">
      <h1>${escapeHtml(page.title)}</h1>
    </div>
    
    ${page.script ? `
    <div class="script-section">
      <div class="script-label">Script</div>
      <div class="script-content">${escapeHtml(page.script)}</div>
    </div>
    ` : ''}
    
    <div class="panels-header">Panels</div>
    
    ${page.panels.map((panel: any, panelIndex: number) => `
    <div class="panel-item">
      <div class="panel-header">Panel ${panel.panelNumber || panelIndex + 1}</div>
      
      <div class="panel-description">
        ${escapeHtml(panel.description || '')}
      </div>
      
      ${panel.cameraAngle || panel.mood ? `
      <div class="panel-meta">
        ${panel.cameraAngle ? `<span class="meta-tag meta-camera">Camera: ${escapeHtml(panel.cameraAngle)}</span>` : ''}
        ${panel.mood ? `<span class="meta-tag meta-mood">Mood: ${escapeHtml(panel.mood)}</span>` : ''}
      </div>
      ` : ''}
      
      ${panel.dialogue && panel.dialogue.length > 0 ? `
      <div class="dialogue-section">
        ${panel.dialogue.map((d: any) => `
        <div class="dialogue-item">
          <span class="dialogue-character ${d.type === 'narration' ? 'dialogue-narrator' : ''}">
            ${d.type === 'narration' ? `[${escapeHtml(d.character)}]` : `${escapeHtml(d.character)}:`}
          </span>
          <div class="dialogue-text ${d.type === 'sfx' ? 'sfx' : ''}">
            ${d.type === 'sfx' ? `*${escapeHtml(d.text)}*` : escapeHtml(d.text)}
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
    ${panelIndex < page.panels.length - 1 ? '<div class="panel-separator"></div>' : ''}
    `).join('')}
    
    <div class="page-footer">Comicore AI | ${title}</div>
  </div>
  `).join('')}
</body>
</html>
  `;
}

/**
 * Generate PDF bytes from HTML using Puppeteer
 */
async function generatePdfFromHtml(html: string): Promise<Uint8Array> {
  let browser = null;
  
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/home/z/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
    });
    
    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    });
    
    return new Uint8Array(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * POST /api/export/pdf
 *
 * Generates a PDF using HTML+CSS styling and Puppeteer, then stores in MongoDB.
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
      author: body.options?.metadata?.author || "Comicore AI",
      includeCover: body.options?.includeCover !== false,
      includeToc: body.options?.includeToc !== false,
    };

    console.log(`[PDF Export] Generating HTML for: ${options.title}`);

    // Generate HTML content
    const html = generateComicHtml(project, options);

    console.log(`[PDF Export] Converting HTML to PDF...`);

    // Convert HTML to PDF using Puppeteer
    const pdfBytes = await generatePdfFromHtml(html);
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
        includeCover: options.includeCover,
        includeToc: options.includeToc,
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
