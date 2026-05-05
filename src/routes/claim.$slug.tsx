import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { hubForCategory } from "@/lib/listing-categories";

export const Route = createFileRoute("/claim/$slug")({
  head: () => ({
    meta: [
      { title: "Claim your listing — sandiego.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClaimListingPage,
});

const claimSchema = z.object({
  claimant_name: z.string().trim().min(1, "Required").max(100),
  claimant_email: z.string().trim().email("Enter a valid email").max(255),
  claimant_role: z.enum(["owner", "manager", "marketing", "other"]),
  notes: z.string().trim().max(500).optional(),
});

type Listing = {
  id: string;
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  hero_image: string | null;
  website: string | null;
  partner_id: string | null;
};

function normalizeDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function ClaimListingPage() {
  const { slug } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "manager" | "marketing" | "other">("owner");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { next: `/claim/${slug}` } as never });
    }
  }, [loading, user, slug, navigate]);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, slug, name, category, neighborhood, hero_image, website, partner_id")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (!data) {
        setNotFound(true);
        return;
      }
      setListing(data as Listing);
    })();
  }, [slug]);

  useEffect(() => {
    if (!user || !listing) return;
    (async () => {
      const { data } = await supabase
        .from("listing_claims")
        .select("status")
        .eq("listing_id", listing.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setExistingStatus(data?.status ?? null);
    })();
  }, [user, listing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;
    const parsed = claimSchema.safeParse({
      claimant_name: name,
      claimant_email: email,
      claimant_role: role,
      notes: notes || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    const listingDomain = normalizeDomain(listing.website);
    const emailDomain = parsed.data.claimant_email.split("@")[1]?.toLowerCase() ?? "";
    const email_domain_match = !!listingDomain && listingDomain === emailDomain;

    const { error } = await supabase.from("listing_claims").insert({
      listing_id: listing.id,
      user_id: user.id,
      claimant_name: parsed.data.claimant_name,
      claimant_email: parsed.data.claimant_email,
      claimant_role: parsed.data.claimant_role,
      notes: parsed.data.notes ?? null,
      email_domain_match,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubmitted(true);
  };

  const hub = listing ? hubForCategory(listing.category) : null;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container-page py-20 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container-page py-20">
          <h1 className="font-display text-3xl font-semibold">Listing not found</h1>
          <Link to="/" className="mt-6 inline-flex items-center gap-1 text-accent">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container-page py-20 text-muted-foreground">Loading listing…</div>
      </div>
    );
  }

  const alreadyClaimed = !!listing.partner_id;
  const hasPending = existingStatus === "pending";
  const isApproved = existingStatus === "approved";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container-page max-w-2xl py-12">
        {hub && (
          <Link
            to="/$category/$slug"
            params={{ category: hub.slug, slug: listing.slug }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {listing.name}
          </Link>
        )}

        <div className="eyebrow mt-6 flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Claim listing
        </div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">
          {listing.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {listing.neighborhood} · {listing.category}
        </p>

        {alreadyClaimed && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <p className="font-medium">This listing has already been claimed.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              If you believe this is in error, please contact support.
            </p>
          </div>
        )}

        {!alreadyClaimed && isApproved && (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Your claim was approved
            </div>
            <Link
              to="/partner"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
            >
              Open partner dashboard
            </Link>
          </div>
        )}

        {!alreadyClaimed && hasPending && !submitted && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <p className="font-medium">Your claim is under review.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We typically review claims within 1–2 business days. We'll email you when there's an update.
            </p>
          </div>
        )}

        {submitted && (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
            <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Claim submitted
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks — we'll review your claim within 1–2 business days and email you at{" "}
              <strong className="text-foreground">{email}</strong>.
            </p>
          </div>
        )}

        {!alreadyClaimed && !hasPending && !isApproved && !submitted && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="you@yourbusiness.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Using an email at the same domain as your business website helps us verify you faster.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Your role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="marketing">Marketing / Agency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Anything we should know? (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="Links, ownership info, etc."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit claim"}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              By submitting you confirm you're authorized to represent this business.
            </p>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
