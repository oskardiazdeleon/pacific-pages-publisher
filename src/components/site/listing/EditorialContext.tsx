import { Pencil, Lightbulb, Clock, MapPinned } from "lucide-react";

export type EditorialContextData = {
  editor_note?: string | null;
  why_we_picked_it?: string[] | null;
  insider_tip?: string | null;
  best_time_to_visit?: string | null;
  local_context?: string | null;
  curatorName?: string | null;
  curatorAvatar?: string | null;
  updatedAt?: string | null;
  verifiedVisited?: boolean | null;
};

function fmtDate(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch { return null; }
}

/** Editor's note callout — shown above the description. */
export function EditorNoteCallout({ note }: { note: string }) {
  return (
    <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Pencil className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">Editor's note</div>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{note}</p>
        </div>
      </div>
    </div>
  );
}

/** "Why we picked it" chip row. */
export function WhyWePickedIt({ reasons }: { reasons: string[] }) {
  if (!reasons?.length) return null;
  return (
    <div>
      <div className="eyebrow">Why we picked it</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {reasons.slice(0, 6).map((r) => (
          <span
            key={r}
            className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
          >
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Sidebar insider-tip card. */
export function InsiderTipCard({ tip, bestTime }: { tip?: string | null; bestTime?: string | null }) {
  if (!tip && !bestTime) return null;
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      {tip && (
        <>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
            <Lightbulb className="h-3 w-3" /> Insider tip
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{tip}</p>
        </>
      )}
      {bestTime && (
        <div className={`flex items-center gap-2 text-sm text-muted-foreground ${tip ? "mt-4 pt-4 border-t border-border" : ""}`}>
          <Clock className="h-4 w-4 text-accent" />
          <span><span className="font-medium text-foreground">Best time:</span> {bestTime}</span>
        </div>
      )}
    </div>
  );
}

/** Local-context paragraph appended to the description. */
export function LocalContextBlock({ neighborhood, context }: { neighborhood: string; context: string }) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4">
      <MapPinned className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">In {neighborhood}: </span>
        {context}
      </p>
    </div>
  );
}

/** Byline: "Curated by X · Updated date · Verified visited". */
export function CuratorByline({
  curatorName,
  curatorAvatar,
  updatedAt,
  verifiedVisited,
}: Pick<EditorialContextData, "curatorName" | "curatorAvatar" | "updatedAt" | "verifiedVisited">) {
  const hasAny = curatorName || updatedAt || verifiedVisited;
  if (!hasAny) return null;
  const dateStr = fmtDate(updatedAt);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {curatorName && (
        <span className="inline-flex items-center gap-2">
          {curatorAvatar ? (
            <img src={curatorAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-foreground">
              {curatorName.slice(0, 1)}
            </span>
          )}
          <span>Curated by <span className="font-medium text-foreground">{curatorName}</span></span>
        </span>
      )}
      {dateStr && (
        <>
          <span aria-hidden>·</span>
          <span>Updated {dateStr}</span>
        </>
      )}
      {verifiedVisited && (
        <>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">
            ✓ Verified visited
          </span>
        </>
      )}
    </div>
  );
}
