import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CruiseLineForm, type CruiseLineFormValues } from "@/components/admin/CruiseLineForm";

export const Route = createFileRoute("/admin/cruises/$id")({
  component: EditCruiseLine,
});

function EditCruiseLine() {
  const { id } = Route.useParams();
  const [initial, setInitial] = useState<CruiseLineFormValues | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("cruise_lines").select("*").eq("id", id).maybeSingle();
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data) return;
      setInitial({
        id: data.id,
        slug: data.slug,
        name: data.name,
        tagline: data.tagline ?? "",
        hero_image: data.hero_image ?? "",
        logo_letter: data.logo_letter ?? "",
        booking_url: data.booking_url ?? "",
        home_port: data.home_port ?? "",
        ships_from_sd: data.ships_from_sd ?? [],
        typical_itineraries: data.typical_itineraries ?? [],
        best_for: data.best_for ?? "",
        seasonality: data.seasonality ?? "",
        price_from: data.price_from ?? "",
        description: data.description ?? "",
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        meta_title: data.meta_title ?? "",
        meta_description: data.meta_description ?? "",
        position: data.position ?? 0,
        enabled: data.enabled,
      });
    })();
  }, [id]);

  return (
    <div>
      <Link
        to="/admin/cruises"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cruise lines
      </Link>
      <h1 className="font-display text-3xl font-semibold mb-6">Edit cruise line</h1>
      {initial ? <CruiseLineForm initial={initial} /> : <p className="text-sm text-muted-foreground">Loading…</p>}
    </div>
  );
}
