import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase();
  const { pathname } = request.nextUrl;

  // Dedicated Sahayak domain (e.g. sahayak-sangwari.vercel.app)
  if (host.includes("sahayak")) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/sahayak", request.url));
    }
  }

  // Dedicated Supervisor domain (e.g. supervisor-sangwari.vercel.app)
  if (host.includes("supervisor")) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/supervisor", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};
