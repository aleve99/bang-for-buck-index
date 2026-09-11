import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdminToken } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (await isAdminToken(token)) {
    return NextResponse.next();
  }

  const login = request.nextUrl.clone();
  login.pathname = "/admin/login";
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
