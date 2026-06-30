import mongoose from "mongoose";
import { env } from "@/lib/env";

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: Cached;
};

const cached = globalForMongoose.mongooseCache ?? { conn: null, promise: null };
globalForMongoose.mongooseCache = cached;

export async function connectToDatabase() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (cached.conn) return cached.conn;

  cached.promise ??= mongoose.connect(env.MONGODB_URI, {
    bufferCommands: false,
  });

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isDatabaseConfigured() {
  return Boolean(env.MONGODB_URI);
}
