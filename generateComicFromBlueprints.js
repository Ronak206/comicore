import fs from "fs";

import layoutLibrary
  from "./layoutLibrary.js";

// -------------------------------------
// LOAD PANEL BLUEPRINTS
// -------------------------------------

const blueprintData =
  fs.readFileSync(
    "./panelBlueprints.json",
    "utf-8"
  );

const blueprint =
  JSON.parse(
    blueprintData
  );

// -------------------------------------
// VALIDATE BLUEPRINT
// -------------------------------------

const validationErrors = [];

function isUsefulText(
  value
) {

  return typeof value ===
    "string" &&
    value.trim().length > 0;
}

if (
  !blueprint.pages ||
  !Array.isArray(
    blueprint.pages
  )
) {

  validationErrors.push(
    "panelBlueprints.pages is missing or invalid"
  );

} else {

  if (
    blueprint.pages.length < 1 ||
    blueprint.pages.length > 4
  ) {

    validationErrors.push(
      `panelBlueprints.pages must contain 1 to 4 pages, got ${blueprint.pages.length}`
    );
  }

  if (!isUsefulText(blueprint.story_arc)) {

    validationErrors.push(
      "panelBlueprints.story_arc is missing"
    );
  }

  if (
    !blueprint.continuity_anchor ||
    typeof blueprint.continuity_anchor !==
    "object" ||
    Array.isArray(blueprint.continuity_anchor)
  ) {

    validationErrors.push(
      "panelBlueprints.continuity_anchor is missing"
    );

  } else {

    [
      "main_character",
      "costume",
      "key_props",
      "environment_rules",
      "lighting_rules"
    ].forEach(
      field => {

        if (!isUsefulText(blueprint.continuity_anchor[field])) {

          validationErrors.push(
            `panelBlueprints.continuity_anchor.${field} is missing`
          );
        }
      }
    );
  }

  blueprint.pages.forEach(
    (
      page,
      pageIndex
    ) => {

    if (
      page.page_number !==
      pageIndex + 1
    ) {

      validationErrors.push(
        `Page ${pageIndex + 1}: page_number must be ${pageIndex + 1}`
      );
    }

    const layout =
      layoutLibrary[
        page.layout
      ];

    if (!layout) {

      validationErrors.push(
        `Page ${page.page_number}: unknown layout "${page.layout}"`
      );

      return;
    }

    if (
      !page.panels ||
      !Array.isArray(
        page.panels
      )
    ) {

      validationErrors.push(
        `Page ${page.page_number}: panels array missing`
      );

      return;
    }

    if (
      !page.character_anchor ||
      !page.character_anchor.name
    ) {

      validationErrors.push(
        `Page ${page.page_number}: missing character_anchor.name`
      );
    }

    if (!page.page_visual_theme) {

      validationErrors.push(
        `Page ${page.page_number}: missing page_visual_theme`
      );
    }

    [
      "page_role",
      "page_intent",
      "emotional_progression",
      "location_state",
      "time_state",
      "continuity_from_previous_page",
      "continuity_to_next_page"
    ].forEach(
      field => {

        if (
          typeof page[field] !==
          "string"
        ) {

          validationErrors.push(
            `Page ${page.page_number}: ${field} must be a string`
          );
        }
      }
    );

    if (
      page.panels.length !==
      layout.panels.length
    ) {

      validationErrors.push(
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

        validationErrors.push(
          `Page ${page.page_number} Panel ${panel.panel_number}: no matching layout panel`
        );

        continue;
      }

      if (
        panel.panel_shape !==
        layoutPanel.shape
      ) {

        validationErrors.push(
          `Page ${page.page_number} Panel ${panel.panel_number}: panel_shape "${panel.panel_shape}" does not match layout shape "${layoutPanel.shape}"`
        );
      }

      if (
        typeof panel.story_beat !==
        "string" ||
        panel.story_beat.trim().length <
        15
      ) {

        validationErrors.push(
          `Page ${page.page_number} Panel ${panel.panel_number}: story_beat must be a concrete drawable story sentence`
        );
      }
    }
    }
  );
}

