/**
 * Page Model
 *
 * Each page belongs to a Book (project).
 * Stores panel layout, dialogue, and AI generation metadata.
 */

import mongoose, { Schema, Document, Types } from "mongoose";

export type PageStatus = "generating" | "in-review" | "approved" | "revised";

export interface IDialogue {
  character: string;
  text: string;
  type: "speech" | "thought" | "narration" | "sfx";
}

export interface IPanel {
  panelNumber: number;
  description: string;
  dialogue: IDialogue[];
  cameraAngle: string;
  mood: string;
}

export interface IPage extends Document {
  bookId: Types.ObjectId;
  number: number;
  title: string;
  status: PageStatus;
  panels: IPanel[];
  script: string;
  userInstructions?: string;
  feedback?: string;
  generatedAt: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PanelSchema = new Schema<IPanel>({
  panelNumber: { type: Number, required: true },
  description: { type: String, required: true },
  dialogue: [
    {
      character: { type: String, default: "" },
      text: { type: String, default: "" },
      type: { type: String, enum: ["speech", "thought", "narration", "sfx"], default: "speech" },
    },
  ],
  cameraAngle: { type: String, default: "medium-shot" },
  mood: { type: String, default: "tense" },
});

const PageSchema = new Schema<IPage>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ["generating", "in-review", "approved", "revised"],
      default: "in-review",
    },
    panels: { type: [PanelSchema], default: [] },
    script: { type: String, default: "" },
    userInstructions: { type: String },
    feedback: { type: String },
    generatedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index: one page number per book
PageSchema.index({ bookId: 1, number: 1 }, { unique: true });

export default mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);
