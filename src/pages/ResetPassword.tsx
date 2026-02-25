import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getSafeAuthErrorMessage } from "@/lib/errorUtils";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check hash for type=recovery
    if (window.location.hash.includes("type=recovery")) {
      setReady(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Must be at least 8 characters.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "Update failed", description: getSafeAuthErrorMessage(error), variant: "destructive" });
        return;
      }
      toast({ title: "Password updated!" });
      navigate("/auth");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card-cottage p-6">
          <h1 className="text-2xl font-heading font-semibold text-foreground mb-1">Set new password</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your new password below.</p>
          {ready ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Updating…" : "Update password"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Loading… If nothing happens, the reset link may have expired.</p>
          )}
        </div>
      </div>
    </div>
  );
}
