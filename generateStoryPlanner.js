import fs from "fs";

import { askAI }
  from "./aiClient.js";

import layoutLibrary
  from "./layoutLibrary.js";

const allowedLayouts = [
  "cinematic-3-beat",
  "triple-grid"
];

const inputPath =
  "./storyInput.txt";

function readUserIdea() {

  const cliInput =
    process.argv
      .slice(2)
      .join(" ")
      .trim();

  if (cliInput) {

    return cliInput;
  }

  if (fs.existsSync(inputPath)) {

    return fs
      .readFileSync(
        inputPath,
        "utf-8"
      )
      .trim();
  }

  throw new Error(
    `No story input found. Pass one as an argument or create ${inputPath}.`
  );
}

function extractJson(
  response
) {

  let cleaned =
    response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1
  ) {

    cleaned =
      cleaned.slice(
        firstBrace,
        lastBrace + 1
      );
  }

  return cleaned;
}

function inferPageCount(
  userIdea
) {

  const words =
    userIdea
      .split(/\s+/)
      .filter(Boolean);

  const commaCount =
    (
      userIdea.match(/,/g) ||
      []
    ).length;

  const storyTurnCount =
    (
      userIdea.match(
        /\b(then|after|before|discovers?|finds?|realizes?|confronts?|escapes?|returns?|fights?|reveals?|enters?|leaves?)\b/gi
      ) ||
      []
    ).length;

  const complexity =
    commaCount +
    storyTurnCount;

  if (
    words.length <= 18 &&
    complexity <= 1
  ) {

    return 1;
  }

  if (
    complexity >= 5 ||
    words.length > 70
  ) {

    return 4;
  }

  if (
    complexity >= 3 ||
    words.length > 35
  ) {

    return 3;
  }

  return 2;
}

function validateStoryPlanner(
  planner,
  expectedPageCount
) {

  const errors = [];

  if (!planner.title) {

    errors.push(
      "title is missing"
    );
  }

  if (
    !planner.character_anchor ||
    !planner.character_anchor.name
  ) {

    errors.push(
      "character_anchor.name is missing"
    );
  }

  if (
    !planner.page_visual_theme
  ) {

    errors.push(
      "page_visual_theme is missing"
    );
  }

  if (
    typeof planner.story_arc !== "string" ||
    !planner.story_arc.trim()
  ) {

    errors.push(
      "story_arc is missing"
    );
  }

  if (
    !planner.continuity_anchor ||
    typeof planner.continuity_anchor !== "object" ||
    Array.isArray(planner.continuity_anchor)
  ) {

    errors.push(
      "continuity_anchor is missing"
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

        if (
          typeof planner.continuity_anchor[field] !== "string" ||
          !planner.continuity_anchor[field].trim()
        ) {

          errors.push(
            `continuity_anchor.${field} is missing`
          );
        }
      }
    );
  }

  if (
    !planner.pages ||
    !Array.isArray(planner.pages) ||
    planner.pages.length !== expectedPageCount
  ) {

    errors.push(
      `planner must contain exactly ${expectedPageCount} page${expectedPageCount === 1 ? "" : "s"} for this story`
    );

    return errors;
  }

  const allowedPageRoles = [
    "opening",
    "escalation",
    "reveal",
    "climax",
    "resolution"
  ];

  planner.pages.forEach(
    (
      page,
      pageIndex
    ) => {

      const pageLabel =
        `page ${pageIndex + 1}`;

      if (
        page.page_number !==
        pageIndex + 1
      ) {

        errors.push(
          `${pageLabel}: page_number must be ${pageIndex + 1}`
        );
      }

      if (
        !page.page_role ||
        !allowedPageRoles.includes(
          page.page_role
        )
      ) {

        errors.push(
          `${pageLabel}: page_role must be one of: ${allowedPageRoles.join(", ")}`
        );
      }

      for (
        const field
        of [
          "page_goal",
          "reading_flow",
          "location_state",
          "time_state",
          "continuity_from_previous_page",
          "continuity_to_next_page"
        ]
      ) {

        if (
          typeof page[field] !== "string"
        ) {

          errors.push(
            `${pageLabel}.${field} must be a string`
          );
        }
      }

      if (
        !page.layout ||
        !allowedLayouts.includes(
          page.layout
        )
      ) {

        errors.push(
          `${pageLabel}.layout must be one of: ${allowedLayouts.join(", ")}`
        );
      }

      const layout =
        layoutLibrary[
          page.layout
        ];

      if (
        !page.beats ||
        !Array.isArray(page.beats)
      ) {

        errors.push(
          `${pageLabel} must contain a beats array`
        );

        return;
      }

      if (
        layout &&
        page.beats.length !==
        layout.panels.length
      ) {

        errors.push(
          `${pageLabel}: expected ${layout.panels.length} beats for "${page.layout}", got ${page.beats.length}`
        );
      }

      page.beats.forEach(
        (
          beat,
          beatIndex
        ) => {

          const label =
            `${pageLabel} beat ${beatIndex + 1}`;

          if (
            !beat ||
            typeof beat !== "object" ||
            Array.isArray(beat)
          ) {

            errors.push(
              `${label} must be an object`
            );

            return;
          }

          if (
            typeof beat.beat !== "string" ||
            beat.beat.trim().length < 15
          ) {

            errors.push(
              `${label}.beat must be a concrete drawable story sentence`
            );
          }

          if (
            typeof beat.emotion !== "string" ||
            !beat.emotion.trim()
          ) {

            errors.push(
              `${label}.emotion is missing`
            );
          }

          if (
            typeof beat.importance !== "string" ||
            !beat.importance.trim()
          ) {

            errors.push(
              `${label}.importance is missing`
            );
          }

          for (
            const optionalTextField
            of [
              "caption",
              "dialogue"
            ]
          ) {

            if (
              beat[optionalTextField] !== undefined &&
              typeof beat[optionalTextField] !== "string"
            ) {

              errors.push(
                `${label}.${optionalTextField} must be a string when present`
              );
            }
          }
        }
      );
    }
  );

  return errors;
}

