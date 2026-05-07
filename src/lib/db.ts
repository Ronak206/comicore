/**
 * Comicore Database Layer
 *
 * MongoDB-backed data access. All collections:
 *   - User: user accounts
 *   - Book: comic projects (with embedded chapters + storyBeats + style)
 *   - Character: characters (linked to Book)
 *   - World: world settings (linked to Book)
 *   - Page: comic pages (linked to Book)
 *
 * This module is the ONLY place that touches Mongoose models.
 * Everything else imports from here.
 */

import { connectDB } from "./mongodb";
import Book from "./models/Book";
import Character from "./models/Character";
import World from "./models/World";
import Page from "./models/Page";
import type {
  IBook,
  IChapter,
  IStoryBeat,
  IArtStyle,
  BookStatus,
  ICharacter,
  CharacterRole,
  IWorld,
  IPage,
  IPanel,
  PageStatus,
} from "./models/Book";

// ─── Ensure Connection ──────────────────────────

async function db(): Promise<void> {
  await connectDB();
}

// ─── Types (public) ─────────────────────────────

export type ProjectData = {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  targetAudience: string;
  pageGoal: number;
  characters: ICharacter[];
  world: IWorld;
  style: IArtStyle;
  storyBeats: IStoryBeat[];
  chapters: IChapter[];
  pages: IPage[];
  roughOverview: string;
  status: BookStatus;
  currentPage: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectIndex = {
  id: string;
  title: string;
  genre: string;
  status: string;
  pages: number;
  totalPages: number;
  createdAt: string;
  updatedAt: string;
};

// ─── Helpers: MongoDB → ProjectData ──────────────

async function toProjectData(bookDoc: IBook): Promise<ProjectData> {
  const characters = await Character.find({ bookId: bookDoc._id }).lean();
  const worldDoc = await World.findOne({ bookId: bookDoc._id }).lean();
  const pages = await Page.find({ bookId: bookDoc._id }).sort({ number: 1 }).lean();

  const world = worldDoc
    ? {
        setting: worldDoc.setting,
        timePeriod: worldDoc.timePeriod,
        atmosphere: worldDoc.atmosphere,
        technology: worldDoc.technology,
        keyLocations: worldDoc.keyLocations,
        rules: worldDoc.rules,
      }
    : {
        setting: "",
        timePeriod: "",
        atmosphere: "",
        technology: "",
        keyLocations: "",
        rules: "",
      };

  return {
    id: bookDoc._id.toString(),
    title: bookDoc.title,
    genre: bookDoc.genre,
    synopsis: bookDoc.synopsis,
    tone: bookDoc.tone,
    targetAudience: bookDoc.targetAudience,
    pageGoal: bookDoc.pageGoal,
    characters: characters.map((c) => ({
      ...c,
      id: c._id.toString(),
      bookId: c.bookId.toString(),
    })),
    world,
    style: bookDoc.style,
    storyBeats: bookDoc.storyBeats,
    chapters: bookDoc.chapters,
    pages: pages.map((p) => ({
      ...p,
      id: p._id.toString(),
      bookId: p.bookId.toString(),
    })),
    roughOverview: bookDoc.roughOverview,
    status: bookDoc.status,
    currentPage: bookDoc.currentPage,
    createdAt: bookDoc.createdAt.toISOString(),
    updatedAt: bookDoc.updatedAt.toISOString(),
  };
}

// ─── Book CRUD ──────────────────────────────────

export async function createProject(data: {
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  targetAudience: string;
  pageGoal: number;
}): Promise<ProjectData> {
  await db();

  const book = await Book.create({
    title: data.title.trim(),
    genre: data.genre.trim(),
    synopsis: data.synopsis.trim(),
    tone: data.tone.trim(),
    targetAudience: data.targetAudience,
    pageGoal: data.pageGoal,
  });

  return toProjectData(book);
}

export async function getProject(id: string): Promise<ProjectData | null> {
  await db();

  const book = await Book.findById(id);
  if (!book) return null;

  return toProjectData(book);
}

export async function getAllProjects(): Promise<ProjectIndex[]> {
  await db();

  const books = await Book.find().sort({ updatedAt: -1 });

  const indices: ProjectIndex[] = [];
  for (const book of books) {
    const approvedCount = await Page.countDocuments({
      bookId: book._id,
      status: "approved",
    });
    indices.push({
      id: book._id.toString(),
      title: book.title,
      genre: book.genre,
      status: book.status,
      pages: approvedCount,
      totalPages: book.pageGoal,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
    });
  }

  return indices;
}

export async function updateProject(
  id: string,
  updates: Partial<{
    title: string;
    genre: string;
    synopsis: string;
    tone: string;
    targetAudience: string;
    pageGoal: number;
    status: BookStatus;
    currentPage: number;
    roughOverview: string;
    style: Partial<IArtStyle>;
    chapters: IChapter[];
    storyBeats: IStoryBeat[];
  }>
): Promise<ProjectData | null> {
  await db();

  const updateFields: any = { ...updates };
  // Flatten style into dot notation
  if (updates.style) {
    Object.entries(updates.style).forEach(([key, val]) => {
      updateFields[`style.${key}`] = val;
    });
    delete updateFields.style;
  }

  const book = await Book.findByIdAndUpdate(id, updateFields, { new: true });
  if (!book) return null;

  return toProjectData(book);
}

export async function deleteProject(id: string): Promise<boolean> {
  await db();

  await Character.deleteMany({ bookId: id });
  await World.deleteMany({ bookId: id });
  await Page.deleteMany({ bookId: id });
  const result = await Book.findByIdAndDelete(id);

  return !!result;
}

// ─── Character CRUD ─────────────────────────────

export async function addCharacter(
  projectId: string,
  character: { name: string; role: CharacterRole; description: string; appearance: string; personality: string }
): Promise<ProjectData | null> {
  await db();

  await Character.create({
    bookId: projectId,
    ...character,
    name: character.name.trim(),
  });

  return getProject(projectId);
}

export async function updateCharacter(
  projectId: string,
  charId: string,
  updates: Partial<ICharacter>
): Promise<ProjectData | null> {
  await db();

  await Character.findByIdAndUpdate(charId, updates);
  return getProject(projectId);
}

export async function removeCharacter(
  projectId: string,
  charId: string
): Promise<ProjectData | null> {
  await db();

  await Character.findByIdAndDelete(charId);
  return getProject(projectId);
}

// ─── World CRUD ─────────────────────────────────

export async function upsertWorld(
  projectId: string,
  world: { setting: string; timePeriod: string; atmosphere: string; technology: string; keyLocations: string; rules: string }
): Promise<ProjectData | null> {
  await db();

  await World.findOneAndUpdate(
    { bookId: projectId },
    { bookId: projectId, ...world },
    { upsert: true, new: true }
  );

  return getProject(projectId);
}

// ─── Page CRUD ──────────────────────────────────

export async function addPage(
  projectId: string,
  page: { number: number; title: string; status: PageStatus; panels: IPanel[]; script: string; userInstructions?: string }
): Promise<ProjectData | null> {
  await db();

  // Check if page with this number already exists
  const existing = await Page.findOne({ bookId: projectId, number: page.number });
  if (existing) {
    await Page.findByIdAndUpdate(existing._id, page, { new: true });
  } else {
    await Page.create({
      bookId: projectId,
      ...page,
      generatedAt: new Date(),
    });
  }

  // Update book's currentPage
  await Book.findByIdAndUpdate(projectId, {
    currentPage: page.number,
    status: "reviewing",
  });

  return getProject(projectId);
}

export async function approvePage(
  projectId: string,
  pageId: string
): Promise<ProjectData | null> {
  await db();

  await Page.findByIdAndUpdate(pageId, {
    status: "approved",
    approvedAt: new Date(),
  });

  const book = await Book.findById(projectId);
  if (!book) return null;

  const allApproved = await Page.countDocuments({
    bookId: projectId,
    status: "approved",
  });

  const isComplete = allApproved >= book.pageGoal;

  await Book.findByIdAndUpdate(projectId, {
    status: isComplete ? "complete" : "generating",
  });

  return getProject(projectId);
}

export async function revisePage(
  projectId: string,
  pageId: string,
  feedback: string
): Promise<ProjectData | null> {
  await db();

  await Page.findByIdAndUpdate(pageId, {
    status: "revised",
    feedback,
  });

  return getProject(projectId);
}
