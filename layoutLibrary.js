import pageConfig
  from "./pageConfig.js";

// -------------------------------------
// PAGE VALUES
// -------------------------------------

const M =
  pageConfig.margin;

const G =
  pageConfig.gutter;

const W =
  pageConfig.width;

const H =
  pageConfig.height;

// -------------------------------------
// INNER PAGE AREA
// -------------------------------------

const INNER_WIDTH =
  W - (M * 2);

const INNER_HEIGHT =
  H - (M * 2);

// -------------------------------------
// LAYOUT LIBRARY
// -------------------------------------

const layoutLibrary = {

  // ===================================
  // HERO TOP
  // ===================================

    "cinematic-3-beat": {

    description:
        "Large atmospheric opener followed by tension escalation and dramatic reveal.",

    pacing:
        "cinematic-escalation",

    panel_count:
        3,

    panels: [

        // ---------------------------------
        // PANEL 1 — HERO OPENER
        // ---------------------------------

        {
        panel_number: 1,

        shape:
            "wide",

        x:
            M,

        y:
            M,

        width:
            INNER_WIDTH,

        height:
            900
        },

        // ---------------------------------
        // PANEL 2 — TENSION
        // ---------------------------------

        {
        panel_number: 2,

        shape:
            "tall",

        x:
            M,

        y:
            900 + M + G,

        width:
            Math.floor(
            (INNER_WIDTH / 2) - 10
            ),

        height:
            1360
        },

        // ---------------------------------
        // PANEL 3 — REVEAL
        // ---------------------------------

        {
        panel_number: 3,

        shape:
            "tall",

        x:
            M +
            Math.floor(
            INNER_WIDTH / 2
            ) +
            Math.floor(
            G / 2
            ),

        y:
            900 + M + G,

        width:
            Math.floor(
            (INNER_WIDTH / 2) - 10
            ),

        height:
            1360
        }
    ]
    },

  // ===================================
  // TRIPLE GRID
  // ===================================

  "triple-grid": {

    description:
      "Three evenly stacked cinematic panels for balanced dialogue, reaction, and progression.",

    pacing:
      "steady",

    panel_count:
      3,

    panels: [

      {
        panel_number: 1,

        shape:
          "wide",

        x:
          M,

        y:
          M,

        width:
          INNER_WIDTH,

        height:
          Math.floor(
            (INNER_HEIGHT - (G * 2)) / 3
          )
      },

      {
        panel_number: 2,

        shape:
          "wide",

        x:
          M,

        y:
          M +
          Math.floor(
            (INNER_HEIGHT - (G * 2)) / 3
          ) +
          G,

        width:
          INNER_WIDTH,

        height:
          Math.floor(
            (INNER_HEIGHT - (G * 2)) / 3
          )
      },

      {
        panel_number: 3,

        shape:
          "wide",

        x:
          M,

        y:
          M +
          (
            Math.floor(
              (INNER_HEIGHT - (G * 2)) / 3
            ) * 2
          ) +
          (G * 2),

        width:
          INNER_WIDTH,

        height:
          Math.floor(
            (INNER_HEIGHT - (G * 2)) / 3
          )
      }
    ]
  }
};

export default layoutLibrary;
