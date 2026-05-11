/**
 * Export Model
 *
 * Stores compressed PDF/comic export data in MongoDB.
 * Uses Buffer type for binary data storage.
 */

import mongoose, { Schema, Document, Types } from "mongoose";

export type ExportFormat = "pdf" | "cbz" | "images";
export type ExportStatus = "pending" | "completed" | "failed";

export interface IExport extends Document {
  bookId: Types.ObjectId;
  userId?: Types.ObjectId;
  title: string;
  format: ExportFormat;
  status: ExportStatus;
  // Compressed binary data (using zlib)
  compressedData: Buffer;
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  // PDF options
  options: {
    font?: string;
    fontSize?: number;
    includeCover?: boolean;
    includeToc?: boolean;
    includePageNumbers?: boolean;
  };
  // Metadata
  pageCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // Optional TTL for cleanup
}

const ExportSchema = new Schema<IExport>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    format: { type: String, enum: ["pdf", "cbz", "images"], required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    compressedData: { type: Buffer, required: true },
    originalSize: { type: Number, required: true },
    compressedSize: { type: Number, required: true },
    options: {
      font: { type: String, default: "helvetica" },
      fontSize: { type: Number, default: 10 },
      includeCover: { type: Boolean, default: true },
      includeToc: { type: Boolean, default: true },
      includePageNumbers: { type: Boolean, default: true },
    },
    pageCount: { type: Number, default: 0 },
    errorMessage: { type: String },
    expiresAt: { type: Date }, // TTL index can be set for auto-cleanup
  },
  { timestamps: true }
);

// Indexes for fast queries
ExportSchema.index({ bookId: 1, createdAt: -1 });
ExportSchema.index({ userId: 1 });
ExportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.models.Export || mongoose.model<IExport>("Export", ExportSchema);
