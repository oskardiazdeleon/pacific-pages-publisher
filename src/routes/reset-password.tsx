import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — sandiego.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  // Supabase delivers the recovery session via the URL fragment. The auth
  // client picks it up automatically and fires PASSWORD_RECOVERY. We listen
  // for that event before allowing the form to submit, so we don't update
  // the password of an already-signed-in user by accident.
  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also handle the case where the user lands here with an existing session
    // (e.g. they clicked the link while still signed in) — accept the flow if
    // the URL hash signals recovery.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Give Supabase a moment to parse the hash; if no recovery event arrives
      // within a short window, surface a helpful error.
      const timer = setTimeout(() => {
        if (!cancelled && !ready) {
          setError(
            "This password reset link is invalid or has expired. Request a new one from the sign-in page.",
          );
        }
      }, 1500);
      return () => {
        cancelled = true;
        clearTimeout(timer);
        sub.subscription.unsubscribe();
      };
    }

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        toast.error(updateError.message);
        return;
      }
      toast.success("Password updated — you're signed in.");
      navigate({ to: "/admin" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container-page py-16 grid place-items-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
          <div className="eyebrow">Reset password</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">Set a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a new password for your sandiego.com account.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
              <p className="font-medium text-destructive">Link expired</p>
              <p className="mt-1 text-muted-foreground">{error}</p>
              <a
                href="/auth"
                className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
              >
                ← Back to sign in
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">New password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!ready}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Confirm new password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={!ready}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={busy || !ready}
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
              >
                {!ready ? "Verifying link…" : busy ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
