# Full-Stack Monorepo with Turborepo, Shadcn UI, Auth0, Prisma, and Zod

This repository demonstrates a full-stack application built within a Turborepo monorepo structure. It includes a Next.js web application, an Express.js API, shared UI components, database management with Prisma, type validation with Zod, and authentication using Auth0.

## Features

- **Monorepo Management**: Turborepo for efficient build and development workflows.
- **Frontend**: Next.js (`apps/web`) with React, TypeScript, and Shadcn UI components from `packages/ui`.
- **Backend**: Express.js (`apps/api`) with TypeScript, serving a RESTful API.
- **Authentication**: Auth0 integration for both frontend (session management, social logins) and backend (API protection).
- **Database**: PostgreSQL managed with Prisma (`packages/db`), including schema definitions, migrations, and seeding.
- **Type Safety**: Zod (`packages/types`) for schema validation and inferred types, shared across frontend and backend.
- **Shared UI**: Centralized UI components in `packages/ui` (based on Shadcn UI).
- **Shared Auth Config**: Basic Auth0 configuration helpers in `packages/auth`.

## Prerequisites

- Node.js (>=20, as per root `package.json`)
- pnpm (version specified in `packageManager` field of root `package.json`, e.g., `pnpm@10.4.1`)
- PostgreSQL database server running.
- An Auth0 account.

## Getting Started

1.  **Clone the repository:**
    \`\`\`bash
    git clone <repository-url>
    cd <repository-name>
    \`\`\`

2.  **Install dependencies:**
    Run from the root of the monorepo:
    \`\`\`bash
    pnpm install
    \`\`\`

3.  **Set up Environment Variables:**
    You will need to create environment files for the database, web app, and API. See the "Environment Variables" section below for details.

4.  **Set up Auth0:**
    Follow the "Auth0 Setup Guide" section below.

5.  **Run Database Migrations:**
    Ensure your `DATABASE_URL` is correctly set in `.env` files (specifically for `packages/db` context, which `apps/api` will use, and for the migration command itself).
    \`\`\`bash
    pnpm --filter @workspace/db db:migrate
    \`\`\`
    This command applies pending migrations to your database schema. You might be prompted to create the database if it doesn't exist or name the first migration.

6.  **Seed the Database (Optional but Recommended):**
    To populate the database with initial sample data:
    \`\`\`bash
    pnpm --filter @workspace/db db:seed
    \`\`\`

## Environment Variables

Create the following environment files and populate them with your specific values.

### 1. For Database (`packages/db` context, typically used by `apps/api` and migration/seed scripts)

   Create a `.env` file in the **root directory** if you want global access for scripts like migrate/seed run from the root, or ensure `apps/api/.env` has it when it runs. For Prisma CLI commands run with `--filter @workspace/db`, it will look for `.env` in `packages/db` or the root. It's often simplest to have one in the root for CLI tools and one in `apps/api` for the runtime.

   **File: `packages/db/.env` (or root `.env`)**
   \`\`\`env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   \`\`\`

### 2. For `apps/web`

   Create a `.env.local` file in the `apps/web` directory:
   **File: `apps/web/.env.local`**
   \`\`\`env
   # Auth0 Configuration (from your Auth0 Application - Regular Web Application)
   AUTH0_SECRET="a-very-long-random-string-for-session-encryption" # Generate a strong secret
   AUTH0_ISSUER_BASE_URL="https://your-tenant.auth0.com" # e.g., https://dev-yourtenant.us.auth0.com
   AUTH0_CLIENT_ID="your-auth0-web-app-client-id"
   AUTH0_CLIENT_SECRET="your-auth0-web-app-client-secret"
   AUTH0_BASE_URL="http://localhost:3000" # The base URL of your web app

   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:3001" # URL of your apps/api service
   \`\`\`
   **Note on `AUTH0_SECRET`**: Required by `@auth0/nextjs-auth0` for session encryption. If deploying to Vercel, this can often be set as an environment variable in the Vercel dashboard and the SDK might pick it up, especially for Edge functions.

### 3. For `apps/api`

   Create a `.env` file in the `apps/api` directory:
   **File: `apps/api/.env`**
   \`\`\`env
   # Server Configuration
   PORT=3001

   # Database URL (ensure this matches the one used for migrations/seeding)
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

   # Auth0 API Configuration (from your Auth0 API settings)
   AUTH0_API_ISSUER_BASE_URL="https://your-tenant.auth0.com" # Same as AUTH0_ISSUER_BASE_URL for web app
   AUTH0_API_AUDIENCE="your-api-identifier" # e.g., https://api.yourapp.com (this is the 'Identifier' in Auth0 API settings)
   \`\`\`

## Auth0 Setup Guide

You need to configure both an "Application" (for `apps/web`) and an "API" (for `apps/api`) in your Auth0 dashboard.

### 1. Auth0 Application (for `apps/web`)

   - Go to Auth0 Dashboard > Applications > Applications.
   - Click "Create Application".
   - Choose "Regular Web Application".
   - **Settings**:
     - **Allowed Callback URLs**: Add `http://localhost:3000/api/auth/callback` (replace `http://localhost:3000` with your `AUTH0_BASE_URL` if different, and for production).
     - **Allowed Logout URLs**: Add `http://localhost:3000` (replace with `AUTH0_BASE_URL` for production).
     - **Allowed Web Origins**: Add `http://localhost:3000`.
     - **Allowed Origins (CORS)**: Add `http://localhost:3000`.
     - Note the **Domain**, **Client ID**, and **Client Secret**. These are used in `apps/web/.env.local`.
   - **Connections**: Enable desired connections (e.g., Username-Password-Authentication, Google, GitHub social connections).

