import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { getMongoClient } from "@/lib/db/mongodb-client";
import { getAppUrl } from "@/lib/env";
import { sendPasswordResetEmail } from "@/lib/email/resend";

type AuthHandler = {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (context: { headers: Headers }) => Promise<{ user: { id: string; email: string; name?: string; role?: string | null } } | null>;
  };
};

let authInstance: AuthHandler | null = null;

export async function getAuth() {
  if (authInstance) return authInstance;

  const client = await getMongoClient();
  const db = client.db();

  authInstance = betterAuth({
    baseURL: getAppUrl(),
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail(user.email, url);
      },
      resetPasswordTokenExpiresIn: 60 * 60,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "user",
          input: false,
        },
        username: {
          type: "string",
          required: false,
        },
        publicProfile: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
      },
    },
    plugins: [nextCookies()],
  });

  return authInstance;
}
