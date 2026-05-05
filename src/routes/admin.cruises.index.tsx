import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/cruises/")({
  component: AdminCruises,
});

interface Row {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  hero_image: string | null;
  price_from: string | null;
  seasonality: string | null;
  position: number;
  enabled: boolean;
  updated_at: string;
}

function AdminCruises() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("cruise_lines")
      .select("id, slug, name, tagline, hero_image, price_from, seasonality, position, enabled, updated_at")
      .order("position", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleEnabled = async (row: Row) => {
    const { error } = await supabase
      .from("cruise_lines")
      .update({ enabled: !row.enabled })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`${row.name} ${!row.enabled ? "enabled" : "disabled"}`);
    load();
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete ${row.name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("cruise_lines").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`${row.name} deleted`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Cruise Lines</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the cards on /cruises and the detail pages at /cruises/[slug].
          </p>
        </div>
        <Link
          to="/admin/cruises/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New cruise line
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Position</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No cruise lines yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.price_from}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.position}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleEnabled(r)}
                      className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 font-semibold ${
                        r.enabled ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={`/cruises/${r.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </a>
                      <Link
                        to="/admin/cruises/$id"
                        params={{ id: r.id }}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium hover:bg-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => remove(r)}
                        className="inline-flex items-center gap-1 rounded-full border border-destructive/30 text-destructive px-3 py-1 text-xs font-medium hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
