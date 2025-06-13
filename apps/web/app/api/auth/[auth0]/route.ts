// apps/web/app/api/auth/[auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0/edge';

// Note: Using /edge for Vercel Edge Functions.
// If deploying to Node.js server, use '@auth0/nextjs-auth0' and ensure AUTH0_SECRET is set.
// For Edge, AUTH0_SECRET is typically handled by Vercel's environment variables.
// The SDK will pick up AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET automatically
// from environment variables.

export const GET = handleAuth();
