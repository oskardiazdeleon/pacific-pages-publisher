import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { importFromUrl, bulkImportSection } from "@/utils/import.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/import")({
  component: ImportPage,
});

function ImportPage() {
  return (
    <div className="max-w-3xl">
      <div className="eyebrow">Tools</div>
      <h1 className="mt-2 mb-2 font-display text-4xl font-semibold">Import from sandiego.com</h1>
      <p className="text-muted-foreground mb-8">
        Paste a page URL to scrape it, or crawl a section to bulk-import.
      </p>

      <SingleImport />
      <BulkImport />
    </div>
  );
}

async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  // Server fns automatically include cookies; we attach Bearer via fetch override
  const orig = window.fetch;
  window.fetch = (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    return orig(input, { ...init, headers });
  };
  try {
    return await fn();
  } finally {
    window.fetch = orig;
  }
}

function SingleImport() {
  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<"auto" | "listing" | "article">("auto");
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const importFn = useServerFn(importFromUrl);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const out = await withAuth(() => importFn({ data: { url, kind, publish } }));
      toast.success(`Imported as ${out.kind}: /${out.kind === "listing" ? "listings" : "articles"}/${out.slug}`);
      setUrl("");
    } catch (e: any) {
      toast.error(e?.message ?? "Import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4 mb-8">
      <h2 className="font-display text-lg font-semibold">Single URL</h2>
      <input
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="https://www.sandiego.com/hotels/hotel-del-coronado"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs">
          <span className="text-muted-foreground">Type</span>
          <select className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={kind} onChange={(e) => setKind(e.target.value as any)}>
            <option value="auto">Auto-detect</option>
            <option value="listing">Listing</option>
            <option value="article">Article</option>
          </select>
        </label>
        <label className="text-xs flex items-end gap-2 pb-2">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          <span>Publish immediately</span>
        </label>
      </div>
      <button type="submit" disabled={busy}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {busy ? "Importing…" : "Scrape & import"}
      </button>
    </form>
  );
}

function BulkImport() {
  const [sectionUrl, setSectionUrl] = useState("https://www.sandiego.com/hotels");
  const [kind, setKind] = useState<"listing" | "article">("listing");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Array<{ url: string; ok: boolean; slug?: string; error?: string }>>([]);
  const bulkFn = useServerFn(bulkImportSection);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResults([]);
    try {
      const out = await withAuth(() => bulkFn({ data: { sectionUrl, kind, search: search || undefined, limit, publish } }));
      setResults(out.results);
      const ok = out.results.filter((r) => r.ok).length;
      toast.success(`Imported ${ok}/${out.attempted}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Bulk import failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <h2 className="font-display text-lg font-semibold">Bulk crawl section</h2>
      <input
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="https://www.sandiego.com/hotels"
        value={sectionUrl}
        onChange={(e) => setSectionUrl(e.target.value)}
        required
      />
      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs">
          <span className="text-muted-foreground">Type</span>
          <select className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={kind} onChange={(e) => setKind(e.target.value as any)}>
            <option value="listing">Listings</option>
            <option value="article">Articles</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="text-muted-foreground">Filter (optional)</span>
          <input className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="hotel" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <label className="text-xs">
          <span className="text-muted-foreground">Max pages (1–50)</span>
          <input type="number" min={1} max={50}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={limit} onChange={(e) => setLimit(parseInt(e.target.value || "10"))} />
        </label>
      </div>
      <label className="text-xs flex items-center gap-2">
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        <span>Publish immediately</span>
      </label>
      <button type="submit" disabled={busy}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {busy ? "Crawling…" : "Crawl & import"}
      </button>

      {results.length > 0 && (
        <div className="mt-4 space-y-1 text-xs max-h-80 overflow-auto rounded-lg border border-border bg-background p-3">
          {results.map((r) => (
            <div key={r.url} className={r.ok ? "text-foreground" : "text-destructive"}>
              {r.ok ? "✓" : "✗"} {r.url} {r.slug && <span className="text-muted-foreground">→ {r.slug}</span>}
              {r.error && <span className="ml-2">— {r.error}</span>}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
