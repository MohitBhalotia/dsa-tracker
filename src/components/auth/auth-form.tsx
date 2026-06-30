"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getAuthSchema(mode: "login" | "signup") {
  return z
    .object({
      name: z.string().optional(),
      email: z.string().email("Enter a valid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: mode === "signup" ? z.string().min(8, "Confirm your password") : z.string().optional(),
    })
    .refine((values) => mode === "login" || values.password === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
}

type AuthValues = {
  name?: string;
  email: string;
  password: string;
  confirmPassword: string | undefined;
};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isLogin = mode === "login";
  const form = useForm<AuthValues>({
    resolver: zodResolver(getAuthSchema(mode)),
    defaultValues: { email: "", password: "", name: "", confirmPassword: "" },
  });
  const passwordValue = useWatch({ control: form.control, name: "password" });
  const confirmPasswordValue = useWatch({ control: form.control, name: "confirmPassword" });

  async function onSubmit(values: AuthValues) {
    setPending(true);
    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          email: values.email,
          password: values.password,
          name: values.name || values.email.split("@")[0],
        });
        if (error) {
          toast.error(error.message || "Could not create account");
          return;
        }
        toast.success("Account created");
      } else {
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
        });
        if (error) {
          toast.error(error.message || "Invalid email or password");
          return;
        }
        toast.success("Signed in");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-[460px] border-stone-200/80 bg-card/95 shadow-2xl shadow-stone-300/30 backdrop-blur dark:border-white/10 dark:shadow-black/30">
      <CardHeader className="space-y-3 px-6 pb-4 pt-7 text-center sm:px-8">
        <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-2 rounded-2xl border bg-muted/40 p-2 text-xs">
          {(isLogin
            ? [["128", "Solved"], ["7", "Due"], ["14d", "Streak"]]
            : [["456", "Questions"], ["Private", "State"], ["1-3-7", "Reviews"]]
          ).map(([value, label]) => (
            <div key={label} className="rounded-xl bg-background px-3 py-2">
              <p className="font-semibold text-foreground">{value}</p>
              <p className="text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <CardTitle className="editorial-heading text-4xl leading-tight">
          {isLogin ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription className="mx-auto max-w-sm text-sm leading-6">
          {isLogin ? "Continue your structured DSA prep." : "Create your private DSA progress workspace."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" className="h-11 rounded-xl" {...form.register("email")} />
            <p className="min-h-4 text-xs text-muted-foreground">
              {form.formState.errors.email ? <span className="text-destructive">{form.formState.errors.email.message}</span> : "Use the email tied to your tracker workspace."}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Password</Label>
              {isLogin ? <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link> : null}
            </div>
            {isLogin ? (
              <PasswordInput id="password" autoComplete="current-password" {...form.register("password")} />
            ) : (
              <Input id="password" type="password" autoComplete="new-password" className="h-11 rounded-xl" {...form.register("password")} />
            )}
            <p className="min-h-4 text-xs text-muted-foreground">
              {form.formState.errors.password ? <span className="text-destructive">{form.formState.errors.password.message}</span> : isLogin ? "Enter your workspace password." : "Use at least 8 characters."}
            </p>
          </div>
          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" className="h-11 rounded-xl" {...form.register("confirmPassword")} />
              <p className="min-h-4 text-xs text-muted-foreground">
                {form.formState.errors.confirmPassword ? (
                  <span className="text-destructive">{form.formState.errors.confirmPassword.message}</span>
                ) : passwordValue && confirmPasswordValue && passwordValue === confirmPasswordValue ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="size-3" /> Passwords match</span>
                ) : (
                  "Repeat the same password to confirm."
                )}
              </p>
            </div>
          ) : null}
          {!isLogin ? (
            <div className="space-y-2">
              <Label htmlFor="name">Display name <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="name" autoComplete="name" className="h-11 rounded-xl" {...form.register("name")} />
            </div>
          ) : null}
          <Button disabled={pending} size="lg" className="h-11 w-full rounded-full">
            {pending ? "Working..." : isLogin ? "Continue to dashboard" : "Create private workspace"}
          </Button>
        </form>
        <div className="mt-5 flex justify-center text-sm text-muted-foreground">
          <Link href={isLogin ? "/signup" : "/login"} className="hover:text-foreground">
            {isLogin ? "New here? Create an account" : "Already have an account? Login instead"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
