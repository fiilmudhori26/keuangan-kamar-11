import { createClient } from "@/lib/supabase/server";

export async function requirePengurus(): Promise<string> {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "pengurus") throw new Error("Forbidden");
  return session.user.id;
}
