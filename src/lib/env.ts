import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),
});

export const env = envSchema.parse(process.env);

export function getAppUrl() {
  return env.NEXT_PUBLIC_APP_URL || env.BETTER_AUTH_URL || "http://localhost:3000";
}
