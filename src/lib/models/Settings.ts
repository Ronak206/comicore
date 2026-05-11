/**
 * Settings Model
 *
 * User preferences for generation, notifications, appearance, etc.
 */

import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGenerationSettings {
  defaultStyle: string;
  quality: string;
  panelLayout: string;
  autoApprove: boolean;
  memoryRetention: string;
  showProgress: boolean;
  smartSuggestions: boolean;
}

export interface INotificationSettings {
  pageReady: boolean;
  exportComplete: boolean;
  memoryWarning: boolean;
  updates: boolean;
  tips: boolean;
  method: "in-app" | "email";
}

export interface IAppearanceSettings {
  theme: "dark" | "light";
  accentColor: string;
  compactSidebar: boolean;
  showThumbnails: boolean;
  reduceAnimations: boolean;
}

export interface ISettings extends Document {
  userId: Types.ObjectId;
  generation: IGenerationSettings;
  notifications: INotificationSettings;
  appearance: IAppearanceSettings;
  createdAt: Date;
  updatedAt: Date;
}

const GenerationSchema = new Schema<IGenerationSettings>({
  defaultStyle: { type: String, default: "noir-cyberpunk" },
  quality: { type: String, default: "high" },
  panelLayout: { type: String, default: "auto" },
  autoApprove: { type: Boolean, default: false },
  memoryRetention: { type: String, default: "full" },
  showProgress: { type: Boolean, default: true },
  smartSuggestions: { type: Boolean, default: true },
});

const NotificationSchema = new Schema<INotificationSettings>({
  pageReady: { type: Boolean, default: true },
  exportComplete: { type: Boolean, default: true },
  memoryWarning: { type: Boolean, default: true },
  updates: { type: Boolean, default: false },
  tips: { type: Boolean, default: false },
  method: { type: String, enum: ["in-app", "email"], default: "in-app" },
});

const AppearanceSchema = new Schema<IAppearanceSettings>({
  theme: { type: String, enum: ["dark", "light"], default: "dark" },
  accentColor: { type: String, default: "#E8B931" },
  compactSidebar: { type: Boolean, default: false },
  showThumbnails: { type: Boolean, default: true },
  reduceAnimations: { type: Boolean, default: false },
});

const SettingsSchema = new Schema<ISettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    generation: { type: GenerationSchema, default: () => ({}) },
    notifications: { type: NotificationSchema, default: () => ({}) },
    appearance: { type: AppearanceSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
