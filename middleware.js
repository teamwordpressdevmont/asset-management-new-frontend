import { NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
];

const roleRoutes = {
  super_admin: [
    "/dashboard",
    "/company",
    "/users",
    "/assets-category",
    "/assets",
    "/vendors",
    "/profile",
    "/issue",
    "/notifications",
  ],
  admin: [
    "/dashboard",
    "/assets",
    "/assets-category",
    "/vendors",
    "/users",
    "/profile",
    "/issue",
    "/return-requests",
    "/notifications",
  ],
  user: [
    "/dashboard",
    "/profile",
    "/own-assets",
    "/issue/create",
    "/issue",
    "/notifications",
  ],
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("authToken")?.value;
  const userCookie = request.cookies.get("authUser")?.value;
  const forgotToken = request.cookies.get("fp_email")?.value;

  if (!forgotToken && request.nextUrl.pathname.startsWith("/reset-password")) {
    return NextResponse.redirect(new URL("/forgot-password", request.url));
  }

  let role = null;
  try {
    role = userCookie ? JSON.parse(userCookie)?.role?.name : null;
  } catch {
    role = null;
  }

  // ── Public routes ──────────────────────────────────────────────
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    // Already logged in → push away from auth pages
    if (
      token &&
      (pathname.startsWith("/login") || pathname.startsWith("/forgot-password"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // ── Root redirect ───────────────────────────────────────────────
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(token ? "/dashboard" : "/login", request.url),
    );
  }

  // ── Unauthenticated ─────────────────────────────────────────────
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Token present but role unreadable → unauthorized ────────────
  if (!role) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ── Role-based access control ───────────────────────────────────
  const allowedRoutes = roleRoutes[role] ?? [];
  const isAllowed = allowedRoutes.some((r) => pathname.startsWith(r));

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all routes EXCEPT static files, images, and Next internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)).*)",
  ],
};
