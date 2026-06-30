import { Resend } from "resend";
import { env } from "@/lib/env";

let resend: Resend | null = null;

export function getResend() {
  if (!env.RESEND_API_KEY) return null;
  resend ??= new Resend(env.RESEND_API_KEY);
  return resend;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const client = getResend();
  const from = env.RESEND_FROM_EMAIL || "DSA Tracker <onboarding@resend.dev>";

  if (!client) {
    console.info(`[email:dev] Password reset for ${to}: ${resetUrl}`);
    return;
  }

  await client.emails.send({
    from,
    to,
    subject: "Reset your DSA Tracker password",
    html: `<p>Use this secure link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    text: `Use this secure link to reset your password: ${resetUrl}`,
  });
}
