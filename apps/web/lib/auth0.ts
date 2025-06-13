// apps/web/lib/auth0.ts
import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Environment variables to be set in .env.local for apps/web:
// AUTH0_DOMAIN (e.g., your-tenant.auth0.com)
// AUTH0_CLIENT_ID
// AUTH0_CLIENT_SECRET
// AUTH0_SECRET (for cookie encryption)
// APP_BASE_URL (e.g., http://localhost:3000)
// AUTH0_API_AUDIENCE (Your API identifier, e.g., https://api.yourapp.com)
// AUTH0_LOGIN_SCOPES (e.g., "openid profile email offline_access")

export const auth0 = new Auth0Client({
  // The following will be automatically read from environment variables
  // by the Auth0Client constructor if named according to convention:
  // domain: process.env.AUTH0_DOMAIN,
  // clientId: process.env.AUTH0_CLIENT_ID,
  // clientSecret: process.env.AUTH0_CLIENT_SECRET,
  // secret: process.env.AUTH0_SECRET,
  // baseURL: process.env.APP_BASE_URL,

  // We need to explicitly pass audience and scope for API access token.
  // These names (AUTH0_API_AUDIENCE, AUTH0_LOGIN_SCOPES) are chosen here
  // and must be set in .env.local.
  authorizationParams: {
    audience: process.env.AUTH0_API_AUDIENCE, // Audience for your external API
    scope: process.env.AUTH0_LOGIN_SCOPES || "openid profile email offline_access", // Scopes requested during login
  }
});

// Note: The Auth0Client automatically reads most of its direct config from
// process.env variables like AUTH0_DOMAIN, AUTH0_CLIENT_ID etc.
// The 'audience' and 'scope' inside 'authorizationParams' are key for getting an access token for an API.
// Make sure AUTH0_API_AUDIENCE and AUTH0_LOGIN_SCOPES are set in apps/web/.env.local
