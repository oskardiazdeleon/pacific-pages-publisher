import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Save, Send, Eye, EyeOff, ChevronDown, Search, Megaphone, Sparkles, Settings2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CmsImageUpload } from "@/components/admin/CmsImageUpload";

export const Route = createFileRoute("/admin/cms/homepage")({
  head: () => ({ meta: [{ title: "Homepage — Admin" }, { name: "robots", content: "noindex" }] }),
  component: HomepagePage,
});

type Section = {
  id: string;
  section_key: string;
  section_type: string;
  position: number;
  enabled: boolean;
  draft_content: Record<string, unknown>;
  published_content: Record<string, unknown> | null;
};

type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "image" | "toggle" | "repeater";
  help?: string;
  group?: "content" | "sponsor" | "advanced";
  /** For type="repeater": the editable subfields per row. */
  itemFields?: { name: string; label: string; placeholder?: string }[];
  /** For type="repeater": friendly label for the add button (e.g. "chip", "stat"). */
  itemLabel?: string;
  /** For type="repeater": cap on number of rows. */
  maxItems?: number;
};

const FIELDS_BY_TYPE: Record<string, FieldDef[]> = {
  hero: [
    { name: "eyebrow", label: "Eyebrow", group: "content" },
    { name: "heading", label: "Heading", group: "content" },
    { name: "subheading", label: "Subheading", type: "textarea", group: "content" },
    { name: "primary_cta_label", label: "Primary CTA label", group: "content" },
    { name: "primary_cta_to", label: "Primary CTA link", group: "content" },
    { name: "secondary_cta_label", label: "Secondary CTA label", group: "advanced" },
    { name: "secondary_cta_to", label: "Secondary CTA link", group: "advanced" },
    { name: "image_url", label: "Background image (optional override)", type: "image", group: "advanced" },
    { name: "sponsor_active", label: "Enable sponsored takeover", type: "toggle", group: "sponsor", help: "When ON, the hero shows your custom heading, image, CTA, and a 'Presented by' badge instead of the default Insider hero." },
    { name: "sponsor_name", label: "Sponsor name", group: "sponsor" },
    { name: "sponsor_logo_url", label: "Sponsor logo (transparent PNG)", type: "image", group: "sponsor" },
    { name: "sponsor_link_url", label: "Sponsor click-through URL", group: "sponsor" },
  ],
  cruises_hero: [
    { name: "eyebrow", label: "Eyebrow", group: "content" },
    { name: "heading", label: "Heading", group: "content" },
    { name: "heading_accent", label: "Heading accent (second line, colored)", group: "content", help: "Optional second line of the heading rendered in the accent color (e.g. \"from the Port.\")." },
    { name: "subheading", label: "Subheading", type: "textarea", group: "content" },
    { name: "hero_image_url", label: "Hero image", type: "image", group: "content", help: "Large image shown to the right of the heading." },
    {
      name: "popular_chips",
      label: "Popular search chips",
      type: "repeater",
      group: "content",
      itemLabel: "chip",
      maxItems: 8,
      itemFields: [
        { name: "label", label: "Label", placeholder: "Mexican Riviera" },
        { name: "to", label: "Link path", placeholder: "/cruises/princess" },
      ],
      help: "Quick links shown under the search box.",
    },
    {
      name: "stats",
      label: "Stat cards",
      type: "repeater",
      group: "content",
      itemLabel: "stat",
      maxItems: 4,
      itemFields: [
        { name: "value", label: "Value", placeholder: "7" },
        { name: "label", label: "Label", placeholder: "Cruise Lines" },
      ],
      help: "Floating cards under the hero image (max 3 visible on desktop).",
    },
    { name: "sponsor_active", label: "Enable sponsored takeover", type: "toggle", group: "sponsor", help: "When ON, replaces the eyebrow with a 'Presented by' badge." },
    { name: "sponsor_name", label: "Sponsor name", group: "sponsor" },
    { name: "sponsor_logo_url", label: "Sponsor logo (transparent PNG)", type: "image", group: "sponsor" },
    { name: "sponsor_link_url", label: "Sponsor click-through URL", group: "sponsor" },
  ],
  themed_hub_hero: [
    { name: "eyebrow", label: "Eyebrow", group: "content" },
    { name: "heading", label: "Heading", group: "content" },
    { name: "subheading", label: "Subheading", type: "textarea", group: "content" },
    { name: "sponsor_active", label: "Enable sponsored takeover", type: "toggle", group: "sponsor", help: "When ON, shows your custom hub hero and a 'Presented by' badge." },
    { name: "sponsor_name", label: "Sponsor name", group: "sponsor" },
    { name: "sponsor_logo_url", label: "Sponsor logo (transparent PNG)", type: "image", group: "sponsor" },
    { name: "sponsor_link_url", label: "Sponsor click-through URL", group: "sponsor" },
  ],
  category_hub_hero: [
    { name: "eyebrow", label: "Eyebrow", group: "content", help: "Small label above the heading (e.g. \"Where to stay\")." },
    { name: "heading", label: "Heading", group: "content" },
    { name: "heading_accent", label: "Heading accent (second line, colored)", group: "content", help: "Optional second line of the heading rendered in the accent color." },
    { name: "subheading", label: "Subheading", type: "textarea", group: "content" },
    { name: "hero_image_url", label: "Hero image", type: "image", group: "content", help: "Large image shown to the right of the heading." },
    { name: "search_placeholder", label: "Search box placeholder", group: "content" },
    {
      name: "popular_chips",
      label: "Popular search chips",
      type: "repeater",
      group: "content",
      itemLabel: "chip",
      maxItems: 8,
      itemFields: [
        { name: "label", label: "Label", placeholder: "Beachfront" },
        { name: "keyword", label: "Search keyword", placeholder: "beach" },
      ],
      help: "Quick-filter buttons under the search box. Clicking one searches by the keyword.",
    },
    {
      name: "stats",
      label: "Stat cards",
      type: "repeater",
      group: "content",
      itemLabel: "stat",
      maxItems: 4,
      itemFields: [
        { name: "value", label: "Value", placeholder: "1,200+" },
        { name: "label", label: "Label", placeholder: "Things To Do" },
      ],
      help: "Floating cards under the hero image (max 3 visible on desktop).",
    },
    { name: "insider_cta_title", label: "Insider CTA title", group: "content" },
    { name: "insider_cta_body", label: "Insider CTA body", type: "textarea", group: "content" },
    { name: "sponsor_active", label: "Enable sponsored takeover", type: "toggle", group: "sponsor", help: "When ON, the eyebrow is replaced by a 'Presented by' badge with your sponsor name/logo." },
    { name: "sponsor_name", label: "Sponsor name", group: "sponsor" },
    { name: "sponsor_logo_url", label: "Sponsor logo (transparent PNG)", type: "image", group: "sponsor" },
    { name: "sponsor_link_url", label: "Sponsor click-through URL", group: "sponsor" },
  ],
  featured_listings: [
    { name: "eyebrow", label: "Eyebrow", group: "content" },
    { name: "heading", label: "Heading", group: "content" },
    { name: "cta_label", label: "CTA label", group: "content" },
    { name: "cta_to", label: "CTA link", group: "content" },
  ],
  editorial: [
    { name: "eyebrow", label: "Eyebrow", group: "content" },
    { name: "heading", label: "Heading", group: "content" },
    { name: "cta_label", label: "CTA label", group: "content" },
    { name: "cta_to", label: "CTA link", group: "content" },
  ],
  neighborhoods: [
    { name: "eyebrow", label: "Eyebrow", group: "content" },
    { name: "heading", label: "Heading", group: "content" },
  ],
  partner_cta: [
    { name: "eyebrow", label: "Eyebrow", group: "content" },
    { name: "heading", label: "Heading", group: "content" },
    { name: "body", label: "Body", type: "textarea", group: "content" },
    { name: "cta_label", label: "CTA label", group: "content" },
    { name: "cta_to", label: "CTA link", group: "content" },
  ],
};

function prettyKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Where each section renders on the public site. Used to group the sidebar
// and to show a contextual hint in the editor header.
type LocationKey = "homepage" | "category_hubs" | "cruises" | "themed_hubs";
const LOCATIONS: Record<LocationKey, { label: string; hint: string; path: string }> = {
  homepage: { label: "Homepage", hint: "Renders on the homepage ( / )", path: "/" },
  category_hubs: { label: "Category hubs", hint: "Hero on Hotels, Restaurants, Things To Do, Shopping, and Nightlife pages", path: "/things-to-do" },
  cruises: { label: "Cruises hub", hint: "Renders on the Cruises category page", path: "/cruises" },
  themed_hubs: { label: "Themed hubs", hint: "Renders on themed category hubs (e.g. Wineries, Golf)", path: "/wineries" },
};

function locationForSection(s: { section_key: string; section_type: string }): LocationKey {
  const k = s.section_key.toLowerCase();
  const t = s.section_type.toLowerCase();
  if (t === "category_hub_hero") return "category_hubs";
  if (t === "cruises_hero" || k.includes("cruise")) return "cruises";
  if (t === "themed_hub_hero" || k.includes("wineries") || k.includes("themed") || k.includes("hub")) return "themed_hubs";
  return "homepage";
}

function HomepagePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ sponsor: false, advanced: false });

  const load = async () => {
    const { data } = await supabase.from("homepage_sections").select("*").order("position");
    const list = (data ?? []) as Section[];
    setSections(list);
    if (list.length && !activeId) setActiveId(list[0].id);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((s) => s.section_key.toLowerCase().includes(q) || s.section_type.toLowerCase().includes(q));
  }, [sections, query]);

  const active = sections.find((s) => s.id === activeId) || null;

  const updateField = (id: string, name: string, value: unknown) => {
    setSections((p) => p.map((s) => (s.id === id ? { ...s, draft_content: { ...s.draft_content, [name]: value } } : s)));
  };
  const toggleEnabled = async (s: Section) => {
    await supabase.from("homepage_sections").update({ enabled: !s.enabled }).eq("id", s.id);
    await load();
  };
  const saveDraft = async (s: Section) => {
    setBusy(true); setMsg(null);
    await supabase.from("homepage_sections").update({ draft_content: s.draft_content as never }).eq("id", s.id);
    setBusy(false); setMsg(`Saved draft: ${prettyKey(s.section_key)}`);
  };
  const publish = async (s: Section) => {
    setBusy(true); setMsg(null);
    await supabase.from("homepage_sections").update({ draft_content: s.draft_content as never, published_content: s.draft_content as never, published_at: new Date().toISOString() }).eq("id", s.id);
    await load();
    setBusy(false); setMsg(`Published: ${prettyKey(s.section_key)}`);
  };

  const renderField = (s: Section, f: FieldDef) => {
    const rawVal = s.draft_content?.[f.name];
    const val = (rawVal as string) || "";
    if (f.type === "toggle") {
      const checked = rawVal === true || rawVal === "true";
      return (
        <label key={f.name} className="flex items-start gap-3 rounded-lg border border-border bg-background/50 p-3 cursor-pointer">
          <input type="checkbox" checked={checked} onChange={(e) => updateField(s.id, f.name, e.target.checked)} className="h-4 w-4 mt-0.5 accent-accent" />
          <span className="text-sm">
            <span className="font-medium">{f.label}</span>
            {f.help && <span className="block text-xs text-muted-foreground mt-0.5">{f.help}</span>}
          </span>
        </label>
      );
    }
    if (f.type === "image") return <CmsImageUpload key={f.name} value={val} onChange={(v) => updateField(s.id, f.name, v)} label={f.label} />;
    if (f.type === "repeater") {
      const items = Array.isArray(rawVal) ? (rawVal as Record<string, string>[]) : [];
      const subFields = f.itemFields ?? [];
      const atMax = typeof f.maxItems === "number" && items.length >= f.maxItems;
      const updateItem = (idx: number, key: string, v: string) => {
        const next = items.map((it, i) => (i === idx ? { ...it, [key]: v } : it));
        updateField(s.id, f.name, next);
      };
      const removeItem = (idx: number) => {
        updateField(s.id, f.name, items.filter((_, i) => i !== idx));
      };
      const addItem = () => {
        const blank: Record<string, string> = {};
        subFields.forEach((sf) => { blank[sf.name] = ""; });
        updateField(s.id, f.name, [...items, blank]);
      };
      return (
        <div key={f.name}>
          <div className="flex items-end justify-between gap-2 mb-1.5">
            <label className="text-xs font-medium text-foreground/70">{f.label}</label>
            <span className="text-[10px] text-muted-foreground">{items.length}{f.maxItems ? ` / ${f.maxItems}` : ""}</span>
          </div>
          {f.help && <p className="text-[11px] text-muted-foreground mb-2">{f.help}</p>}
          <div className="space-y-2">
            {items.length === 0 && (
              <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                No {f.itemLabel ?? "items"} yet.
              </div>
            )}
            {items.map((item, idx) => (
              <div key={idx} className="rounded-md border border-border bg-background/50 p-2 flex items-end gap-2">
                <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${subFields.length}, minmax(0, 1fr))` }}>
                  {subFields.map((sf) => (
                    <div key={sf.name}>
                      <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{sf.label}</label>
                      <input
                        value={item[sf.name] ?? ""}
                        onChange={(e) => updateItem(idx, sf.name, e.target.value)}
                        placeholder={sf.placeholder}
                        className="mt-0.5 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                  title="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            disabled={atMax}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
          >
            <Plus className="h-3 w-3" /> Add {f.itemLabel ?? "item"}
          </button>
        </div>
      );
    }
    if (f.type === "textarea") return (
      <div key={f.name}>
        <label className="text-xs font-medium text-foreground/70">{f.label}</label>
        <textarea value={val} onChange={(e) => updateField(s.id, f.name, e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
    );
    return (
      <div key={f.name}>
        <label className="text-xs font-medium text-foreground/70">{f.label}</label>
        <input value={val} onChange={(e) => updateField(s.id, f.name, e.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
    );
  };

  const renderGroup = (s: Section, key: "sponsor" | "advanced", title: string, Icon: typeof Megaphone, fields: FieldDef[]) => {
    if (!fields.length) return null;
    const open = openGroups[key];
    const filledCount = fields.filter((f) => {
      const v = s.draft_content?.[f.name];
      return v !== undefined && v !== "" && v !== false;
    }).length;
    return (
      <div className="rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenGroups((p) => ({ ...p, [key]: !p[key] }))}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-secondary/40 hover:bg-secondary/60 transition text-left"
        >
          <div className="flex items-center gap-2.5">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{title}</span>
            {filledCount > 0 && (
              <span className="text-[10px] font-semibold rounded-full bg-accent/15 text-accent px-2 py-0.5">{filledCount} set</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && <div className="p-4 grid gap-4 bg-card">{fields.map((f) => renderField(s, f))}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Page sections</h1>
        <p className="text-sm text-muted-foreground mt-1">Sections are grouped by where they appear on the site. Disabled sections won't render.</p>
      </div>

      {msg && <div className="rounded-md bg-accent/10 text-accent text-sm px-3 py-2">{msg}</div>}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Sidebar list */}
        <aside className="rounded-xl border border-border bg-card overflow-hidden h-fit lg:sticky lg:top-6">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections…"
                className="w-full rounded-md border border-border bg-background pl-7 pr-2 py-1.5 text-xs"
              />
            </div>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto">
            {(["homepage", "category_hubs", "cruises", "themed_hubs"] as LocationKey[]).map((loc) => {
              const items = filtered.filter((s) => locationForSection(s) === loc);
              if (items.length === 0) return null;
              const meta = LOCATIONS[loc];
              return (
                <li key={loc} className="border-b border-border last:border-b-0">
                  <div className="px-3 pt-3 pb-1.5 flex items-baseline justify-between gap-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{meta.label}</div>
                    <code className="text-[10px] text-muted-foreground/70">{meta.path}</code>
                  </div>
                  <ul>
                    {items.map((s) => {
                      const dirty = JSON.stringify(s.draft_content) !== JSON.stringify(s.published_content || {});
                      const isActive = s.id === activeId;
                      return (
                        <li key={s.id}>
                          <button
                            onClick={() => setActiveId(s.id)}
                            className={`w-full text-left px-3 py-2.5 border-l-2 transition flex items-center justify-between gap-2 ${isActive ? "border-accent bg-accent/5" : "border-transparent hover:bg-secondary/40"}`}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{prettyKey(s.section_key)}</div>
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.section_type}</div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {dirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Unpublished changes" />}
                              {s.enabled ? <Eye className="h-3 w-3 text-green-600" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
            {filtered.length === 0 && <li className="px-3 py-6 text-xs text-muted-foreground text-center">No matches</li>}
          </ul>
        </aside>

        {/* Editor pane */}
        <div className="min-w-0">
          {!active && <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">Select a section to edit.</div>}
          {active && (() => {
            const fields = FIELDS_BY_TYPE[active.section_type] || [];
            const dirty = JSON.stringify(active.draft_content) !== JSON.stringify(active.published_content || {});
            const contentFields = fields.filter((f) => (f.group ?? "content") === "content");
            const sponsorFields = fields.filter((f) => f.group === "sponsor");
            const advancedFields = fields.filter((f) => f.group === "advanced");
            const loc = LOCATIONS[locationForSection(active)];
            return (
              <section className="rounded-xl border border-border bg-card">
                {/* Sticky header */}
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-b border-border bg-card/95 backdrop-blur rounded-t-xl">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-semibold truncate">{prettyKey(active.section_key)}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-2 py-0.5 font-semibold uppercase tracking-wider text-[10px]">{loc.label}</span>
                      <span className="truncate">{loc.hint}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {dirty && <span className="text-[10px] uppercase tracking-wider rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 font-semibold">Unpublished</span>}
                    <button onClick={() => toggleEnabled(active)} className={`inline-flex items-center gap-1 rounded-full text-xs font-semibold px-2.5 py-1 ${active.enabled ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {active.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {active.enabled ? "Enabled" : "Hidden"}
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Primary content */}
                  {contentFields.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" /> Content
                      </div>
                      <div className="grid gap-4 pt-2">{contentFields.map((f) => renderField(active, f))}</div>
                    </div>
                  )}

                  {/* Collapsible groups */}
                  {sponsorFields.length > 0 && renderGroup(active, "sponsor", "Sponsored takeover", Megaphone, sponsorFields)}
                  {advancedFields.length > 0 && renderGroup(active, "advanced", "Advanced", Settings2, advancedFields)}
                </div>

                {/* Sticky action bar */}
                <div className="sticky bottom-0 flex items-center justify-end gap-2 px-6 py-3 border-t border-border bg-card/95 backdrop-blur rounded-b-xl">
                  <button onClick={() => saveDraft(active)} disabled={busy} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-secondary disabled:opacity-50">
                    <Save className="h-3.5 w-3.5" /> Save draft
                  </button>
                  <button onClick={() => publish(active)} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-3 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50">
                    <Send className="h-3.5 w-3.5" /> Publish
                  </button>
                </div>
              </section>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
