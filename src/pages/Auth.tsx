import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSafeAuthErrorMessage } from "@/lib/errorUtils";

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const GUEST_REDIRECT = "/dashboard";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(
    () =>
      mode === "login"
        ? "Sign in"
        : mode === "signup"
        ? "Create an account"
        : "Reset password",
    [mode]
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        navigate(GUEST_REDIRECT);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        navigate(GUEST_REDIRECT);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot") {
      const emailParsed = z.string().trim().email("Enter a valid email").safeParse(email);
      if (!emailParsed.success) {
        toast({ title: "Invalid email", description: emailParsed.error.errors[0]?.message, variant: "destructive" });
        return;
      }
      try {
        setSubmitting(true);
        const { error } = await supabase.auth.resetPasswordForEmail(emailParsed.data, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({ title: "Reset failed", description: getSafeAuthErrorMessage(error), variant: "destructive" });
          return;
        }
        toast({ title: "Check your email", description: "We've sent you a password reset link." });
        setMode("login");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const parsed = authSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Invalid credentials", description: parsed.error.errors[0]?.message ?? "Please check your input.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      if (mode === "login") {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) {
          toast({ title: "Sign in failed", description: getSafeAuthErrorMessage(error), variant: "destructive" });
          return;
        }
        toast({ title: "Signed in" });
        navigate(GUEST_REDIRECT);
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) {
          toast({ title: "Sign up failed", description: getSafeAuthErrorMessage(error), variant: "destructive" });
          return;
        }
        toast({ title: "Account created! Signing you in…" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-cottage p-6">
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              <Link to="/" className="underline underline-offset-4">
                Back to website
              </Link>
            </p>
            <h1 className="text-2xl font-heading font-semibold text-foreground mt-2">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "forgot"
                ? "Enter your email and we'll send you a reset link."
                : "Sign in to your account or create a new one."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                className="mt-1.5"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="mt-1.5"
                />
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting
                ? "Please wait…"
                : mode === "login"
                ? "Sign in"
                : mode === "signup"
                ? "Sign up"
                : "Send reset link"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground space-y-2">
            {mode === "login" && (
              <>
                <button type="button" className="underline underline-offset-4 block" onClick={() => setMode("signup")}>
                  Need an account? Sign up
                </button>
                <button type="button" className="underline underline-offset-4 block" onClick={() => setMode("forgot")}>
                  Forgot password?
                </button>
              </>
            )}
            {mode === "signup" && (
              <button type="button" className="underline underline-offset-4" onClick={() => setMode("login")}>
                Already have an account? Sign in
              </button>
            )}
            {mode === "forgot" && (
              <button type="button" className="underline underline-offset-4" onClick={() => setMode("login")}>
                Back to sign in
              </button>
            )}
            <div className="pt-2 border-t border-border/50 mt-2">
              <Link to="/admin-login" className="underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                Admin login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
