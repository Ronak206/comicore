import fs from "fs";
import { fileURLToPath } from "url";
import sharp from "sharp";

import pageConfig
  from "./pageConfig.js";

import layoutLibrary
  from "./layoutLibrary.js";

function getPanelImagePath(
  pageNumber,
  panelNumber
) {

  return `downloads/page-${pageNumber}-panel-${panelNumber}.jpg`;
}

function cleanPageOutputs() {

  if (!fs.existsSync("./pages")) {

    fs.mkdirSync(
      "./pages"
    );

    return;
  }

  const pageFilePattern =
    /^page-\d+\.jpg$/;

  for (
    const file
    of fs.readdirSync("./pages")
  ) {

    if (pageFilePattern.test(file)) {

      fs.unlinkSync(
        `./pages/${file}`
      );
    }
  }
}

function validatePageForAssembly(
  page
) {

  const layout =
    layoutLibrary[
      page.layout
    ];

  if (!layout) {

    throw new Error(
      `Page ${page.page_number}: unknown layout "${page.layout}"`
    );
  }

  if (
    page.panels.length !==
    layout.panels.length
  ) {

    throw new Error(
      `Page ${page.page_number}: expected ${layout.panels.length} panels for "${page.layout}", got ${page.panels.length}`
    );
  }

  for (const panel of page.panels) {

    const layoutPanel =
      layout.panels.find(
        item =>
          item.panel_number ===
          panel.panel_number
      );

    if (!layoutPanel) {

      throw new Error(
        `Page ${page.page_number} Panel ${panel.panel_number}: no matching layout panel`
      );
    }

    const panelPath =
      panel.image_path ||
      getPanelImagePath(
        page.page_number,
        panel.panel_number
      );

    const expectedPanelPath =
      getPanelImagePath(
        page.page_number,
        panel.panel_number
      );

    if (
      panelPath !==
      expectedPanelPath
    ) {

      throw new Error(
        `Page ${page.page_number} Panel ${panel.panel_number}: image_path must be ${expectedPanelPath}`
      );
    }

    if (!fs.existsSync(panelPath)) {

      throw new Error(
        `Page ${page.page_number} Panel ${panel.panel_number}: missing image ${panelPath}`
      );
    }
  }

  return layout;
}

function escapeXml(
  value
) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(
  text,
  maxChars
) {

  const words =
    text.split(/\s+/);

  const lines = [];

  let currentLine =
    "";

  for (const word of words) {

    const nextLine =
      currentLine
        ? `${currentLine} ${word}`
        : word;

    if (
      nextLine.length > maxChars &&
      currentLine
    ) {

      lines.push(
        currentLine
      );

      currentLine =
        word;

    } else {

      currentLine =
        nextLine;
    }
  }

  if (currentLine) {

    lines.push(
      currentLine
    );
  }

  return lines;
}

function getTextBoxPosition(
  position,
  panelWidth,
  panelHeight,
  boxWidth,
  boxHeight
) {

  const padding =
    28;

  if (position === "top-right") {

    return {
      left: panelWidth - boxWidth - padding,
      top: padding
    };
  }

  if (position === "bottom-left") {

    return {
      left: padding,
      top: panelHeight - boxHeight - padding
    };
  }

  if (position === "bottom-right") {

    return {
      left: panelWidth - boxWidth - padding,
      top: panelHeight - boxHeight - padding
    };
  }

  if (position === "top-wide") {

    return {
      left: padding,
      top: padding
    };
  }

  if (position === "bottom-wide") {

    return {
      left: padding,
      top: panelHeight - boxHeight - padding
    };
  }

  return {
    left: padding,
    top: padding
  };
}

