import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type ClaimState = "none" | "pending" | "approved" | "rejected";

export function ClaimListingCard({
  listingId,
  listingSlug,
  listingName,
  hasPartner,
}: {
  listingId: string;
  listingSlug: string;
  listingName: string;
  hasPartner: boolean;
}) {
  const { user } = useAuth();
  const [state, setState] = useState<ClaimState>("none");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("listing_claims")
        .select("status")
        .eq("listing_id", listingId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data?.status === "pending") setState("pending");
      else if (data?.status === "approved") setState("approved");
      else if (data?.status === "rejected") setState("rejected");
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, listingId]);

  // If the listing is already partner-claimed, hide the CTA entirely.
  if (hasPartner) return null;
  if (!loaded) return null;

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
        <ShieldCheck className="h-3 w-3" />
        Own this business?
      </div>
      <p className="mt-3 text-sm font-medium">
        Claim {listingName} to manage your listing, add a Partner Spotlight, and access analytics.
      </p>

      {state === "pending" ? (
        <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" /> Claim under review
        </div>
      ) : state === "approved" ? (
        <Link
          to="/partner"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <CheckCircle2 className="h-4 w-4" /> Approved — open dashboard
        </Link>
      ) : (
        <Link
          to="/claim/$slug"
          params={{ slug: listingSlug }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          Claim this listing
        </Link>
      )}
      {state === "rejected" && (
        <p className="mt-2 text-[11px] text-muted-foreground text-center">
          Previous claim was rejected. You may submit again with new information.
        </p>
      )}
    </div>
  );
}
