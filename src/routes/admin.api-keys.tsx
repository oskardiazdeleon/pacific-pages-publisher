import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createApiKey, revokeApiKey } from "@/server/api-keys.functions";

export const Route = createFileRoute("/admin/api-keys")({
  component: ApiKeysPage,
});

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

type Scope = "blog:write" | "listings:write" | "articles:write";
const ALL_SCOPES: { value: Scope; label: string }[] = [
  { value: "blog:write", label: "Blog posts" },
  { value: "listings:write", label: "Listings" },
  { value: "articles:write", label: "Articles" },
];

function ApiKeysPage() {
  const [rows, setRows] = useState<ApiKeyRow[]>([]);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<Scope[]>(["blog:write"]);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [docsTab, setDocsTab] = useState<"blog" | "listings" | "articles">("blog");
  const create = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);

  const load = async () => {
    const { data } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, scopes, last_used_at, revoked_at, created_at")
      .order("created_at", { ascending: false });
    setRows((data as ApiKeyRow[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const withAuth = async <T,>(fn: () => Promise<T>): Promise<T> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Not signed in");
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
  };

  const handleCreate = async () => {
    if (!name.trim() || scopes.length === 0) return;
    setCreating(true);
    try {
      const res = await withAuth(() =>
        create({ data: { name: name.trim(), scopes } }),
      );
      setNewKey(res.key);
      setName("");
      await load();
    } catch (e) {
      console.error("Create API key failed:", e);
      toast.error(e instanceof Error ? e.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  };

  const toggleScope = (s: Scope) =>
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this key? Existing integrations will break.")) return;
    try {
      await withAuth(() => revoke({ data: { id } }));
      toast.success("Key revoked");
      await load();
    } catch (e) {
      console.error("Revoke failed:", e);
      toast.error(e instanceof Error ? e.message : "Failed to revoke");
    }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="max-w-4xl">
      <div className="eyebrow">Integrations</div>
      <h1 className="mt-2 font-display text-4xl font-semibold">API Keys</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create scoped keys to publish content programmatically. Endpoints:{" "}
        <code className="rounded bg-muted px-1.5 py-0.5">/api/public/blog</code>{" "}
        and <code className="rounded bg-muted px-1.5 py-0.5">/api/public/listings</code>.
      </p>

      {/* Create */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <div className="font-display text-lg font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create new key
        </div>
        <div className="mt-4 flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Zapier production"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim() || scopes.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {creating ? "Creating…" : "Generate key"}
          </button>
        </div>
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Scopes
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_SCOPES.map((s) => {
              const active = scopes.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleScope(s.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.label} <span className="font-mono opacity-70">({s.value})</span>
                </button>
              );
            })}
          </div>
        </div>
        {newKey && (
          <div className="mt-4 rounded-lg border border-accent/40 bg-accent/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">
              Copy now — shown only once
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 break-all rounded bg-background px-3 py-2 text-xs">
                {newKey}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newKey);
                  toast.success("Copied");
                }}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setNewKey(null)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Prefix</th>
              <th className="text-left px-5 py-3 font-medium">Scopes</th>
              <th className="text-left px-5 py-3 font-medium">Last used</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  No keys yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                      {r.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {r.key_prefix}…
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.scopes.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {r.last_used_at
                      ? new Date(r.last_used_at).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    {r.revoked_at ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Revoked
                      </span>
                    ) : (
                      <span className="rounded-full bg-teal-soft/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!r.revoked_at && (
                      <button
                        onClick={() => handleRevoke(r.id)}
                        className="inline-flex items-center gap-1 text-destructive text-xs font-medium hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Docs */}
      <div className="mt-10">
        <h2 className="font-display text-2xl font-semibold">How to publish content</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Send a <code>POST</code> request with your API key in the{" "}
          <code>X-API-Key</code> header (or <code>Authorization: Bearer …</code>).
        </p>

        <div className="mt-5 inline-flex rounded-full border border-border bg-card p-1">
          {(["blog", "listings", "articles"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setDocsTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                docsTab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "blog" ? "Blog posts" : t === "listings" ? "Listings" : "Articles"}
            </button>
          ))}
        </div>

        {docsTab === "blog" ? (
          <BlogDocs baseUrl={baseUrl} />
        ) : docsTab === "listings" ? (
          <ListingsDocs baseUrl={baseUrl} />
        ) : (
          <ArticlesDocs baseUrl={baseUrl} />
        )}
      </div>
    </div>
  );
}

function DocBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <pre className="mt-1 overflow-x-auto rounded-lg bg-foreground/95 p-4 text-xs text-background">
        {children}
      </pre>
    </div>
  );
}

function ResponseList({ resourceKey }: { resourceKey: string }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Responses
      </div>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        <li>
          <code>201</code> — created. Returns{" "}
          <code>{`{ ${resourceKey}: { id, slug, url, … } }`}</code>
        </li>
        <li><code>400</code> — validation failed (see <code>issues</code>)</li>
        <li><code>401</code> — missing / invalid / revoked API key (or wrong scope)</li>
        <li><code>409</code> — slug already exists</li>
      </ul>
    </div>
  );
}

