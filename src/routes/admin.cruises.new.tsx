import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CruiseLineForm, emptyCruiseLine } from "@/components/admin/CruiseLineForm";

export const Route = createFileRoute("/admin/cruises/new")({
  component: NewCruiseLine,
});

function NewCruiseLine() {
  return (
    <div>
      <Link
        to="/admin/cruises"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cruise lines
      </Link>
      <h1 className="font-display text-3xl font-semibold mb-6">New cruise line</h1>
      <CruiseLineForm initial={emptyCruiseLine} />
    </div>
  );
}
