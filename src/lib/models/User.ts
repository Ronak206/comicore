/**
 * User Model
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, default: "Creator" },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
