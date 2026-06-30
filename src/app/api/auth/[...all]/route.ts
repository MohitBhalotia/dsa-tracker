import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/auth";

async function handler(request: Request) {
  const auth = await getAuth();
  if (!auth) throw new Error("Auth could not be initialized.");
  return auth.handler(request);
}

export const { GET, POST, PUT, PATCH, DELETE } = toNextJsHandler(handler);