async function createDialogueOverlay(
  dialogue,
  panelWidth,
  panelHeight
) {

  const wide =
    dialogue.position === "top-wide" ||
    dialogue.position === "bottom-wide";

  const boxWidth =
    wide
      ? panelWidth - 56
      : Math.min(
          440,
          Math.floor(panelWidth * 0.62)
        );

  const fontSize =
    24;

  const lineHeight =
    31;

  const lines =
    wrapText(
      dialogue.text,
      Math.max(
        12,
        Math.floor((boxWidth - 40) / 13)
      )
    );

  const boxHeight =
    32 +
    (lines.length * lineHeight);

  const textElements =
    lines
      .map(
        (
          line,
          index
        ) =>
          `<text x="20" y="${30 + (index * lineHeight)}" font-size="${fontSize}" font-family="Arial" fill="#111">${escapeXml(line)}</text>`
      )
      .join("");

  const isNarration =
    dialogue.type === "narration";

  const radius =
    isNarration
      ? 6
      : 18;

  const fill =
    isNarration
      ? "#fff3c4"
      : "#ffffff";

  const svg =
    `
<svg width="${boxWidth}" height="${boxHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${boxWidth}" height="${boxHeight}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="#111" stroke-width="3"/>
  ${textElements}
</svg>
`;

  const position =
    getTextBoxPosition(
      dialogue.position,
      panelWidth,
      panelHeight,
      boxWidth,
      boxHeight
    );

  const input =
    await sharp(
      Buffer.from(svg)
    )
      .png()
      .toBuffer();

  return {

    input,
    left:
      Math.max(
        0,
        position.left
      ),
    top:
      Math.max(
        0,
        position.top
      )
  };
}

async function renderPanelImage(
  panelPath,
  panel,
  layoutPanel
) {

  const resizedPanel =
    await sharp(panelPath)

      .resize({

        width:
          layoutPanel.width,

        height:
          layoutPanel.height,

        fit:
          "cover"
      })

      .jpeg()

      .toBuffer();

  const overlays = [];

  for (
    const dialogue
    of panel.dialogues || []
  ) {

    if (
      !dialogue.text ||
      !dialogue.text.trim()
    ) {

      continue;
    }

    overlays.push(
      await createDialogueOverlay(
        dialogue,
        layoutPanel.width,
        layoutPanel.height
      )
    );
  }

  if (overlays.length === 0) {

    return resizedPanel;
  }

  return sharp(resizedPanel)
    .composite(
      overlays
    )
    .jpeg()
    .toBuffer();
}

async function assemblePages() {

  const comicData =
    fs.readFileSync(
      "./comic.json",
      "utf-8"
    );

  const comic =
    JSON.parse(
      comicData
    );

  cleanPageOutputs();

  for (const page of comic.pages) {

    console.log(
      `Assembling page ${page.page_number}...`
    );

    const layout =
      validatePageForAssembly(
        page
      );

    const composites = [];

    for (const panel of page.panels) {

      const layoutPanel =
        layout.panels.find(
          item =>
            item.panel_number ===
            panel.panel_number
        );

      const panelPath =
        panel.image_path ||
        getPanelImagePath(
          page.page_number,
          panel.panel_number
        );

      const resizedPanel =
        await renderPanelImage(
          panelPath,
          panel,
          layoutPanel
        );

      const borderedPanel =
        await sharp(resizedPanel)

          .extend({

            top:
              pageConfig.panelBorderWidth,

            bottom:
              pageConfig.panelBorderWidth,

            left:
              pageConfig.panelBorderWidth,

            right:
              pageConfig.panelBorderWidth,

            background:
              pageConfig.panelBorderColor
          })

          .jpeg()

          .toBuffer();

      composites.push({

        input:
          borderedPanel,

        left:
          layoutPanel.x,

        top:
          layoutPanel.y
      });
    }

    const outputPage =
      `./pages/page-${page.page_number}.jpg`;

    await sharp({

      create: {

        width:
          pageConfig.width,

        height:
          pageConfig.height,

        channels:
          3,

        background:
          pageConfig.backgroundColor
      }
    })

      .composite(
        composites
      )

      .jpeg()

      .toFile(
        outputPage
      );

    console.log(
      `Saved ${outputPage}`
    );
  }

  console.log(
    "All comic pages assembled!"
  );
}

export default assemblePages;

if (
  process.argv[1] ===
  fileURLToPath(
    import.meta.url
  )
) {

  assemblePages()
    .catch(
      error => {

        console.error(
          error.message
        );

        process.exitCode = 1;
      }
    );
}
