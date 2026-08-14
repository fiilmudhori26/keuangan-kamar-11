import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PATHS = ["/dashboard", "/students", "/transactions", "/guardians"];

function isAdminPath(path: string): boolean {
  return ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

function isPublicPath(path: string): boolean {
  return path === "/login" || path === "/" || path.startsWith("/portal");
}

// ponytail: session cookie heuristic (sb-*-auth-token) — no network round-trip.
// Expired cookie still caught by getUser below; false-negative = 1 extra getUser, never an auth bypass.
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.includes("auth-token"));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const path = request.nextUrl.pathname;

  // Fast path: no session cookie → skip getUser() entirely (saves 1-2 RTT per anon visit)
  if (!hasSessionCookie(request)) {
    if (isPublicPath(path)) return supabaseResponse; // anonim di public: serve langsung
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url); // anonim di protected: redirect tanpa getUser
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated (expired/invalid cookie) → allow only public paths
  if (!user) {
    if (!isPublicPath(path)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Authenticated — check role only when needed
  const needsRoleCheck = isAdminPath(path) || isPublicPath(path);

  if (needsRoleCheck) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // On public/login path → redirect to dashboard (or portal if wali)
    if (isPublicPath(path)) {
      const url = request.nextUrl.clone();
      url.pathname = profile?.role === "wali" ? "/portal" : "/dashboard";
      return NextResponse.redirect(url);
    }

    // On admin path, wali → redirect to portal
    if (profile?.role === "wali") {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
