import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import {
  formatRange,
  getOpenStatus,
  normalizeHours,
  type NormalizedDay,
} from "@/lib/hours";

export function useListingHours(raw: unknown) {
  const days = normalizeHours(raw);
  const status = getOpenStatus(days);
  let label: string | null = null;
  let state: "open" | "closed" | "unknown" = status.state;
  if (status.state === "open") label = `Open · closes ${status.until}`;
  else if (status.state === "closed" && status.opens) {
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();
    const dayWord =
      status.opens.dayIndex === today
        ? "today"
        : status.opens.dayIndex === (today + 1) % 7
          ? "tomorrow"
          : dayLabels[status.opens.dayIndex];
    label = `Closed · opens ${status.opens.time} ${dayWord}`;
  } else if (status.state === "closed") label = "Closed";
  return { days, label, state };
}

export function ListingHoursPanel({ days }: { days: NormalizedDay[] }) {
  const [open, setOpen] = useState(false);
  const today = new Date().getDay();
  const todayDay = days[today];
  const todayLabel =
    todayDay.ranges.length === 0
      ? "Closed today"
      : todayDay.ranges.map(formatRange).join(", ");

  return (
    <div className="rounded-2xl border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Clock className="h-4 w-4 text-accent" />
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Today</div>
          <div className="text-sm font-medium">{todayLabel}</div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="border-t border-border px-4 py-3 text-sm">
          {days.map((d) => (
            <li
              key={d.dayIndex}
              className={`flex items-center justify-between py-1 ${
                d.dayIndex === today ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              <span>{d.label}</span>
              <span>
                {d.ranges.length === 0 ? "Closed" : d.ranges.map(formatRange).join(", ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
