import "dotenv/config";

import fs from "fs";

import fetch from "node-fetch";

import sharp from "sharp";

import panelShapeConfig
  from "./panelShapeConfig.js";

const invokeUrl =
  "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev";

const headers = {

  Authorization:
    `Bearer ${process.env.NVIDIA_IMAGE_API_KEY}`,

  Accept:
    "application/json"
};

const comicData =
  fs.readFileSync(
    "./comic.json",
    "utf-8"
  );

const comic =
  JSON.parse(
    comicData
  );

const maxGenerationAttempts =
  3;

const minimumImageBytes =
  10000;

function getExpectedImagePath(
  pageNumber,
  panelNumber
) {

  return `downloads/page-${pageNumber}-panel-${panelNumber}.jpg`;
}

function cleanDownloadOutputs() {

  if (!fs.existsSync("./downloads")) {

    fs.mkdirSync(
      "./downloads"
    );
  }

  const panelFilePattern =
    /^page-\d+-panel-\d+\.jpg$/;

  for (
    const file
    of fs.readdirSync("./downloads")
  ) {

    if (!panelFilePattern.test(file)) {

      continue;
    }

    fs.unlinkSync(
      `./downloads/${file}`
    );
  }
}

function validateComicForImageGeneration() {

  const errors = [];

  if (!process.env.NVIDIA_IMAGE_API_KEY) {

    errors.push(
      "NVIDIA_IMAGE_API_KEY is missing"
    );
  }

  if (
    !comic.pages ||
    !Array.isArray(comic.pages)
  ) {

    errors.push(
      "comic.pages is missing or invalid"
    );

    return errors;
  }

  for (const page of comic.pages) {

    if (
      !page.panels ||
      !Array.isArray(page.panels)
    ) {

      errors.push(
        `Page ${page.page_number}: panels array missing`
      );

      continue;
    }

    for (const panel of page.panels) {

      const prefix =
        `Page ${page.page_number} Panel ${panel.panel_number}`;

      if (!panel.image_prompt) {

        errors.push(
          `${prefix}: missing image_prompt`
        );
      }

      const expectedImagePath =
        getExpectedImagePath(
          page.page_number,
          panel.panel_number
        );

      if (!panel.image_path) {

        errors.push(
          `${prefix}: missing image_path`
        );

      } else if (
        panel.image_path !==
        expectedImagePath
      ) {

        errors.push(
          `${prefix}: image_path must be "${expectedImagePath}"`
        );
      }

      if (!panel.panel_shape) {

        errors.push(
          `${prefix}: missing panel_shape`
        );
      }

      if (
        panel.panel_shape &&
        !panelShapeConfig[
          panel.panel_shape
        ]
      ) {

        errors.push(
          `${prefix}: unknown panel_shape "${panel.panel_shape}"`
        );
      }
    }
  }

  return errors;
}

function getPanelSeed(
  pageNumber,
  panelNumber,
  attemptNumber = 1
) {

  return 42000 +
    (pageNumber * 100) +
    panelNumber +
    ((attemptNumber - 1) * 10000);
}

async function validateGeneratedImage(
  imageBuffer,
  shapeConfig
) {

  if (imageBuffer.length < minimumImageBytes) {

    throw new Error(
      `image file is suspiciously small (${imageBuffer.length} bytes)`
    );
  }

  const metadata =
    await sharp(
      imageBuffer
    )
      .metadata();

  if (
    metadata.width !== shapeConfig.width ||
    metadata.height !== shapeConfig.height
  ) {

    throw new Error(
      `image dimensions ${metadata.width}x${metadata.height} do not match expected ${shapeConfig.width}x${shapeConfig.height}`
    );
  }

  const stats =
    await sharp(
      imageBuffer
    )
      .stats();

  const visibleChannels =
    stats.channels.slice(
      0,
      3
    );

  const averageBrightness =
    visibleChannels.reduce(
      (
        total,
        channel
      ) =>
        total + channel.mean,
      0
    ) / visibleChannels.length;

  const averageVariation =
    visibleChannels.reduce(
      (
        total,
        channel
      ) =>
        total + channel.stdev,
      0
    ) / visibleChannels.length;

  if (
    averageBrightness < 8 &&
    averageVariation < 8
  ) {

    throw new Error(
      `image appears blank or nearly black (brightness ${averageBrightness.toFixed(2)}, variation ${averageVariation.toFixed(2)})`
    );
  }
}

async function generatePanelImage(
  page,
  panel,
  attemptNumber
) {

  const shapeConfig =
    panelShapeConfig[
      panel.panel_shape
    ];

  const finalPrompt =
    `
${panel.image_prompt}

Preserve clean comic readability.

Strong cinematic silhouette clarity.

Avoid cluttered environments.

Maintain readable focal point.

High-quality graphic novel panel.
`
      .replace(/\s+/g, " ")
      .trim();

  const payload = {

    prompt:
      finalPrompt,

    width:
      shapeConfig.width,

    height:
      shapeConfig.height,

    steps:
      28,

    cfg_scale:
      4,

    seed:
      getPanelSeed(
        page.page_number,
        panel.panel_number,
        attemptNumber
      )
  };

  const response =
    await fetch(
      invokeUrl,
      {
        method:
          "POST",

        headers: {

          "Content-Type":
            "application/json",

          ...headers
        },

        body:
          JSON.stringify(
            payload
          )
      }
    );

  if (response.status !== 200) {

    const errorText =
      await response.text();

    throw new Error(
      `Generation failed for page ${page.page_number} panel ${panel.panel_number}: ${errorText}`
    );
  }

  const data =
    await response.json();

  const imageBase64 =
    data.artifacts?.[0]
      ?.base64;

  if (!imageBase64) {

    throw new Error(
      `Generation response missing image data for page ${page.page_number} panel ${panel.panel_number}`
    );
  }

  const imageBuffer =
    Buffer.from(
      imageBase64,
      "base64"
    );

  await validateGeneratedImage(
    imageBuffer,
    shapeConfig
  );

  const outputPath =
    panel.image_path;

  fs.writeFileSync(
    outputPath,
    imageBuffer
  );

  console.log(
    `Saved ${outputPath}`
  );
}

async function generatePageImages() {

  const errors =
    validateComicForImageGeneration();

  if (errors.length > 0) {

    throw new Error(
      `Image generation validation failed:\n- ${errors.join("\n- ")}`
    );
  }

  cleanDownloadOutputs();

  for (const page of comic.pages) {

    console.log(
      `\nGenerating Page ${page.page_number}...\n`
    );

    for (const panel of page.panels) {

      let generated =
        false;

      let lastError =
        null;

      for (
        let attemptNumber = 1;
        attemptNumber <= maxGenerationAttempts;
        attemptNumber++
      ) {

        console.log(
          `Generating Panel ${panel.panel_number} (attempt ${attemptNumber}/${maxGenerationAttempts})...`
        );

        try {

          await generatePanelImage(
            page,
            panel,
            attemptNumber
          );

          generated =
            true;

          break;

        } catch (error) {

          lastError =
            error;

          console.warn(
            `Panel ${panel.panel_number} attempt ${attemptNumber} rejected: ${error.message}`
          );
        }
      }

      if (!generated) {

        throw new Error(
          `Generation failed quality checks for page ${page.page_number} panel ${panel.panel_number}: ${lastError.message}`
        );
      }
    }
  }

  console.log(
    "\nImage generation complete!\n"
  );
}

generatePageImages()
  .catch(
    error => {

      console.error(
        error.message
      );

      process.exitCode = 1;
    }
  );
