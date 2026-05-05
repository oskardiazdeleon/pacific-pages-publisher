import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — sandiego.com" },
      { name: "description", content: "Sign in to manage your sandiego.com listings and content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    // Don't bounce away while the user is mid-reset flow.
    if (!loading && user && mode !== "forgot") {
      // Only allow internal redirects (must start with /).
      const safeNext = next && next.startsWith("/") ? next : "/admin";
      navigate({ to: safeNext });
    }
  }, [loading, user, navigate, mode, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Signed in");
          navigate({ to: "/admin" });
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created — check your email if confirmation is required.");
          navigate({ to: "/admin" });
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast.error(error.message);
        } else {
          setResetSent(true);
          toast.success("Reset link sent — check your inbox.");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<Mode, { eyebrow: string; heading: string; sub: string; cta: string }> = {
    signin: {
      eyebrow: "Welcome back",
      heading: "Sign in to sandiego.com",
      sub: "Editors, partners and admins.",
      cta: "Sign in",
    },
    signup: {
      eyebrow: "Create account",
      heading: "Join sandiego.com",
      sub: "Create your account to manage listings or write articles.",
      cta: "Create account",
    },
    forgot: {
      eyebrow: "Forgot password",
      heading: "Reset your password",
      sub: "Enter your email and we'll send you a secure link to set a new one.",
      cta: "Send reset link",
    },
  };
  const t = titles[mode];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container-page py-16 grid place-items-center">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
          <div className="eyebrow">{t.eyebrow}</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">{t.heading}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.sub}</p>

          {mode === "forgot" && resetSent ? (
            <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
              <p className="font-medium">Check your inbox</p>
              <p className="mt-1 text-muted-foreground">
                If an account exists for <span className="font-medium text-foreground">{email}</span>,
                you'll get an email with a link to reset your password. The link expires in 1 hour.
              </p>
              <button
                onClick={() => {
                  setResetSent(false);
                  setMode("signin");
                }}
                className="mt-4 text-sm font-medium text-accent hover:underline"
              >
                ← Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Display name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    placeholder="Maya Alvarez"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                  placeholder="you@sandiego.com"
                />
              </div>
              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Password</label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
              >
                {busy ? "Please wait…" : t.cta}
              </button>
            </form>
          )}

          <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            {mode === "forgot" ? (
              <button
                onClick={() => {
                  setResetSent(false);
                  setMode("signin");
                }}
                className="hover:text-foreground"
              >
                ← Back to sign in
              </button>
            ) : (
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="hover:text-foreground"
              >
                {mode === "signin"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
