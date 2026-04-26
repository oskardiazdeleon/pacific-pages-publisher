import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  importFromUrl,
  enqueueBulkImport,
  enqueueCuratedImport,
  processImportBatch,
  retryFailedItems,
  cancelImportJob,
  deleteImportJob,
} from "@/utils/import.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/import")({
  component: ImportPage,
});

type Job = {
  id: string;
  section_url: string;
  kind: string;
  status: string;
  total: number;
  done_count: number;
  failed_count: number;
  publish: boolean;
  created_at: string;
};

type Item = {
  id: string;
  url: string;
  status: string;
  attempts: number;
  last_error: string | null;
  result_slug: string | null;
};

function ImportPage() {
  return (
    <div className="max-w-4xl">
      <div className="eyebrow">Tools</div>
      <h1 className="mt-2 mb-2 font-display text-4xl font-semibold">Import content</h1>
      <p className="text-muted-foreground mb-8">
        Pull listings from a curated "best of" search, a single page (Yelp, OpenTable,
        TripAdvisor, the venue's own site), or a queued bulk crawl of a category index.
      </p>

      <CuratedImport />
      <SingleImport />
      <BulkEnqueue />
      <JobsList />
    </div>
  );
}

async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  const orig = window.fetch;
  window.fetch = (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    return orig(input, { ...init, headers });
  };
  try { return await fn(); } finally { window.fetch = orig; }
}

function CuratedImport() {
  const PRESETS: Array<{ label: string; query: string; category: string; limit: number }> = [
    { label: "Top 50 Restaurants", query: "best restaurants in San Diego", category: "Restaurant", limit: 50 },
    { label: "Top 25 Hotels", query: "best hotels in San Diego", category: "Hotel", limit: 25 },
    { label: "Top 30 Things to Do", query: "best things to do in San Diego attractions", category: "Attraction", limit: 30 },
    { label: "Top 20 Bars & Nightlife", query: "best bars and nightlife in San Diego", category: "Nightlife", limit: 20 },
    { label: "Top 20 Shopping Spots", query: "best shopping in San Diego boutiques", category: "Shopping", limit: 20 },
  ];
  const [query, setQuery] = useState(PRESETS[0].query);
  const [category, setCategory] = useState(PRESETS[0].category);
  const [limit, setLimit] = useState(PRESETS[0].limit);
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const enqueue = useServerFn(enqueueCuratedImport);

  const applyPreset = (p: typeof PRESETS[number]) => {
    setQuery(p.query);
    setCategory(p.category);
    setLimit(p.limit);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const out = await withAuth(() => enqueue({ data: { query, category: category as any, limit, publish } })) as { jobId: string; total: number };
      toast.success(`Found ${out.total} candidates. Press "Run batch" or "Auto-run" below to import.`);
      window.dispatchEvent(new CustomEvent("import-jobs-refresh"));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to queue curated list");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4 mb-8">
      <div>
        <h2 className="font-display text-lg font-semibold">Curated list import</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Searches the web for a "best of" list, extracts the business names, then enriches each
          one (description, neighborhood, phone, website, hero image) and creates a listing.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className="text-xs rounded-full border border-border px-3 py-1.5 hover:bg-muted"
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="block text-xs">
        <span className="text-muted-foreground">Search query</span>
        <input
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="best restaurants in San Diego"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs">
          <span className="text-muted-foreground">Category</span>
          <select
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Restaurant</option>
            <option>Hotel</option>
            <option>Attraction</option>
            <option>Tour</option>
            <option>Shopping</option>
            <option>Nightlife</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="text-muted-foreground">Max results (1–100)</span>
          <input
            type="number" min={1} max={100}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value || "25"))}
          />
        </label>
        <label className="text-xs flex items-end gap-2 pb-2">
          <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
          <span>Publish immediately</span>
        </label>
      </div>

      <button type="submit" disabled={busy}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {busy ? "Searching…" : "Find & queue list"}
      </button>
    </form>
  );
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
      const out = await withAuth(() => importFn({ data: { url, kind, publish } })) as { kind: string; slug: string };
      toast.success(`Imported as ${out.kind}: /${out.kind === "listing" ? "listings" : "articles"}/${out.slug}`);
      setUrl("");
    } catch (e: any) {
      toast.error(e?.message ?? "Import failed");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4 mb-8">
      <h2 className="font-display text-lg font-semibold">Single URL</h2>
      <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="https://www.sandiego.com/hotels/hotel-del-coronado"
        value={url} onChange={(e) => setUrl(e.target.value)} required />
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

function BulkEnqueue() {
  const [sectionUrl, setSectionUrl] = useState("https://www.sandiego.com/hotels");
  const [kind, setKind] = useState<"listing" | "article">("listing");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const [publish, setPublish] = useState(true);
  const [busy, setBusy] = useState(false);
  const enqueue = useServerFn(enqueueBulkImport);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const out = await withAuth(() => enqueue({ data: { sectionUrl, kind, search: search || undefined, limit, publish } })) as { jobId: string; total: number };
      toast.success(`Queued ${out.total} pages. Press “Run batch” below to start.`);
      window.dispatchEvent(new CustomEvent("import-jobs-refresh"));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to queue");
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4 mb-8">
      <h2 className="font-display text-lg font-semibold">Queue bulk crawl</h2>
      <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="https://www.sandiego.com/hotels"
        value={sectionUrl} onChange={(e) => setSectionUrl(e.target.value)} required />
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
          <span className="text-muted-foreground">Max pages (1–200)</span>
          <input type="number" min={1} max={200}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={limit} onChange={(e) => setLimit(parseInt(e.target.value || "25"))} />
        </label>
      </div>
      <label className="text-xs flex items-center gap-2">
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        <span>Publish immediately</span>
      </label>
      <button type="submit" disabled={busy}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {busy ? "Queuing…" : "Map & queue"}
      </button>
    </form>
  );
}

