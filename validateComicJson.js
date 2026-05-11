import fs from "fs";

import layoutLibrary
  from "./layoutLibrary.js";

import panelShapeConfig
  from "./panelShapeConfig.js";

const comicData =
  fs.readFileSync(
    "./comic.json",
    "utf-8"
  );

const comic =
  JSON.parse(
    comicData
  );

const errors = [];

const allowedPageRoles = [
  "opening",
  "escalation",
  "reveal",
  "climax",
  "resolution"
];

function isUsefulText(
  value
) {

  return typeof value ===
    "string" &&
    value.trim().length > 0;
}

function getExpectedImagePath(
  pageNumber,
  panelNumber
) {

  return `downloads/page-${pageNumber}-panel-${panelNumber}.jpg`;
}

function getAspectRatio(
  width,
  height
) {

  return width / height;
}

function getShapeRatio(
  panelShape
) {

  const shapeConfig =
    panelShapeConfig[
      panelShape
    ];

  if (!shapeConfig) {

    return null;
  }

  return getAspectRatio(
    shapeConfig.width,
    shapeConfig.height
  );
}

if (!comic.title) {

  errors.push(
    "comic.title is missing"
  );
}

if (!isUsefulText(comic.story_arc)) {

  errors.push(
    "comic.story_arc is missing"
  );
}

if (
  !comic.continuity_anchor ||
  typeof comic.continuity_anchor !==
  "object" ||
  Array.isArray(comic.continuity_anchor)
) {

  errors.push(
    "comic.continuity_anchor is missing"
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

      if (!isUsefulText(comic.continuity_anchor[field])) {

        errors.push(
          `comic.continuity_anchor.${field} is missing`
        );
      }
    }
  );
}

if (
  !comic.pages ||
  !Array.isArray(comic.pages)
) {

  errors.push(
    "comic.pages is missing or invalid"
  );
}

