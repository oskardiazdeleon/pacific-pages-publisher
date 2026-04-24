import { createFileRoute } from "@tanstack/react-router";
import { ListingForm } from "@/components/admin/ListingForm";

export const Route = createFileRoute("/admin/listings/new")({
  component: NewListing,
});

function NewListing() {
  return (
    <div>
      <div className="eyebrow">New</div>
      <h1 className="mt-2 mb-8 font-display text-4xl font-semibold">Create listing</h1>
      <ListingForm />
    </div>
  );
}
