import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = request.cookies.get("sf_session")?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session && !isPublic) {
    // Hardcoded path — not user input, safe from SSRF/XSS
    const loginUrl = new URL("/login", request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isPublic) {
    // Hardcoded path — not user input, safe from SSRF/XSS
    const dashboardUrl = new URL("/dashboard", request.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
