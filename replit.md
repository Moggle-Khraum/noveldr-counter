# Node.js API

An Express API for tracking online NovelDR sessions, with Discord status updates, health checks, structured logging, and OpenAPI-generated client contracts.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/app.ts` — Express middleware and shared error handling
- `artifacts/api-server/src/routes/` — route modules
- `lib/api-spec/openapi.yaml` — source of truth for API contracts
- `lib/api-zod/` and `lib/api-client-react/` — generated validation and client packages
- `lib/db/` — Drizzle/PostgreSQL package for future domain persistence

## Architecture decisions

- API routes are mounted under `/api` so the service can share the workspace proxy with future artifacts.
- OpenAPI is the contract source of truth; generated Zod schemas validate server responses.
- Online sessions are held in memory because the current counter represents live presence, not durable user records.
- Discord updates are optional and enabled through `DISCORD_WEBHOOK_URL`.
- Structured Pino logging is used for request correlation and sensitive-header redaction.

## Product

The service exposes API metadata, a liveness check, and join/leave endpoints that track the current online NovelDR session count. When configured, the count is reflected in a Discord webhook message.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
