/**
 * Book (Project) Model
 *
 * Core project entity. Chapters and storyBeats are embedded
 * since they're static once generated and tightly coupled to the book.
 */

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  pageRange: string;
  pageCount: number;
}

export interface IStoryBeat {
  num: string;
  title: string;
  description: string;
  pageRange: string;
}

export interface IPageIndexItem {
  pageNumber: number;
  title: string;
  description: string;
  chapter: string;
  keyEvents: string[];
}

export interface IArtStyle {
  artStyle: string;
  colorPalette: string;
  panelDensity: string;
  speechBubbleStyle: string;
  narrationStyle: string;
  detailLevel: string;
  referenceNotes: string;
}

export type BookStatus = "setup" | "overview" | "index-ready" | "chapters" | "generating" | "reviewing" | "complete";

export interface IBook extends Document {
  userId?: Types.ObjectId;
  title: string;
  genre: string;
  synopsis: string;
  tone: string;
  targetAudience: string;
  pageGoal: number;
  status: BookStatus;
  currentPage: number;
  roughOverview: string;
  style: IArtStyle;
  chapters: IChapter[];
  storyBeats: IStoryBeat[];
  pageIndex: IPageIndexItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>({
  id: { type: String, required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  pageRange: { type: String, required: true },
  pageCount: { type: Number, required: true },
});

const StoryBeatSchema = new Schema<IStoryBeat>({
  num: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  pageRange: { type: String, required: true },
});

const PageIndexItemSchema = new Schema<IPageIndexItem>({
  pageNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  chapter: { type: String, default: "Main" },
  keyEvents: { type: [String], default: [] },
});

const ArtStyleSchema = new Schema<IArtStyle>({
  artStyle: { type: String, default: "noir-cyberpunk" },
  colorPalette: { type: String, default: "dominated-dark" },
  panelDensity: { type: String, default: "medium" },
  speechBubbleStyle: { type: String, default: "standard" },
  narrationStyle: { type: String, default: "present" },
  detailLevel: { type: String, default: "high" },
  referenceNotes: { type: String, default: "" },
});

const BookSchema = new Schema<IBook>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    genre: { type: String, required: true, default: "Sci-Fi" },
    synopsis: { type: String, required: true },
    tone: { type: String, default: "Dark, dramatic" },
    targetAudience: { type: String, default: "Young Adult / Adult" },
    pageGoal: { type: Number, required: true, default: 24 },
    status: {
      type: String,
      enum: ["setup", "overview", "index-ready", "chapters", "generating", "reviewing", "complete"],
      default: "setup",
    },
    currentPage: { type: Number, default: 0 },
    roughOverview: { type: String, default: "" },
    style: { type: ArtStyleSchema, default: () => ({}) },
    chapters: { type: [ChapterSchema], default: [] },
    storyBeats: { type: [StoryBeatSchema], default: [] },
    pageIndex: { type: [PageIndexItemSchema], default: [] },
  },
  { timestamps: true }
);

// Index for fast queries
BookSchema.index({ updatedAt: -1 });
BookSchema.index({ userId: 1 });

export default mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);
