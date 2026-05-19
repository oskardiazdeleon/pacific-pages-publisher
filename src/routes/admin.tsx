import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — sandiego.com" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading, canManageContent, isPartner } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { next: "/admin" } as never });
      return;
    }
    if (!canManageContent) {
      toast.error("You don't have access to the admin area.");
      navigate({ to: isPartner ? "/partner" : "/" });
    }
  }, [loading, user, canManageContent, isPartner, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user || !canManageContent) return null;

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}

