# Kankalar Talk API

NestJS modular monolith for the Kankalar Talk REST API. It targets Node.js 24 LTS and uses npm, PostgreSQL, Prisma ORM 7, Jest, and OpenAPI/Swagger. No AI provider, authentication mechanism, complete conversation schema, audio feature, or payment system is configured.

## Requirements

- Node.js 24 LTS and npm
- A locally available PostgreSQL instance and a database named `kankalar_talk`

No database is bundled or simulated by this project.

## Local setup

From `apps/api`:

```sh
npm ci
cp .env.example .env
```

Adjust `DATABASE_URL` in the local, ignored `.env` file to match your PostgreSQL instance. Do not put credentials in Git or the mobile app.

The Prisma schema intentionally contains no conversation or message models yet. Review those models before adding them or applying migrations. Generate the initial Prisma client and start the API:

```sh
npm run prisma:generate
npm run start:dev
```

The service listens on `http://localhost:3000` by default. `GET /v1/health` is the health endpoint, Swagger UI is at `/docs`, and its OpenAPI JSON is at `/openapi.json`.

The API connects to PostgreSQL during startup. Set `PORT` to change the listening port.

## Checks

```sh
npm test
npm run test:e2e
npm run lint
npm run build
```

The tests use a mocked Prisma provider and do not require a running database. Prisma generation reads `DATABASE_URL` from `.env` or the environment; it does not connect to the database.

## Initial module boundaries

- `health`: non-sensitive service health endpoint.
- `conversations`: reserved for conversation APIs and persistence after schema review.
- `dialogue-coordinator`: role selection and conversation-turn orchestration boundary.
- `ai`: provider-neutral conversation engine port with a temporary mock adapter.
- `usage`: reserved for usage recording and limits; no fake quota or billing behavior.

Eren and Elif instructions are held by the dialogue-coordinator and passed to the AI port as request data. The AI adapter does not own character instructions. The mock adapter is only for local/test scaffolding and is not an educational content source.
