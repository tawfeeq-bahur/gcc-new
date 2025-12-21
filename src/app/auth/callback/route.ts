import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect") || "/";

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Get user role to redirect appropriately
      const role = data.user.user_metadata?.role || "applicant";
      
      let redirectUrl = "/";
      switch (role) {
        case "recruiting_admin":
          redirectUrl = "/admin";
          break;
        case "panelist":
          redirectUrl = "/panelist";
          break;
        case "applicant":
        default:
          redirectUrl = "/";
          break;
      }
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // Return to home on error
  return NextResponse.redirect(new URL("/", request.url));
}
