import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Rota desabilitada por segurança (criação de dono)
  if (pathname === "/start-dono") {
    return new NextResponse(null, { status: 404 });
  }

  // Rotas públicas do admin
  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const needsAuth = pathname.startsWith("/admin") || pathname.startsWith("/saas");
  if (!needsAuth) return NextResponse.next();

  const token = await getToken({ req });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/saas/:path*", "/start-dono"],
};

