/**
 * MongoDB Connection
 *
 * Singleton connection for Next.js — reuses the connection
 * across hot reloads in dev and multiple requests in production.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  console.warn(
    "MONGODB_URI is missing. Add it to your .env file. Database features will not work."
  );
}

// Cache the connection to avoid reconnecting on every function call
let cached = (globalThis as any).__mongoose;

if (!cached) {
  cached = (globalThis as any).__mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log("MongoDB connected:", mongoose.connection.host);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
