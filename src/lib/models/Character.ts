/**
 * Character Model
 *
 * Each character belongs to a Book (project).
 */

import mongoose, { Schema, Document, Types } from "mongoose";

export type CharacterRole = "Protagonist" | "Antagonist" | "Deuteragonist" | "Supporting" | "Minor";

export interface ICharacter extends Document {
  bookId: Types.ObjectId;
  name: string;
  role: CharacterRole;
  description: string;
  appearance: string;
  personality: string;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema = new Schema<ICharacter>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["Protagonist", "Antagonist", "Deuteragonist", "Supporting", "Minor"],
      default: "Supporting",
    },
    description: { type: String, default: "" },
    appearance: { type: String, default: "" },
    personality: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Character || mongoose.model<ICharacter>("Character", CharacterSchema);
