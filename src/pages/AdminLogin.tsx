import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSafeAuthErrorMessage } from "@/lib/errorUtils";
import { ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: session.user.id,
          _role: "admin",
        });
        if (isAdmin) {
          navigate("/admin");
        } else {
          await supabase.auth.signOut();
          toast({ title: "Access denied", description: "You are not authorized as an admin.", variant: "destructive" });
        }
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: data.session.user.id,
          _role: "admin",
        });
        if (isAdmin) navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Invalid input", description: parsed.error.errors[0]?.message, variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) {
        toast({ title: "Sign in failed", description: getSafeAuthErrorMessage(error), variant: "destructive" });
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: signInData.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({ title: "Access denied", description: "This login is for administrators only.", variant: "destructive" });
        return;
      }
      toast({ title: "Welcome, Admin!" });
      navigate("/admin");
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
              <Link to="/" className="underline underline-offset-4">Back to website</Link>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-heading font-semibold text-foreground">Admin Login</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Sign in to access the admin dashboard.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" autoComplete="email" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" className="mt-1.5" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Please wait…" : "Sign in as Admin"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground">
            <Link to="/auth" className="underline underline-offset-4">Guest login →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
