import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Define route access by role
const ROLE_ROUTES: Record<string, string[]> = {
  applicant: ["/dashboard", "/jobs", "/applications", "/profile", "/assessments"],
  panelist: ["/panelist", "/interviews", "/candidates"],
  recruiting_admin: ["/admin", "/admin/jobs", "/admin/candidates", "/admin/analytics", "/admin/offers"],
  super_admin: ["/super-admin"],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
];

// Auth routes - redirect to dashboard if already logged in
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Allow public routes (auth pages only)
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return response;
  }

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, redirect to login
  if (!user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If logged in and trying to access auth routes, redirect to appropriate dashboard
  if (AUTH_ROUTES.includes(pathname)) {
    const role = user.user_metadata?.role || "applicant";
    const dashboardUrl = getRoleDashboard(role);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Get user role from metadata or fetch from profiles
  const role = user.user_metadata?.role || "applicant";

  // Check role-based access
  const isAllowed = checkRouteAccess(pathname, role);

  if (!isAllowed) {
    // Redirect to appropriate dashboard based on role
    const dashboardUrl = getRoleDashboard(role);
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return response;
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case "recruiting_admin":
      return "/admin";
    case "panelist":
      return "/panelist";
    case "super_admin":
      return "/super-admin";
    case "applicant":
    default:
      return "/dashboard";
  }
}

function checkRouteAccess(pathname: string, role: string): boolean {
  // Admin routes
  if (pathname.startsWith("/admin")) {
    return role === "recruiting_admin" || role === "super_admin";
  }

  // Panelist routes
  if (pathname.startsWith("/panelist")) {
    return role === "panelist" || role === "recruiting_admin" || role === "super_admin";
  }

  // Super admin routes
  if (pathname.startsWith("/super-admin")) {
    return role === "super_admin";
  }

  // Dashboard and applicant routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/applications") || pathname.startsWith("/profile")) {
    return true; // All authenticated users can access
  }

  // Allow other routes
  return true;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
