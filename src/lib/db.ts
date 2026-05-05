/**
 * Comicore File-Based Database
 *
 * Uses JSON files stored in /data/ directory as a simple database.
 * Each project gets its own JSON file. An index file tracks all projects.
 *
 * Structure:
 *   /data/
 *     index.json          — list of all project IDs + metadata
 *     {projectId}.json    — full project data (characters, world, pages, chapters)
 */

import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────

export interface Character {
  id: string;
  name: string;
  role: "Protagonist" | "Antagonist" | "Deuteragonist" | "Supporting" | "Minor";
  description: string;
  appearance: string;
  personality: string;
}

export interface WorldSetting {
  setting: string;
  timePeriod: string;
  atmosphere: string;
  technology: string;
  keyLocations: string;
  rules: string;
}

export interface ArtStyle {
  artStyle: string;
  colorPalette: string;
  panelDensity: string;
  speechBubbleStyle: string;
  narrationStyle: string;
  detailLevel: string;
  referenceNotes: string;
}

export interface StoryBeat {
  num: string;
  title: string;
  description: string;
  pageRange: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  pageRange: string;
  pageCount: number;
  pages: string[]; // page IDs
}

export interface Panel {
  panelNumber: number;
  description: string;
  dialogue: Array<{
    character: string;
    text: string;
    type: "speech" | "thought" | "narration" | "sfx";
  }>;
  cameraAngle: string;
  mood: string;
  imageUrl?: string;
}

export interface ComicPage {
  id: string;
  number: number;
  title: string;
  status: "generating" | "in-review" | "approved" | "revised";
  panels: Panel[];
  script: string;
  userInstructions?: string;
  feedback?: string;
  generatedAt: string;
  approvedAt?: string;
}

export interface ProjectData {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  targetAudience: string;
  pageGoal: number;
  characters: Character[];
  world: WorldSetting;
  style: ArtStyle;
  storyBeats: StoryBeat[];
  chapters: Chapter[];
  pages: ComicPage[];
  roughOverview: string;
  status: "setup" | "overview" | "chapters" | "generating" | "reviewing" | "complete";
  currentPage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectIndex {
  id: string;
  title: string;
  genre: string;
  status: string;
  pages: number;
  totalPages: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Data Directory ──────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ─── Index Operations ────────────────────────────

function getIndex(): ProjectIndex[] {
  ensureDataDir();
  const indexPath = path.join(DATA_DIR, "index.json");
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, "[]", "utf-8");
    return [];
  }
  const raw = fs.readFileSync(indexPath, "utf-8");
  return JSON.parse(raw) as ProjectIndex[];
}

function writeIndex(index: ProjectIndex[]): void {
  ensureDataDir();
  const indexPath = path.join(DATA_DIR, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
}

// ─── Project CRUD ────────────────────────────────

export function createProject(data: {
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  targetAudience: string;
  pageGoal: number;
}): ProjectData {
  ensureDataDir();
  const id = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const project: ProjectData = {
    id,
    title: data.title.trim(),
    genre: data.genre.trim(),
    synopsis: data.synopsis.trim(),
    tone: data.tone.trim(),
    targetAudience: data.targetAudience,
    pageGoal: data.pageGoal,
    characters: [],
    world: {
      setting: "",
      timePeriod: "",
      atmosphere: "",
      technology: "",
      keyLocations: "",
      rules: "",
    },
    style: {
      artStyle: "noir-cyberpunk",
      colorPalette: "dominated-dark",
      panelDensity: "medium",
      speechBubbleStyle: "standard",
      narrationStyle: "present",
      detailLevel: "high",
      referenceNotes: "",
    },
    storyBeats: [],
    chapters: [],
    pages: [],
    roughOverview: "",
    status: "setup",
    currentPage: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Write project file
  const projectPath = path.join(DATA_DIR, `${id}.json`);
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2), "utf-8");

  // Update index
  const index = getIndex();
  index.push({
    id: project.id,
    title: project.title,
    genre: project.genre,
    status: project.status,
    pages: 0,
    totalPages: project.pageGoal,
    createdAt: now,
    updatedAt: now,
  });
  writeIndex(index);

  return project;
}

