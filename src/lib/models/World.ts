/**
 * World Model
 *
 * World settings belong to a Book (project).
 */

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorld extends Document {
  bookId: Types.ObjectId;
  setting: string;
  timePeriod: string;
  atmosphere: string;
  technology: string;
  keyLocations: string;
  rules: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorldSchema = new Schema<IWorld>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    setting: { type: String, default: "" },
    timePeriod: { type: String, default: "" },
    atmosphere: { type: String, default: "" },
    technology: { type: String, default: "" },
    keyLocations: { type: String, default: "" },
    rules: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.World || mongoose.model<IWorld>("World", WorldSchema);
