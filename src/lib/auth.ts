import { createClient } from "@/lib/supabase/server";

// ponytail: per-request profile cache via globalThis. No Map eviction needed —
// request-scoped, cleared each cold start. Upgrade to AsyncLocalStorage if cross-call sharing leaks.
const profileCache: { userId?: string; role?: string } =
  globalThis as unknown as { userId?: string; role?: string };

export async function requirePengurus(): Promise<string> {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("Unauthorized");

  if (profileCache.userId === session.user.id && profileCache.role) {
    if (profileCache.role !== "pengurus") throw new Error("Forbidden");
    return session.user.id;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  profileCache.userId = session.user.id;
  profileCache.role = profile?.role;

  if (profile?.role !== "pengurus") throw new Error("Forbidden");
  return session.user.id;
}