if (
  comic.pages &&
  Array.isArray(comic.pages)
) {

  if (
    comic.pages.length < 1 ||
    comic.pages.length > 4
  ) {

    errors.push(
      `comic.pages must contain 1 to 4 pages, got ${comic.pages.length}`
    );
  }

  comic.pages.forEach(
    (
      page,
      pageIndex
    ) => {

      if (
        page.page_number !==
        pageIndex + 1
      ) {

        errors.push(
          `Page ${pageIndex + 1}: page_number must be ${pageIndex + 1}`
        );
      }

      if (!page.layout) {

        errors.push(
          `Page ${pageIndex + 1}: missing layout`
        );
      }

      if (
        !page.character_anchor ||
        !page.character_anchor.name
      ) {

        errors.push(
          `Page ${page.page_number}: missing character_anchor.name`
        );
      }

      if (!page.page_visual_theme) {

        errors.push(
          `Page ${page.page_number}: missing page_visual_theme`
        );
      }

      [
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

            errors.push(
              `Page ${page.page_number}: ${field} must be a string`
            );
          }
        }
      );

      if (
        !page.page_role ||
        !allowedPageRoles.includes(
          page.page_role
        )
      ) {

        errors.push(
          `Page ${page.page_number}: page_role must be one of: ${allowedPageRoles.join(", ")}`
        );
      }

      const layout =
        layoutLibrary[
          page.layout
        ];

      if (
        page.layout &&
        !layout
      ) {

        errors.push(
          `Page ${page.page_number}: unknown layout "${page.layout}"`
        );
      }

      if (
        !page.panels ||
        !Array.isArray(page.panels)
      ) {

        errors.push(
          `Page ${pageIndex + 1}: panels array missing`
        );

        return;
      }

      if (
        layout &&
        page.panels.length !==
        layout.panels.length
      ) {

        errors.push(
          `Page ${page.page_number}: expected ${layout.panels.length} panels for "${page.layout}", got ${page.panels.length}`
        );
      }

      const seenPanelNumbers =
        new Set();

      page.panels.forEach(
        (
          panel,
          panelIndex
        ) => {

          const panelLabel =
            `Page ${page.page_number} Panel ${panel.panel_number ?? panelIndex + 1}`;

          if (panel.panel_number === undefined) {

            errors.push(
              `${panelLabel}: missing panel_number`
            );
          }

          if (
            panel.panel_number !== undefined &&
            seenPanelNumbers.has(
              panel.panel_number
            )
          ) {

            errors.push(
              `${panelLabel}: duplicate panel_number`
            );
          }

          if (panel.panel_number !== undefined) {

            seenPanelNumbers.add(
              panel.panel_number
            );
          }

          if (!panel.panel_shape) {

            errors.push(
              `${panelLabel}: missing panel_shape`
            );
          }

          if (
            panel.panel_shape &&
            !panelShapeConfig[
              panel.panel_shape
            ]
          ) {

            errors.push(
              `${panelLabel}: unknown panel_shape "${panel.panel_shape}"`
            );
          }

          const layoutPanel =
            layout?.panels.find(
              item =>
                item.panel_number ===
                panel.panel_number
            );

          if (
            layout &&
            !layoutPanel
          ) {

            errors.push(
              `${panelLabel}: no matching layout panel`
            );
          }

          if (
            layoutPanel &&
            panel.panel_shape &&
            layoutPanel.shape !==
            panel.panel_shape
          ) {

            errors.push(
              `${panelLabel}: panel_shape "${panel.panel_shape}" does not match layout shape "${layoutPanel.shape}"`
            );
          }

          const shapeRatio =
            getShapeRatio(
              panel.panel_shape
            );

          if (
            layoutPanel &&
            shapeRatio
          ) {

            const layoutRatio =
              getAspectRatio(
                layoutPanel.width,
                layoutPanel.height
              );

            const ratioDelta =
              Math.abs(
                layoutRatio - shapeRatio
              ) / shapeRatio;

            if (ratioDelta > 0.15) {

              errors.push(
                `${panelLabel}: layout aspect ratio ${layoutRatio.toFixed(2)} does not match "${panel.panel_shape}" image ratio ${shapeRatio.toFixed(2)}`
              );
            }
          }

          if (!panel.image_prompt) {

            errors.push(
              `${panelLabel}: missing image_prompt`
            );
          }

          const expectedImagePath =
            getExpectedImagePath(
              page.page_number,
              panel.panel_number
            );

          if (!panel.image_path) {

            errors.push(
              `${panelLabel}: missing image_path`
            );

          } else if (
            panel.image_path !==
            expectedImagePath
          ) {

            errors.push(
              `${panelLabel}: image_path must be "${expectedImagePath}"`
            );
          }

          if (
            !panel.dialogues ||
            !Array.isArray(panel.dialogues)
          ) {

            errors.push(
              `${panelLabel}: dialogues missing`
            );
          }

          if (Array.isArray(panel.dialogues)) {

            panel.dialogues.forEach(
              (
                dialogue,
                dialogueIndex
              ) => {

                const dialogueLabel =
                  `${panelLabel} Dialogue ${dialogueIndex + 1}`;

                if (!dialogue.text) {

                  errors.push(
                    `${dialogueLabel}: missing text`
                  );
                }

                if (
                  dialogue.type &&
                  ![
                    "speech",
                    "thought",
                    "narration"
                  ].includes(dialogue.type)
                ) {

                  errors.push(
                    `${dialogueLabel}: invalid type "${dialogue.type}"`
                  );
                }

                if (!dialogue.position) {

                  errors.push(
                    `${dialogueLabel}: missing position`
                  );
                }

                if (
                  dialogue.position &&
                  ![
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "top-wide",
                    "bottom-wide"
                  ].includes(dialogue.position)
                ) {

                  errors.push(
                    `${dialogueLabel}: invalid position "${dialogue.position}"`
                  );
                }
              }
            );
          }
        }
      );
    }
  );
}

if (errors.length > 0) {

  console.log(
    "\nVALIDATION FAILED:\n"
  );

  errors.forEach(
    error =>
      console.log(
        "- " + error
      )
  );

  process.exitCode = 1;

} else {

  console.log(
    "\ncomic.json is VALID!"
  );
}
