import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const xForwardedHost = (request.headers.get("x-forwarded-host") || "").toLowerCase();
  const { pathname } = request.nextUrl;

  const isSahayak =
    host.includes("sahayak") ||
    host.includes("3001") ||
    xForwardedHost.includes("3001");

  const isSupervisor =
    host.includes("supervisor") ||
    host.includes("3002") ||
    xForwardedHost.includes("3002");

  const isAdmin =
    host.includes("admin") ||
    host.includes("3003") ||
    xForwardedHost.includes("3003");

  // Dedicated Sahayak domain (e.g. sahayak-sangwari.vercel.app or localhost:3001)
  if (isSahayak) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/sahayak", request.url));
    }
  }

  // Dedicated Supervisor domain (e.g. supervisor-sangwari.vercel.app or localhost:3002)
  if (isSupervisor) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/supervisor", request.url));
    }
  }

  // Dedicated Admin domain (e.g. localhost:3003)
  if (isAdmin) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};
