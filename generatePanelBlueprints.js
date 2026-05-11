import fs from "fs";

import layoutLibrary
  from "./layoutLibrary.js";

// -------------------------------------
// LOAD STORY PLANNER
// -------------------------------------

const storyData =
  fs.readFileSync(
    "./storyPlanner.json",
    "utf-8"
  );

const storyPlanner =
  JSON.parse(storyData);

function getPageVisualTheme(
  page
) {

  const theme =
    page.page_visual_theme ||
    storyPlanner.page_visual_theme ||
    {};

  return {

    primary_palette:
      theme.primary_palette ||
      "cinematic muted colors",

    accent_palette:
      theme.accent_palette ||
      "controlled warm highlights",

    lighting_identity:
      theme.lighting_identity ||
      "cinematic motivated lighting",

    environment_style:
      theme.environment_style ||
      "grounded cinematic realism",

    render_style:
      theme.render_style ||
      "graphic novel ink shading"
  };
}

function getCharacterAnchor(
  page
) {

  const character =
    page.character_anchor ||
    storyPlanner.character_anchor ||
    {};

  return {

    name:
      character.name ||
      "Unnamed protagonist",

    age:
      character.age ||
      "adult",

    hair:
      character.hair ||
      "story-appropriate hair",

    face:
      character.face ||
      "distinctive believable features",

    clothing:
      character.clothing ||
      "story-appropriate clothing",

    silhouette:
      character.silhouette ||
      "clear readable silhouette",

    visual_motif:
      character.visual_motif ||
      "consistent visual motif"
  };
}

function getBeatText(
  beat
) {

  const dialogue =
    beat.dialogue?.trim();

  if (dialogue) {

    return {

      text:
        dialogue,

      type:
        "speech"
    };
  }

  const caption =
    (
      beat.caption ||
      beat.narration ||
      ""
    )
      .trim();

  if (caption) {

    return {

      text:
        caption,

      type:
        "narration"
    };
  }

  return {

    text:
      "",

    type:
      ""
  };
}

// -------------------------------------
// PANEL BLUEPRINT OUTPUT
// -------------------------------------

const panelBlueprints = {

  title:
    storyPlanner.title,

  story_arc:
    storyPlanner.story_arc,

  continuity_anchor:
    storyPlanner.continuity_anchor,

  pages: []
};

// -------------------------------------
// LOOP PAGES
// -------------------------------------

