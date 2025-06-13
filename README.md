# Full-Stack Monorepo with Turborepo, Shadcn UI, Auth0, Prisma, and Zod

This repository demonstrates a full-stack application built within a Turborepo monorepo structure. It includes a Next.js web application, an Express.js API, shared UI components, database management with Prisma, type validation with Zod, and authentication using Auth0.

## Features

- **Monorepo Management**: Turborepo for efficient build and development workflows.
- **Frontend**: Next.js (`apps/web`) with React, TypeScript, and Shadcn UI components from `packages/ui`. Utilizes Next.js App Router with Server Components and Server Actions.
- **Backend**: Express.js (`apps/api`) with TypeScript, serving a RESTful API.
- **Authentication**: Auth0 integration.
    - `apps/web`: Uses `@auth0/nextjs-auth0/server` with middleware for session management and Server Actions for authenticated API calls.
    - `apps/api`: Protects API endpoints using JWT validation.
- **Database**: PostgreSQL managed with Prisma (`packages/db`), including schema definitions, migrations, and seeding.
- **Type Safety**: Zod (`packages/types`) for schema validation and inferred types, shared across frontend and backend.
- **Shared UI**: Centralized UI components in `packages/ui` (based on Shadcn UI).
- **Shared Auth Config**: Basic Auth0 configuration helpers in `packages/auth`.

## Prerequisites

- Node.js (>=20)
- pnpm (version specified in `packageManager` field of root `package.json`)
- PostgreSQL database server running.
- An Auth0 account.

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:** `pnpm install` (from the root).
3.  **Set up Environment Variables:** See below.
4.  **Set up Auth0:** See "Auth0 Setup Guide" below.
5.  **Run Database Migrations:** `pnpm --filter @workspace/db db:migrate`
6.  **Seed the Database (Optional):** `pnpm --filter @workspace/db db:seed`

## Environment Variables

### 1. For Database (`packages/db` context)
   Create `packages/db/.env` (or root `.env`):
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```

### 2. For `apps/web`
   Create `apps/web/.env.local`:
   ```env
   # Auth0 Configuration (from your Auth0 Application - Regular Web Application)
   AUTH0_SECRET="a-very-long-random-string-for-session-encryption" # openssl rand -hex 32
   AUTH0_DOMAIN="your-tenant.auth0.com" # e.g., dev-yourtenant.us.auth0.com
   AUTH0_CLIENT_ID="your-auth0-web-app-client-id"
   AUTH0_CLIENT_SECRET="your-auth0-web-app-client-secret"
   APP_BASE_URL="http://localhost:3000" # Base URL of your web app

   # Auth0 API Audience and Scopes (for getting an access token for your apps/api)
   AUTH0_API_AUDIENCE="your-api-identifier" # Same as for apps/api
   AUTH0_LOGIN_SCOPES="openid profile email offline_access" # Adjust if your API needs specific scopes

   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:3001" # URL of your apps/api service
   ```

### 3. For `apps/api`
   Create `apps/api/.env`:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public" # Must match DB used by web if sharing data
   AUTH0_API_ISSUER_BASE_URL="https://your-tenant.auth0.com" # Should align with AUTH0_DOMAIN
   AUTH0_API_AUDIENCE="your-api-identifier" # Identifier for this API in Auth0
   ```

## Auth0 Setup Guide

### 1. Auth0 Application (for `apps/web`)
   - Go to Auth0 Dashboard > Applications > Applications.
   - Create Application > "Regular Web Application".
   - **Settings**:
     - Note **Domain**, **Client ID**, **Client Secret** (for `.env.local`).
     - **Allowed Callback URLs**: `http://localhost:3000/auth/callback` (use your `APP_BASE_URL`).
     - **Allowed Logout URLs**: `http://localhost:3000` (use your `APP_BASE_URL`).
     - **Allowed Web Origins**: `http://localhost:3000`.
     - **Allowed Origins (CORS)**: `http://localhost:3000`.
   - **APIs Tab (in Application Settings)**: Ensure your API (created below) is authorized for this application if you are using custom scopes or RBAC. For general access token with audience, this might not be strictly needed unless running into consent issues.
   - **Connections**: Enable desired connections (Username-Password, Google, GitHub).

### 2. Auth0 API (for `apps/api`)
   - Go to Auth0 Dashboard > Applications > APIs.
   - Create API > **Name**: e.g., "My App API", **Identifier (Audience)**: e.g., `https://api.myapp.com` (this is `AUTH0_API_AUDIENCE`).
   - **Signing Algorithm**: RS256.
   - (Optional) Define permissions/scopes under "Permissions" tab. If you define custom scopes here (e.g., `read:posts`), add them to `AUTH0_LOGIN_SCOPES` in `apps/web/.env.local`.

## Monorepo Structure & Packages/Applications Details
(This section would largely remain the same as the previous README, with minor updates to `apps/web` description)

### `apps/web` (Frontend)
   - Tech Stack: Next.js (App Router), React, Server Components, Server Actions, TypeScript, Tailwind CSS, `@auth0/nextjs-auth0/server`.
   - UI: Uses components from `packages/ui`.
   - Functionality:
     - User authentication (login, logout, signup) via Auth0 middleware (`@auth0/nextjs-auth0/server`).
     - Server-side session management.
     - Allows authenticated users to create, view, and delete posts by invoking Server Actions which call `apps/api`.
   - Key Auth Files: `lib/auth0.ts` (Auth0Client setup), `middleware.ts` (Auth0 request middleware).
   - Running: `pnpm --filter web dev` (typically on `http://localhost:3000`).

(Other package and app descriptions like api, db, types, ui remain similar)

## Available Scripts (Root Level)
-   `pnpm install`
-   `pnpm dev`
-   `pnpm build`
-   `pnpm lint`
-   `pnpm format`
-   `pnpm --filter @workspace/db db:migrate`
-   `pnpm --filter @workspace/db db:seed`

## Development Workflow
(Similar to previous, emphasizing `pnpm dev`)
