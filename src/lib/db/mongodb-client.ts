import { MongoClient } from "mongodb";
import { env } from "@/lib/env";

let client: MongoClient | null = null;
let promise: Promise<MongoClient> | null = null;

export async function getMongoClient() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (client) return client;
  promise ??= new MongoClient(env.MONGODB_URI).connect();
  client = await promise;
  return client;
}
