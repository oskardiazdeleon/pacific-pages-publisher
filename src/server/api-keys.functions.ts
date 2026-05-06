import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ScopeEnum = z.enum(["blog:write", "listings:write", "articles:write"]);

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { name: string; scopes?: string[] }) =>
    z
      .object({
        name: z.string().min(1).max(80),
        scopes: z.array(ScopeEnum).min(1).max(5).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!roles?.some((r) => r.role === "admin")) {
      throw new Error("Only admins can create API keys");
    }

    const raw = `sk_live_${randomBytes(24).toString("hex")}`;
    const hash = createHash("sha256").update(raw).digest("hex");
    const prefix = raw.slice(0, 12);

    const { data: row, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        name: data.name,
        key_hash: hash,
        key_prefix: prefix,
        scopes: data.scopes ?? ["blog:write"],
        created_by: userId,
      })
      .select("id, name, key_prefix, scopes, created_at")
      .single();

    if (error) throw new Error(error.message);
    return { ...row, key: raw };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (!roles?.some((r) => r.role === "admin")) {
      throw new Error("Only admins can revoke API keys");
    }
    const { error } = await supabaseAdmin
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