function BlogDocs({ baseUrl }: { baseUrl: string }) {
  return (
    <>
      <DocBlock label="Endpoint">
{`POST ${baseUrl}/api/public/blog
Content-Type: application/json
X-API-Key: sk_live_…   (scope: blog:write)`}
      </DocBlock>
      <DocBlock label="Request body">
{`{
  "title": "Best Tacos in North Park",         // required, ≤200
  "slug": "best-tacos-north-park",             // optional, [a-z0-9-]
  "subtitle": "Where the locals actually eat",
  "excerpt": "A short summary for previews.",  // ≤500
  "body": "## Markdown body\\n\\nFull post…",   // required, markdown
  "cover_image": "https://…/cover.jpg",
  "category": "Food",
  "tags": ["tacos", "north-park"],
  "author_name": "Jane Doe",
  "read_time_minutes": 5,
  "meta_title": "Best Tacos in North Park",
  "meta_description": "≤160 char description",
  "status": "published",                        // or "draft"
  "ai_generated": false
}`}
      </DocBlock>
      <DocBlock label="cURL example">
{`curl -X POST ${baseUrl}/api/public/blog \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: $SANDIEGO_API_KEY" \\
  -d '{
    "title": "Best Tacos in North Park",
    "body": "## Markdown body...",
    "category": "Food",
    "tags": ["tacos"],
    "status": "published"
  }'`}
      </DocBlock>
      <ResponseList resourceKey="post" />
    </>
  );
}

function ListingsDocs({ baseUrl }: { baseUrl: string }) {
  return (
    <>
      <DocBlock label="Endpoint">
{`POST ${baseUrl}/api/public/listings
Content-Type: application/json
X-API-Key: sk_live_…   (scope: listings:write)`}
      </DocBlock>
      <DocBlock label="Request body">
{`{
  "name": "El Carlsbad Cantina",                // required, ≤200
  "slug": "el-carlsbad-cantina",                // optional, [a-z0-9-]
  "category": "Restaurant",                     // required: Restaurant | Hotel | Attraction | Tour | Shopping | Nightlife
  "neighborhood": "Carlsbad",                   // required
  "short_description": "Coastal tacos & mezcal.",
  "description": "Long-form description / story.",
  "hero_image": "https://…/hero.jpg",
  "gallery": ["https://…/1.jpg", "https://…/2.jpg"],
  "address": "123 Ocean Ave, Carlsbad, CA",
  "phone": "+1 760 555 0100",
  "email": "hi@example.com",
  "website": "https://example.com",
  "reservation_url": "https://resy.com/…",
  "price_range": "$$",                          // $ | $$ | $$$ | $$$$
  "rating": 4.6,                                // 0–5
  "hours": {
    "mon": { "open": "11:00", "close": "22:00" },
    "tue": { "open": "11:00", "close": "22:00" },
    "wed": { "closed": true }
  },
  "faqs": [
    { "question": "Do you take walk-ins?", "answer": "Yes, before 6pm." }
  ],
  "why_we_picked_it": ["Best mezcal flight in north county", "Sunset patio"],
  "insider_tip": "Order the off-menu birria taco.",
  "best_time_to_visit": "Golden hour (5–7pm)",
  "editor_note": "A neighborhood favorite since 2019.",
  "tier": "free",                               // free | featured | premium
  "status": "published"                         // or "draft"
}`}
      </DocBlock>
      <DocBlock label="cURL example">
{`curl -X POST ${baseUrl}/api/public/listings \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: $SANDIEGO_API_KEY" \\
  -d '{
    "name": "El Carlsbad Cantina",
    "category": "Restaurant",
    "neighborhood": "Carlsbad",
    "short_description": "Coastal tacos & mezcal.",
    "hero_image": "https://example.com/hero.jpg",
    "status": "published"
  }'`}
      </DocBlock>
      <ResponseList resourceKey="listing" />
    </>
  );
}


function ArticlesDocs({ baseUrl }: { baseUrl: string }) {
  return (
    <>
      <DocBlock label="Endpoint">
{`POST ${baseUrl}/api/public/articles
Content-Type: application/json
X-API-Key: sk_live_…   (scope: articles:write)`}
      </DocBlock>
      <DocBlock label="Request body">
{`{
  "title": "The Insider's Guide to La Jolla Coves",   // required, ≤200
  "slug": "insiders-guide-la-jolla-coves",            // optional, [a-z0-9-]
  "subtitle": "Tide pools, sea caves, and sunset.",
  "excerpt": "A short summary for previews.",         // ≤500
  "body": "<p>HTML body…</p>",                        // required, HTML
  "hero_image": "https://…/hero.jpg",
  "hero_caption": "Photo caption",
  "hero_credit": "Photo: Jane Doe",
  "category": "Guides",                               // required
  "tags": ["la-jolla", "outdoors"],
  "author_name": "Jane Doe",
  "author_title": "Senior editor",
  "author_avatar": "https://…/jane.jpg",
  "author_bio": "Jane writes about coastal SD.",
  "key_takeaways": ["Best at low tide", "Park early"],
  "faqs": [{ "q": "Is parking free?", "a": "On weekdays, yes." }],
  "pull_quote": "The coves at golden hour are unmatched.",
  "read_time_minutes": 6,
  "meta_title": "Insider's Guide to La Jolla Coves",
  "meta_description": "≤160 char description",
  "canonical_url": "https://example.com/canonical",
  "og_image": "https://…/og.jpg",
  "status": "published"                                // or "draft"
}`}
      </DocBlock>
      <DocBlock label="cURL example">
{`curl -X POST ${baseUrl}/api/public/articles \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: $SANDIEGO_API_KEY" \\
  -d '{
    "title": "Insider Guide to La Jolla",
    "category": "Guides",
    "body": "<p>Full article HTML…</p>",
    "status": "published"
  }'`}
      </DocBlock>
      <ResponseList resourceKey="article" />
    </>
  );
}
