"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit(values: z.infer<typeof schema>) {
    setPending(true);
    try {
      await authClient.requestPasswordReset({ email: values.email, redirectTo: "/login" });
      setSentTo(values.email);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-[460px] border-stone-200/80 bg-card/95 shadow-2xl shadow-stone-300/30 backdrop-blur dark:border-white/10 dark:shadow-black/30">
      <CardHeader className="space-y-3 px-6 pb-4 pt-7 text-center sm:px-8">
        <CardTitle className="editorial-heading text-4xl leading-tight">Reset password</CardTitle>
        <CardDescription className="mx-auto max-w-sm text-sm leading-6">
          Enter the email tied to your tracker account. Reset links remain valid for 60 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8">
        {sentTo ? (
          <div className="mb-5 rounded-2xl border bg-muted/40 p-4 text-sm">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" />
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="mt-1 text-muted-foreground">We sent a reset link to {sentTo}. You can request another link after a short wait if it does not arrive.</p>
              </div>
            </div>
          </div>
        ) : null}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" className="h-11 rounded-xl" {...form.register("email")} />
            <p className="min-h-4 text-xs text-muted-foreground">
              {form.formState.errors.email ? <span className="text-destructive">{form.formState.errors.email.message}</span> : "Use the email you used when creating your DSA Tracker account."}
            </p>
          </div>
          <Button disabled={pending} size="lg" className="h-11 w-full rounded-full">{pending ? "Sending reset link..." : sentTo ? "Send another reset link" : "Send reset link"}</Button>
        </form>
        <div className="mt-5 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">Back to login</Link>
        </div>
      </CardContent>
    </Card>
  );
}