for (const page of storyPlanner.pages) {

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
    page.beats.length !==
    layout.panels.length
  ) {

    throw new Error(
      `Page ${page.page_number}: expected ${layout.panels.length} beats for "${page.layout}", got ${page.beats.length}`
    );
  }

  // -----------------------------------
  // PAGE BLUEPRINT
  // -----------------------------------

  const pageBlueprint = {

    page_number:
      page.page_number,

    layout:
      page.layout,

    page_role:
      page.page_role,

    page_intent:
      page.page_goal,

    emotional_progression:
      page.reading_flow,

    location_state:
      page.location_state,

    time_state:
      page.time_state,

    continuity_from_previous_page:
      page.continuity_from_previous_page,

    continuity_to_next_page:
      page.continuity_to_next_page,

    page_visual_theme:
      getPageVisualTheme(
        page
      ),

    character_anchor:
      getCharacterAnchor(
        page
      ),

    panels: []
  };

  // -----------------------------------
  // LOOP STORY BEATS
  // -----------------------------------

  for (
    let i = 0;
    i < page.beats.length;
    i++
  ) {

    const beat =
      page.beats[i];

    const beatText =
      getBeatText(
        beat
      );

    const layoutPanel =
      layout.panels[i];

    // ---------------------------------
    // DEFAULT PANEL TYPE
    // ---------------------------------

    let purpose =
      "emotion";

    let panelShape =
      layoutPanel.shape;

    let cameraShot =
      "medium";

    let emotionLevel =
      "medium";

    let visualDensity =
      "balanced";

    let focusSubject =
      "character";

    let dialogueSafeZone =
      "top-left";

    let readingWeight =
      "medium";

    let environmentVisibility =
      "medium";

    let characterFocus =
      "high";

    let lightingStyle =
      pageBlueprint
        .page_visual_theme
        .lighting_identity;

    let motionLevel =
      "still";

    let transitionType =
      "slow";

    let pageRole =
      "build-up";

    let subjectPosition =
      "center";

    // ---------------------------------
    // PANEL 1 RULES
    // ---------------------------------

    if (i === 0) {

      purpose =
        "establishing";

      cameraShot =
        "extreme-wide";

      emotionLevel =
        "low";

      visualDensity =
        "balanced";

      focusSubject =
        "environment";

      dialogueSafeZone =
        "top-left";

      readingWeight =
        "high";

      environmentVisibility =
        "high";

      characterFocus =
        "medium";

      lightingStyle =
        `establishing ${pageBlueprint.page_visual_theme.lighting_identity}`;

      motionLevel =
        "still";

      transitionType =
        "slow";

      pageRole =
        "opening";

      subjectPosition =
        "right-third";
    }

    // ---------------------------------
    // PANEL 2 RULES
    // ---------------------------------

    if (i === 1) {

      purpose =
        "suspense";

      cameraShot =
        "medium";

      emotionLevel =
        "medium";

      visualDensity =
        "minimal";

      focusSubject =
        "interaction";

      dialogueSafeZone =
        "bottom-right";

      readingWeight =
        "medium";

      environmentVisibility =
        "medium";

      characterFocus =
        "high";

      lightingStyle =
        `heightened ${pageBlueprint.page_visual_theme.lighting_identity}`;

      motionLevel =
        "controlled";

      transitionType =
        "reveal";

      pageRole =
        "build-up";

      subjectPosition =
        "center";
    }

    // ---------------------------------
    // PANEL 3 RULES
    // ---------------------------------

    if (i === 2) {

      purpose =
        "reveal";

      cameraShot =
        "low-angle";

      emotionLevel =
        "high";

      visualDensity =
        "balanced";

      focusSubject =
        "object";

      dialogueSafeZone =
        "bottom-wide";

      readingWeight =
        "high";

      environmentVisibility =
        "high";

      characterFocus =
        "medium";

      lightingStyle =
        `${pageBlueprint.page_visual_theme.accent_palette} accented reveal lighting`;

      motionLevel =
        "still";

      transitionType =
        "reveal";

      pageRole =
        "page-turn-hook";

      subjectPosition =
        "left-third";
    }

    // ---------------------------------
    // CREATE PANEL BLUEPRINT
    // ---------------------------------

    const panelBlueprint = {

      panel_number:
        i + 1,

      purpose,

      panel_shape:
        panelShape,

      camera_shot:
        cameraShot,

      subject_position:
        subjectPosition,

      emotion_level:
        emotionLevel,

      visual_density:
        visualDensity,

      focus_subject:
        focusSubject,

      dialogue_safe_zone:
        dialogueSafeZone,

      reading_weight:
        readingWeight,

      environment_visibility:
        environmentVisibility,

      character_focus:
        characterFocus,

      lighting_style:
        lightingStyle,

      motion_level:
        motionLevel,

      transition_type:
        transitionType,

      page_role:
        pageRole,

      emotion:
        beat.emotion,

      story_beat:
        beat.beat,

      dialogue_text:
        beatText.text,

      dialogue_type:
        beatText.type
    };

    // ---------------------------------
    // PUSH PANEL
    // ---------------------------------

    pageBlueprint.panels.push(
      panelBlueprint
    );
  }

  // -----------------------------------
  // PUSH PAGE
  // -----------------------------------

  panelBlueprints.pages.push(
    pageBlueprint
  );
}

// -------------------------------------
// SAVE FILE
// -------------------------------------

fs.writeFileSync(
  "./panelBlueprints.json",
  JSON.stringify(
    panelBlueprints,
    null,
    2
  )
);

console.log(
  "panelBlueprints.json generated!"
);