### 2. Auth0 API (for `apps/api`)

   - Go to Auth0 Dashboard > Applications > APIs.
   - Click "Create API".
   - **Name**: Your API name (e.g., "My App API").
   - **Identifier (Audience)**: A unique URI for your API (e.g., `https://api.myapp.com`). This will be your `AUTH0_API_AUDIENCE`.
   - **Signing Algorithm**: Ensure it's `RS256` (this is the default and what `express-oauth2-jwt-bearer` expects).
   - (Optional) Define permissions/scopes under the "Permissions" tab if your API requires fine-grained access control. The current setup does not use custom scopes but relies on a valid token.

## Monorepo Structure

-   \`apps/\`: Contains individual applications.
    -   \`web\`: Next.js frontend.
    -   \`api\`: Express.js backend.
-   \`packages/\`: Contains shared libraries.
    -   \`auth\`: Shared Auth0 configuration helpers/constants.
    -   \`db\`: Prisma schema, client, migrations, and seeding.
    -   \`eslint-config\`: Shared ESLint configurations.
    -   \`typescript-config\`: Shared TypeScript configurations.
    *   \`types\`: Shared Zod schemas and TypeScript types.
    -   \`ui\`: Shared React UI components (Shadcn UI).

## Packages Details

### `packages/auth`
   - Purpose: Provides centralized constants for Auth0 environment variable names.
   - Location: `packages/auth`

### `packages/db`
   - Purpose: Manages database schema, client generation, migrations, and seeding using Prisma.
   - Schema: Located at `packages/db/prisma/schema.prisma`. Defines `User` and `Post` models.
   - Client: Generated into `packages/db/generated/prisma` and exported by `packages/db/index.ts`.
   - Scripts:
     - `pnpm --filter @workspace/db db:generate`: Generates Prisma client.
     - `pnpm --filter @workspace/db db:migrate`: Applies database migrations.
     - `pnpm --filter @workspace/db db:seed`: Seeds the database with sample data.

### `packages/types`
   - Purpose: Defines shared Zod schemas for data validation and generates TypeScript types. Used by both `apps/web` and `apps/api`.
   - Location: `packages/types`
   - Example Schemas: `UserSchema`, `PostSchema`, `CreatePostSchema`.

### `packages/ui`
   - Purpose: Contains shared UI components built with Shadcn UI.
   - Location: `packages/ui`
   - Components are imported directly, e.g., `@workspace/ui/components/button`.

## Applications Details

### `apps/web` (Frontend)
   - Tech Stack: Next.js, React, TypeScript, Tailwind CSS, `@auth0/nextjs-auth0`.
   - UI: Uses components from `packages/ui`.
   - Functionality:
     - User authentication (login, logout, signup) via Auth0.
     - Displays user information.
     - Allows authenticated users to create, view, and delete posts by interacting with `apps/api`.
   - Running: `pnpm --filter web dev` (typically on `http://localhost:3000`).

### `apps/api` (Backend)
   - Tech Stack: Express.js, Node.js, TypeScript, Prisma, Zod, `express-oauth2-jwt-bearer`.
   - Functionality:
     - Provides RESTful CRUD endpoints for posts.
     - Endpoints are protected using Auth0 JWT authentication.
     - Validates request data using Zod schemas from `packages/types`.
     - Interacts with the PostgreSQL database via Prisma client from `packages/db`.
   - Running: `pnpm --filter api dev` (typically on `http://localhost:3001`).

## Available Scripts (Root Level)

-   \`pnpm install\`: Installs all dependencies for the monorepo.
-   \`pnpm dev\`: Runs all applications and packages in development mode (uses Turborepo).
-   \`pnpm build\`: Builds all applications and packages for production.
-   \`pnpm lint\`: Lints all code in the monorepo.
-   \`pnpm format\`: Formats code using Prettier.

## Development Workflow

1.  Ensure all prerequisites are met and environment variables are set up.
2.  Run `pnpm install` if you haven't already.
3.  Run `pnpm --filter @workspace/db db:migrate` if there are new database schema changes.
4.  (Optional) Run `pnpm --filter @workspace/db db:seed` to (re)seed data.
5.  Start the development servers: `pnpm dev`. This will typically start `apps/web` on port 3000 and `apps/api` on port 3001.
6.  Open `http://localhost:3000` in your browser to use the web application.

Contributions and improvements are welcome!
