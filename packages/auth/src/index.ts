// packages/auth/src/index.ts

// This package can be used to store common Auth0 configuration variables
// or helper functions that might be shared between apps/web and apps/api.

// For example, you might define constants for expected environment variable names:
export const AUTH0_ISSUER_BASE_URL_ENV = "AUTH0_ISSUER_BASE_URL";
export const AUTH0_CLIENT_ID_ENV = "AUTH0_CLIENT_ID";
export const AUTH0_CLIENT_SECRET_ENV = "AUTH0_CLIENT_SECRET";
export const AUTH0_AUDIENCE_ENV = "AUTH0_AUDIENCE"; // For API
export const AUTH0_SCOPE_ENV = "AUTH0_SCOPE"; // For web app
export const AUTH0_SESSION_COOKIE_SECRET_ENV = "AUTH0_SESSION_COOKIE_SECRET"; // For web app

// Or more complex configurations if needed, though often these are directly
// consumed from process.env in the respective apps.

export function getAuth0EnvVariables() {
  return {
    issuerBaseURL: process.env[AUTH0_ISSUER_BASE_URL_ENV],
    clientID: process.env[AUTH0_CLIENT_ID_ENV],
    clientSecret: process.env[AUTH0_CLIENT_SECRET_ENV], // Sensitive, use with care
    audience: process.env[AUTH0_AUDIENCE_ENV],
    scope: process.env[AUTH0_SCOPE_ENV] || "openid profile email",
    sessionCookieSecret: process.env[AUTH0_SESSION_COOKIE_SECRET_ENV],
  };
}

// It's often better for apps to directly access process.env for security and clarity,
// but this package provides a central place to define *which* env vars are expected.

console.log("Auth package loaded. Ensure Auth0 environment variables are set.");