if (validationErrors.length > 0) {

  console.log(
    "\nBLUEPRINT VALIDATION FAILED:\n"
  );

  validationErrors.forEach(
    error =>
      console.log(
        "- " + error
      )
  );

  process.exit(1);
}

// -------------------------------------
// COMIC OUTPUT
// -------------------------------------

const comic = {

  title:
    blueprint.title,

  story_arc:
    blueprint.story_arc,

  continuity_anchor:
    blueprint.continuity_anchor,

  pages: []
};

function getPanelImagePath(
  pageNumber,
  panelNumber
) {

  return `downloads/page-${pageNumber}-panel-${panelNumber}.jpg`;
}

// -------------------------------------
// LOOP PAGES
// -------------------------------------

for (const page of blueprint.pages) {

  // -----------------------------------
  // PAGE OBJECT
  // -----------------------------------

  const comicPage = {

    page_number:
      page.page_number,

    layout:
      page.layout,

    page_role:
      page.page_role,

    page_intent:
      page.page_intent,

    emotional_progression:
      page.emotional_progression,

    location_state:
      page.location_state,

    time_state:
      page.time_state,

    continuity_from_previous_page:
      page.continuity_from_previous_page,

    continuity_to_next_page:
      page.continuity_to_next_page,

    page_visual_theme:
      page.page_visual_theme,

    character_anchor:
      page.character_anchor,

    panels: []
  };

  // -----------------------------------
  // CHARACTER ANCHOR
  // -----------------------------------

    const character =
      page.character_anchor;

    const continuity =
      blueprint.continuity_anchor;

  // -----------------------------------
  // LOOP PANELS
  // -----------------------------------

  for (const panel of page.panels) {

    // ---------------------------------
    // FIND LAYOUT PANEL
    // ---------------------------------

    const layout =
    layoutLibrary[
        page.layout
    ];

    const layoutPanel =
    layout.panels.find(
        p =>
        p.panel_number ===
        panel.panel_number
    );

    // ---------------------------------
    // LAYOUT AWARE DIRECTION
    // ---------------------------------

    let layoutDirection =
    "";

    if (
    panel.panel_shape ===
    "wide"
    ) {

    layoutDirection =
        `
    Wide cinematic framing.

    Environment should occupy
    significant visual space.

    Subject should not dominate
    entire frame.

    Strong atmospheric storytelling.

    Clear horizontal eye flow.

    Use depth staging with foreground,
    midground, and background story clues.
    `;
    }

    if (
    panel.panel_shape ===
    "square"
    ) {

    layoutDirection =
        `
    Balanced composition.

    Equal emphasis on
    character and environment.

    Controlled focal clarity.

    Readable emotional staging.

    Emphasize reaction, intent,
    or a clear character decision.
    `;
    }

    if (
    panel.panel_shape ===
    "tall"
    ) {

    layoutDirection =
        `
    Vertical cinematic composition.

    Strong upward or downward
    visual movement.

    Emphasize height, depth,
    or vertical tension.

    Avoid overly wide staging.

    Keep subject integrated
    within environment.

    Use vertical space to show movement,
    isolation, danger, or pursuit.
    `;
    }

    // ---------------------------------
    // CHARACTER DESCRIPTION
    // ---------------------------------

    const characterDetails =
      [
        character.name,
        character.age,
        character.hair,
        character.face,
        character.clothing,
        character.silhouette,
        character.visual_motif
      ]
        .filter(Boolean)
        .join(", ");

const characterPrompt =
      `
Consistent protagonist design:
${characterDetails}.

Global continuity anchor:
${continuity.main_character}.

Costume continuity:
${continuity.costume}.

Key props continuity:
${continuity.key_props}.

Natural cinematic body language.

Keep the protagonist visually consistent
with the same clothing, silhouette,
and motif across panels.

Keep face, hairstyle, clothing,
proportions, accessories, and injury state
consistent from panel to panel.
`;

    // ---------------------------------
    // COMPOSITION
    // ---------------------------------

    const compositionPrompt =
      `
${panel.panel_shape} comic panel.

${panel.camera_shot} shot.

Subject positioned on the
${panel.subject_position}.

Leave
${panel.dialogue_safe_zone}
visually clean for dialogue.

Readable cinematic composition.
`;

    // ---------------------------------
    // STORY ACTION
    // ---------------------------------

    const storyActionPrompt =
  `
Scene action:

${panel.story_beat}.

Story arc:
${blueprint.story_arc}.

Page role:
${page.page_role}.

Page intent:
${page.page_intent}.

Page emotional progression:
${page.emotional_progression}.

Current location state:
${page.location_state}.

Current time state:
${page.time_state}.

Continuity from previous page:
${page.continuity_from_previous_page}.

Continuity to next page:
${page.continuity_to_next_page}.

Preserve the exact narrative action.

Do not substitute major story objects.

Make every concrete story fact visible:
injuries, weapons, opponents, masks,
vehicles, weather, key props, and
spatial relationships must remain clear
when present in the beat.

This panel must advance the sequence,
not repeat a previous composition.

Environment style:
${page.page_visual_theme.environment_style}.

Environment continuity rules:
${continuity.environment_rules}.

Environment visibility:
${panel.environment_visibility}.

Focus on visual storytelling clarity.
`;

    // ---------------------------------
    // LIGHTING
    // ---------------------------------

    const lightingPrompt =
      `
Lighting style:
${panel.lighting_style}.

Lighting continuity rules:
${continuity.lighting_rules}.

Color palette:
${page.page_visual_theme.primary_palette}
with
${page.page_visual_theme.accent_palette}
accents.
`;

    // ---------------------------------
    // EMOTION
    // ---------------------------------

    const emotionPrompt =
      `
Emotional tone:
${panel.emotion}.

Subtle emotional expression.

Avoid exaggerated reactions.
`;

    // ---------------------------------
    // VISUAL DENSITY
    // ---------------------------------

    const densityPrompt =
      `
Visual density:
${panel.visual_density}.

Avoid visual clutter.
`;

    // ---------------------------------
    // FINAL PROMPT
    // ---------------------------------

    const imagePrompt =
      `
${storyActionPrompt}

${compositionPrompt}

${layoutDirection}

${lightingPrompt}

${characterPrompt}

${emotionPrompt}

${densityPrompt}

Graphic novel ink illustration.

Controlled cinematic lighting.

Readable panel composition.

Atmospheric shadow design.
`
        .replace(/\s+/g, " ")
        .trim();

    // ---------------------------------
    // NEGATIVE PROMPT
    // ---------------------------------

    const negativePrompt =
      `
blurry,
low quality,
distorted anatomy,
extra fingers,
warped face,
cropped head,
cluttered composition,
chaotic background,
unreadable lighting,
overexposed highlights,
text artifacts,
watermark,
logo,
messy perspective,
visual confusion,
excessive detail,
oversaturated colors
`
        .replace(/\s+/g, " ")
        .trim();

    // ---------------------------------
    // SIMPLE DIALOGUE PLACEHOLDER
    // ---------------------------------

    const dialogues = [];

    if (
      panel.dialogue_text &&
      panel.dialogue_text.trim()
    ) {

      dialogues.push({

        type:
          panel.dialogue_type ||
          "narration",

        position:
          panel.dialogue_safe_zone,

        text:
          panel.dialogue_text.trim()
      });
    }

    // ---------------------------------
    // CREATE COMIC PANEL
    // ---------------------------------

    const comicPanel = {

      panel_number:
        panel.panel_number,

      panel_shape:
        panel.panel_shape,

      image_path:
        getPanelImagePath(
          page.page_number,
          panel.panel_number
        ),

      image_prompt:
        imagePrompt,

      negative_prompt:
        negativePrompt,

      dialogues
    };

    // ---------------------------------
    // PUSH PANEL
    // ---------------------------------

    comicPage.panels.push(
      comicPanel
    );
  }

  // -----------------------------------
  // PUSH PAGE
  // -----------------------------------

  comic.pages.push(
    comicPage
  );
}

// -------------------------------------
// SAVE FILE
// -------------------------------------

fs.writeFileSync(
  "./comic.json",
  JSON.stringify(
    comic,
    null,
    2
  )
);

console.log(
  "comic.json generated!"
);