function normalizeStoryPlanner(
  planner
) {

  const pageRoleMap = {
    setup: "opening",
    introduction: "opening",
    tension: "escalation",
    suspense: "escalation",
    buildup: "escalation",
    "build-up": "escalation",
    payoff: "resolution",
    ending: "resolution",
    conclusion: "resolution"
  };

  if (
    planner.pages &&
    Array.isArray(planner.pages)
  ) {

    planner.pages.forEach(
      page => {

        if (
          typeof page.page_role ===
          "string"
        ) {

          const normalizedRole =
            page.page_role
              .trim()
              .toLowerCase();

          page.page_role =
            pageRoleMap[normalizedRole] ||
            normalizedRole;
        }
      }
    );
  }

  return planner;
}

async function generateStoryPlanner() {

  const userIdea =
    readUserIdea();

  const plannerPrompt =
    fs.readFileSync(
      "./plannerPrompt.txt",
      "utf-8"
    );

  const pageCount =
    inferPageCount(
      userIdea
    );

  const finalPrompt =
    `
${plannerPrompt}

PAGE COUNT:
Generate exactly ${pageCount} page${pageCount === 1 ? "" : "s"} for this story.

USER SCENE:
${userIdea}
`;

  const response =
    await askAI(
      finalPrompt
    );

  const cleaned =
    extractJson(
      response
    );

  const planner =
    normalizeStoryPlanner(
      JSON.parse(
        cleaned
      )
    );

  const errors =
    validateStoryPlanner(
      planner,
      pageCount
    );

  if (errors.length > 0) {

    throw new Error(
      `Story planner validation failed:\n- ${errors.join("\n- ")}`
    );
  }

  fs.writeFileSync(
    "./storyPlanner.json",
    JSON.stringify(
      planner,
      null,
      2
    )
  );

  console.log(
    "storyPlanner.json generated!"
  );
}

generateStoryPlanner()
  .catch(
    error => {

      console.error(
        error.message
      );

      process.exitCode = 1;
    }
  );
