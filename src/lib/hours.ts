// Hours utilities. We accept several common shapes for the listings.hours JSONB:
//
//   1. { mon: "9:00-17:00", tue: "9:00-17:00", ... }
//   2. { mon: ["9:00-12:00","13:00-17:00"], ... }                  (split shifts)
//   3. { mon: { open: "09:00", close: "17:00" }, ... }
//   4. { monday: ..., tuesday: ... } (full names also supported)
//   5. null / missing day = closed.
//
// Everything is normalized to NormalizedDay[] indexed Sun..Sat (0..6).

export type DayRange = { open: string; close: string }; // "HH:mm" 24h
export type NormalizedDay = { dayIndex: number; label: string; ranges: DayRange[] };

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_KEYS: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function parseTime(t: string): { h: number; m: number } | null {
  if (!t) return null;
  const trimmed = t.trim().toLowerCase();
  // Try "HH:mm" or "H:mm" or "H[am|pm]"
  const m = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mm = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3];
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h < 0 || h > 24 || mm < 0 || mm > 59) return null;
  return { h, m: mm };
}

function parseRange(v: unknown): DayRange[] {
  if (!v) return [];
  if (typeof v === "string") {
    const lower = v.trim().toLowerCase();
    if (!lower || lower === "closed") return [];
    // Accept multiple ranges separated by "," or ";"
    return lower
      .split(/[;,]/)
      .map((seg) => {
        const parts = seg.split(/[-–—]/).map((s) => s.trim());
        if (parts.length !== 2) return null;
        const o = parseTime(parts[0]);
        const c = parseTime(parts[1]);
        if (!o || !c) return null;
        return { open: `${pad(o.h)}:${pad(o.m)}`, close: `${pad(c.h)}:${pad(c.m)}` };
      })
      .filter((x): x is DayRange => !!x);
  }
  if (Array.isArray(v)) {
    return v.flatMap((x) => parseRange(x));
  }
  if (typeof v === "object" && v !== null) {
    const obj = v as Record<string, unknown>;
    const o = parseTime(String(obj.open ?? obj.from ?? obj.start ?? ""));
    const c = parseTime(String(obj.close ?? obj.to ?? obj.end ?? ""));
    if (o && c) return [{ open: `${pad(o.h)}:${pad(o.m)}`, close: `${pad(c.h)}:${pad(c.m)}` }];
  }
  return [];
}

export function normalizeHours(raw: unknown): NormalizedDay[] | null {
  if (!raw || typeof raw !== "object") return null;
  const days: NormalizedDay[] = Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    label: DAY_LABELS[i],
    ranges: [],
  }));
  let any = false;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const idx = DAY_KEYS[k.toLowerCase()];
    if (idx === undefined) continue;
    const ranges = parseRange(v);
    if (ranges.length) {
      days[idx].ranges = ranges;
      any = true;
    }
  }
  return any ? days : null;
}

function fmt12(t: string): string {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return m === 0 ? `${h}${ap}` : `${h}:${pad(m)}${ap}`;
}

export function formatRange(r: DayRange): string {
  return `${fmt12(r.open)}–${fmt12(r.close)}`;
}

export type OpenStatus =
  | { state: "open"; until: string; nextLabel?: string }
  | { state: "closed"; opens?: { dayIndex: number; time: string } }
  | { state: "unknown" };

export function getOpenStatus(days: NormalizedDay[] | null, now = new Date()): OpenStatus {
  if (!days) return { state: "unknown" };
  const todayIdx = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const today = days[todayIdx];
  for (const r of today.ranges) {
    const [oh, om] = r.open.split(":").map(Number);
    const [ch, cm] = r.close.split(":").map(Number);
    const openMin = oh * 60 + om;
    let closeMin = ch * 60 + cm;
    if (closeMin <= openMin) closeMin += 24 * 60; // overnight
    if (minutesNow >= openMin && minutesNow < closeMin) {
      return { state: "open", until: fmt12(r.close) };
    }
  }
  // Find next opening within the week
  for (let i = 0; i < 7; i++) {
    const idx = (todayIdx + i) % 7;
    const d = days[idx];
    for (const r of d.ranges) {
      if (i === 0) {
        const [oh, om] = r.open.split(":").map(Number);
        if (oh * 60 + om <= minutesNow) continue;
      }
      return {
        state: "closed",
        opens: { dayIndex: idx, time: fmt12(r.open) },
      };
    }
  }
  return { state: "closed" };
}

export function dayName(idx: number, todayIdx: number): string {
  if (idx === todayIdx) return "today";
  if (idx === (todayIdx + 1) % 7) return "tomorrow";
  return DAY_LABELS[idx];
}

/** Schema.org openingHoursSpecification entries from normalized hours. */
export function toSchemaOpeningHours(days: NormalizedDay[] | null) {
  if (!days) return undefined;
  const SCHEMA_DAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];
  const out: Array<Record<string, unknown>> = [];
  for (const d of days) {
    for (const r of d.ranges) {
      out.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHEMA_DAYS[d.dayIndex],
        opens: r.open,
        closes: r.close,
      });
    }
  }
  return out.length ? out : undefined;
}
