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
    "MONGODB_URI is missing. Add it to your environment variables. Database features will not work."
  );
}

// Cache the connection to avoid reconnecting on every function call
let cached = (globalThis as any).__mongoose;

if (!cached) {
  cached = (globalThis as any).__mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set. Please add it in your Vercel project settings.");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      connectTimeoutMS: 10000, // 10 seconds connection timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    // Provide more helpful error message
    if (e.code === "ECONNREFUSED" || e.message?.includes("ECONNREFUSED")) {
      throw new Error(
        "Could not connect to MongoDB. Please check:\n" +
        "1. MONGODB_URI is correctly set in Vercel environment variables\n" +
        "2. Your MongoDB Atlas cluster is running\n" +
        "3. Network access allows connections from anywhere (0.0.0.0/0)\n" +
        "Original error: " + e.message
      );
    }
    throw e;
  }

  return cached.conn;
}
