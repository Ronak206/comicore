import fs from "fs";
import { spawn } from "child_process";

const storyInputPath =
  "./storyInput.txt";

const steps = [
  {
    label: "Planning story",
    script: "plan",
    file: "generateStoryPlanner.js"
  },
  {
    label: "Building panel blueprints",
    script: "blueprints",
    file: "generatePanelBlueprints.js"
  },
  {
    label: "Generating comic.json",
    script: "comic",
    file: "generateComicFromBlueprints.js"
  },
  {
    label: "Validating comic structure",
    script: "validate",
    file: "validateComicJson.js"
  },
  {
    label: "Generating panel images",
    script: "images",
    file: "generatePageImages.js"
  },
  {
    label: "Assembling final pages",
    script: "assemble",
    file: "assemblePages.js"
  }
];

function readStoryInput() {

  const inlineStory =
    process.argv
      .slice(2)
      .join(" ")
      .trim();

  if (inlineStory) {

    fs.writeFileSync(
      storyInputPath,
      `${inlineStory}\n`
    );

    return inlineStory;
  }

  if (!fs.existsSync(storyInputPath)) {

    throw new Error(
      `No story input provided. Pass a scene argument or create ${storyInputPath}.`
    );
  }

  const fileStory =
    fs.readFileSync(
      storyInputPath,
      "utf-8"
    )
      .trim();

  if (!fileStory) {

    throw new Error(
      `${storyInputPath} is empty. Add a scene or pass one as an argument.`
    );
  }

  return fileStory;
}

function runNpmScript(
  step
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const command =
        process.platform === "win32"
          ? "cmd.exe"
          : "npm";

      const args =
        process.platform === "win32"
          ? [
              "/d",
              "/s",
              "/c",
              `npm.cmd run ${step.script}`
            ]
          : [
              "run",
              step.script
            ];

      const child =
        spawn(
          command,
          args,
          {
            stdio:
              "inherit"
          }
        );

      child.on(
        "error",
        error => {

          reject(
            error
          );
        }
      );

      child.on(
        "close",
        code => {

          if (code === 0) {

            resolve();

            return;
          }

          reject(
            new Error(
              `${step.file} exited with code ${code}`
            )
          );
        }
      );
    }
  );
}

async function generateComicPage() {

  const story =
    readStoryInput();

  console.log(
    "\nComic generation started.\n"
  );

  console.log(
    `Input: ${story}\n`
  );

  for (
    let index = 0;
    index < steps.length;
    index++
  ) {

    const step =
      steps[index];

    console.log(
      `\n[${index + 1}/${steps.length}] ${step.label}...`
    );

    try {

      await runNpmScript(
        step
      );

    } catch (error) {

      console.error(
        `\nFAILED at [${index + 1}/${steps.length}] ${step.label}`
      );

      console.error(
        `Responsible script: ${step.file}`
      );

      console.error(
        error.message
      );

      process.exitCode = 1;

      return;
    }
  }

  console.log(
    "\nDone."
  );

  console.log(
    "Output:"
  );

  const comic =
    JSON.parse(
      fs.readFileSync(
        "./comic.json",
        "utf-8"
      )
    );

  for (const page of comic.pages) {

    console.log(
      `pages/page-${page.page_number}.jpg`
    );
  }
}

generateComicPage()
  .catch(
    error => {

      console.error(
        error.message
      );

      process.exitCode = 1;
    }
  );