export function getProject(id: string): ProjectData | null {
  ensureDataDir();
  const projectPath = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(projectPath)) return null;
  const raw = fs.readFileSync(projectPath, "utf-8");
  return JSON.parse(raw) as ProjectData;
}

export function updateProject(id: string, updates: Partial<ProjectData>): ProjectData | null {
  const project = getProject(id);
  if (!project) return null;

  const updated = { ...project, ...updates, updatedAt: new Date().toISOString() };
  const projectPath = path.join(DATA_DIR, `${id}.json`);
  fs.writeFileSync(projectPath, JSON.stringify(updated, null, 2), "utf-8");

  // Update index
  const index = getIndex();
  const idx = index.findIndex((p) => p.id === id);
  if (idx !== -1) {
    index[idx] = {
      id: updated.id,
      title: updated.title,
      genre: updated.genre,
      status: updated.status,
      pages: updated.pages.filter((p) => p.status === "approved").length,
      totalPages: updated.pageGoal,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
    writeIndex(index);
  }

  return updated;
}

export function deleteProject(id: string): boolean {
  ensureDataDir();
  const projectPath = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(projectPath)) return false;

  fs.unlinkSync(projectPath);

  const index = getIndex().filter((p) => p.id !== id);
  writeIndex(index);

  return true;
}

export function getAllProjects(): ProjectIndex[] {
  return getIndex().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function addCharacter(projectId: string, character: Omit<Character, "id">): ProjectData | null {
  const project = getProject(projectId);
  if (!project) return null;

  const newChar: Character = {
    ...character,
    id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };

  project.characters.push(newChar);
  return updateProject(projectId, { characters: project.characters });
}

export function updateCharacter(projectId: string, charId: string, updates: Partial<Character>): ProjectData | null {
  const project = getProject(projectId);
  if (!project) return null;

  project.characters = project.characters.map((c) =>
    c.id === charId ? { ...c, ...updates } : c
  );
  return updateProject(projectId, { characters: project.characters });
}

export function removeCharacter(projectId: string, charId: string): ProjectData | null {
  const project = getProject(projectId);
  if (!project) return null;

  project.characters = project.characters.filter((c) => c.id !== charId);
  return updateProject(projectId, { characters: project.characters });
}

export function addPage(projectId: string, page: Omit<ComicPage, "id">): ProjectData | null {
  const project = getProject(projectId);
  if (!project) return null;

  const newPage: ComicPage = {
    ...page,
    id: `page_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };

  project.pages.push(newPage);
  project.currentPage = project.pages.length;
  return updateProject(projectId, {
    pages: project.pages,
    currentPage: project.currentPage,
    status: "reviewing",
  });
}

export function approvePage(projectId: string, pageId: string): ProjectData | null {
  const project = getProject(projectId);
  if (!project) return null;

  const approvedPages = project.pages.filter((p) => p.status === "approved").length;

  project.pages = project.pages.map((p) =>
    p.id === pageId
      ? { ...p, status: "approved" as const, approvedAt: new Date().toISOString() }
      : p
  );

  const allApproved = project.pages.filter((p) => p.status === "approved").length;
  const isComplete = allApproved >= project.pageGoal;

  return updateProject(projectId, {
    pages: project.pages,
    status: isComplete ? "complete" : "generating",
  });
}

export function revisePage(projectId: string, pageId: string, feedback: string): ProjectData | null {
  const project = getProject(projectId);
  if (!project) return null;

  project.pages = project.pages.map((p) =>
    p.id === pageId ? { ...p, status: "revised" as const, feedback } : p
  );

  return updateProject(projectId, { pages: project.pages });
}