function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("import_jobs").select("*").order("created_at", { ascending: false }).limit(20);
    if (error) { toast.error(error.message); return; }
    setJobs((data as Job[]) ?? []);
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("import-jobs-refresh", onRefresh);
    const interval = setInterval(load, 4000);
    return () => {
      window.removeEventListener("import-jobs-refresh", onRefresh);
      clearInterval(interval);
    };
  }, [load]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold mb-4">Jobs</h2>
      {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs yet.</p>}
      <div className="space-y-2">
        {jobs.map((j) => (
          <JobRow key={j.id} job={j} open={openId === j.id} onToggle={() => setOpenId(openId === j.id ? null : j.id)} onChange={load} />
        ))}
      </div>
    </div>
  );
}

function JobRow({ job, open, onToggle, onChange }: { job: Job; open: boolean; onToggle: () => void; onChange: () => void }) {
  const [running, setRunning] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const processFn = useServerFn(processImportBatch);
  const retryFn = useServerFn(retryFailedItems);
  const cancelFn = useServerFn(cancelImportJob);
  const deleteFn = useServerFn(deleteImportJob);

  const pct = job.total > 0 ? Math.round(((job.done_count + job.failed_count) / job.total) * 100) : 0;
  const isTerminal = job.status === "completed" || job.status === "cancelled";
  const remaining = Math.max(0, job.total - job.done_count - job.failed_count);

  const runOne = useCallback(async () => {
    setRunning(true);
    try {
      const out = await withAuth(() => processFn({ data: { jobId: job.id, batchSize: 5 } })) as { remaining: number; status: string };
      onChange();
      return out;
    } catch (e: any) {
      toast.error(e?.message ?? "Batch failed");
      setAutoRun(false);
      return null;
    } finally { setRunning(false); }
  }, [job.id, processFn, onChange]);

  useEffect(() => {
    if (!autoRun) return;
    let cancelled = false;
    (async () => {
      while (!cancelled) {
        const out = await runOne();
        if (!out || out.remaining === 0) { setAutoRun(false); break; }
      }
    })();
    return () => { cancelled = true; };
  }, [autoRun, runOne]);

  const onRetry = async () => {
    try {
      const out = await withAuth(() => retryFn({ data: { jobId: job.id } })) as { reset: number };
      toast.success(`Reset ${out.reset} items for retry`);
      onChange();
    } catch (e: any) { toast.error(e?.message ?? "Retry failed"); }
  };

  const onCancel = async () => {
    await withAuth(() => cancelFn({ data: { jobId: job.id } }));
    setAutoRun(false);
    onChange();
  };

  const onDelete = async () => {
    if (!confirm("Delete this job and all its items?")) return;
    await withAuth(() => deleteFn({ data: { jobId: job.id } }));
    onChange();
  };

  const statusColor =
    job.status === "completed" ? "text-emerald-600"
    : job.status === "failed" ? "text-destructive"
    : job.status === "running" ? "text-blue-600"
    : job.status === "cancelled" ? "text-muted-foreground"
    : "text-foreground";

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center gap-3 p-3">
        <button onClick={onToggle} className="text-xs text-muted-foreground w-4">{open ? "▾" : "▸"}</button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{job.section_url}</div>
          <div className="text-xs text-muted-foreground">
            {job.kind} · {new Date(job.created_at).toLocaleString()} · <span className={statusColor}>{job.status}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {job.done_count}✓ {job.failed_count}✗ / {job.total}
        </div>
        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-1">
          {!isTerminal && remaining > 0 && (
            <>
              <button onClick={runOne} disabled={running || autoRun}
                className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted disabled:opacity-50">
                {running ? "…" : "Run batch"}
              </button>
              <button onClick={() => setAutoRun((v) => !v)}
                className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted">
                {autoRun ? "Stop" : "Auto-run"}
              </button>
            </>
          )}
          {job.failed_count > 0 && (
            <button onClick={onRetry} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted">
              Retry failed
            </button>
          )}
          {!isTerminal && (
            <button onClick={onCancel} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted">
              Cancel
            </button>
          )}
          <button onClick={onDelete} className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted text-destructive">
            Delete
          </button>
        </div>
      </div>
      {open && <JobItems jobId={job.id} onChange={onChange} />}
    </div>
  );
}

