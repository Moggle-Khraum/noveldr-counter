# noveldr-counter

A domain-neutral Node.js API foundation built with Express, TypeScript, OpenAPI, Zod, and Drizzle.

The project currently provides a small, production-oriented API shell with structured logging, health checks, consistent JSON errors, and generated API bindings. Domain-specific resources can be added on top of this foundation.

## API

The API is served under `/api`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/` | Service metadata |
| `GET` | `/api/healthz` | Liveness health check |

Unknown API routes return a JSON `404` response. Malformed JSON request bodies return `400`.

## Requirements

- Node.js 24+
- pnpm
- PostgreSQL for future persisted domain features

## Getting started

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
```

The API server expects `PORT` to be set. Replit's workflow supplies it automatically. For a local run:

```bash
PORT=5000 pnpm --filter @workspace/api-server run dev
```

## Development commands

```bash
# Check all TypeScript packages
pnpm run typecheck

# Build the API server
pnpm --filter @workspace/api-server run build

# Regenerate API clients and Zod schemas after changing OpenAPI
pnpm --filter @workspace/api-spec run codegen

# Push the development database schema
pnpm --filter @workspace/db run push
```

## Project structure

```text
artifacts/api-server/       Express API server
lib/api-spec/                OpenAPI source of truth
lib/api-zod/                 Generated Zod schemas
lib/api-client-react/        Generated client hooks
lib/db/                      Drizzle database package
scripts/                     Workspace utility scripts
```

## API contract workflow

1. Update `lib/api-spec/openapi.yaml`.
2. Run `pnpm --filter @workspace/api-spec run codegen`.
3. Add or update the corresponding route under `artifacts/api-server/src/routes/`.
4. Run `pnpm run typecheck`.

The generated files under `lib/api-zod/src/generated/` and `lib/api-client-react/src/generated/` should not be edited manually.

## Logging and errors

The API uses Pino for structured request logging. Authorization headers, cookies, and set-cookie response headers are redacted. Route handlers should use the request logger (`req.log`) rather than `console.log`.

## License

MIT