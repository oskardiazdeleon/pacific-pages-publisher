import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ListingForm, type ListingFormValues } from "@/components/admin/ListingForm";
import { enrichExistingListing } from "@/utils/import.functions";

export const Route = createFileRoute("/admin/listings/$id")({
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Partial<ListingFormValues> | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: row } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (!row) {
        setNotFound(true);
        return;
      }
      setData({
        id: row.id,
        name: row.name,
        slug: row.slug,
        category: row.category,
        neighborhood: row.neighborhood,
        short_description: row.short_description ?? "",
        description: row.description ?? "",
        hero_image: row.hero_image ?? "",
        address: row.address ?? "",
        phone: row.phone ?? "",
        website: row.website ?? "",
        email: row.email ?? "",
        price_range: row.price_range ?? "",
        rating: row.rating?.toString() ?? "",
        tier: row.tier,
        status: row.status,
        meta_title: row.meta_title ?? "",
        meta_description: row.meta_description ?? "",
        reservation_url: row.reservation_url ?? "",
        is_sponsored: !!row.is_sponsored,
        sponsor_name: row.sponsor_name ?? "",
        sponsor_rank: row.sponsor_rank?.toString() ?? "0",
        sponsor_until: row.sponsor_until
          ? new Date(row.sponsor_until).toISOString().slice(0, 16)
          : "",
        partner_spotlight: ((row.partner_spotlight ?? {}) as unknown) as ListingFormValues["partner_spotlight"],
        editor_note: row.editor_note ?? "",
        why_we_picked_it: Array.isArray(row.why_we_picked_it) ? row.why_we_picked_it.join(", ") : "",
        insider_tip: row.insider_tip ?? "",
        best_time_to_visit: row.best_time_to_visit ?? "",
        local_context: row.local_context ?? "",
        source_url: row.source_url ?? "",
        verified_visited: !!row.verified_visited,
        faqs: Array.isArray(row.faqs)
          ? (row.faqs as unknown[]).filter(
              (f): f is { q: string; a: string } =>
                !!f && typeof f === "object" && typeof (f as any).q === "string" && typeof (f as any).a === "string",
            )
          : [],
        member_discount_label: (row.member_discount as { label?: string } | null)?.label ?? "",
        member_discount_details: (row.member_discount as { details?: string } | null)?.details ?? "",
      });
    };
    load();
  }, [id, reloadKey]);

  const handleReEnrich = async () => {
    if (!confirm("Re-run AI enrichment from the source URL? This will overwrite editorial fields, description, and meta tags.")) return;
    setEnriching(true);
    try {
      const result = await enrichExistingListing({ data: { listingId: id, publish: false } });
      if (result.blockedReason) {
        toast.warning(`Re-enriched, but quality gate blocked publish: ${result.blockedReason}`);
      } else {
        toast.success(`Re-enriched (originality ${(result.originality_score * 100).toFixed(0)}%)`);
      }
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Re-enrich failed");
    } finally {
      setEnriching(false);
    }
  };

  if (notFound) return <div className="text-muted-foreground">Listing not found.</div>;
  if (!data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Edit</div>
          <h1 className="mt-2 mb-8 font-display text-4xl font-semibold">{data.name}</h1>
        </div>
        {(data.source_url || data.website) && (
          <button
            type="button"
            onClick={handleReEnrich}
            disabled={enriching}
            className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {enriching ? "Re-enriching…" : "Re-enrich with AI"}
          </button>
        )}
      </div>
      <ListingForm initial={data} />
    </div>
  );
}
