import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

/**
 * Primera barrera del panel: sin sesión válida no se llega a /admin ni a /api/admin.
 * (La verificación definitiva está en requireAdmin(), junto a cada consulta.)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/api/admin")) {
    return session ? NextResponse.next() : NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const isLogin = pathname === "/admin/login";
  if (!session && !isLogin) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (session && isLogin) return NextResponse.redirect(new URL("/admin", request.url));

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
