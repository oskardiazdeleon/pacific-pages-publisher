import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ListingForm, type ListingFormValues } from "@/components/admin/ListingForm";

export const Route = createFileRoute("/admin/listings/$id")({
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Partial<ListingFormValues> | null>(null);
  const [notFound, setNotFound] = useState(false);

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
        is_sponsored: !!row.is_sponsored,
        sponsor_name: row.sponsor_name ?? "",
        sponsor_rank: row.sponsor_rank?.toString() ?? "0",
        sponsor_until: row.sponsor_until
          ? new Date(row.sponsor_until).toISOString().slice(0, 16)
          : "",
      });
    };
    load();
  }, [id]);

  if (notFound) return <div className="text-muted-foreground">Listing not found.</div>;
  if (!data) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div>
      <div className="eyebrow">Edit</div>
      <h1 className="mt-2 mb-8 font-display text-4xl font-semibold">{data.name}</h1>
      <ListingForm initial={data} />
    </div>
  );
}
