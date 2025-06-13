// apps/web/middleware.ts
import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0"; // Adjust path if your auth0 client is elsewhere

export async function middleware(request: NextRequest) {
  // Using a try-catch block for more robust error handling with the middleware
  try {
    return await auth0.middleware(request);
  } catch (error) {
    console.error("Error in Auth0 middleware:", error);
    // Optionally, redirect to an error page or return a custom response
    // For now, rethrowing or letting Next.js handle it might be okay,
    // but in production, you might want a custom error response.
    // Example: return new Response("Authentication error", { status: 500 });
    throw error; // Re-throw for now, or handle as needed
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - api/ (to prevent middleware from running on internal Next.js API routes unless intended)
     *   (Note: /auth/login, /auth/callback, /auth/logout are handled by auth0.middleware itself)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/).*)",
  ],
};