function JobItems({ jobId, onChange }: { jobId: string; onChange: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const retryFn = useServerFn(retryFailedItems);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("import_job_items").select("*").eq("job_id", jobId)
      .order("created_at", { ascending: true }).limit(500);
    if (error) { toast.error(error.message); return; }
    setItems((data as Item[]) ?? []);
  }, [jobId]);

  useEffect(() => {
    load();
    const i = setInterval(load, 4000);
    return () => clearInterval(i);
  }, [load]);

  const retryOne = async (itemId: string) => {
    await withAuth(() => retryFn({ data: { jobId, itemId } }));
    load(); onChange();
  };

  return (
    <div className="border-t border-border max-h-96 overflow-auto text-xs">
      {items.map((it) => (
        <div key={it.id} className="flex items-start gap-2 px-3 py-2 border-b border-border last:border-0">
          <span className={
            it.status === "done" ? "text-emerald-600"
            : it.status === "failed" ? "text-destructive"
            : it.status === "processing" ? "text-blue-600"
            : "text-muted-foreground"
          }>
            {it.status === "done" ? "✓" : it.status === "failed" ? "✗" : it.status === "processing" ? "↻" : "·"}
          </span>
          <div className="flex-1 min-w-0">
            <div className="truncate">{it.url}</div>
            {it.last_error && <div className="text-destructive mt-0.5">{it.last_error}</div>}
            {it.result_slug && <div className="text-muted-foreground mt-0.5">→ {it.result_slug}</div>}
          </div>
          <span className="text-muted-foreground tabular-nums">{it.attempts}/3</span>
          {it.status === "failed" && (
            <button onClick={() => retryOne(it.id)} className="rounded-md border border-border px-2 py-0.5 hover:bg-muted">
              Retry
            </button>
          )}
        </div>
      ))}
      {items.length === 0 && <div className="px-3 py-2 text-muted-foreground">No items.</div>}
    </div>
  );
}
