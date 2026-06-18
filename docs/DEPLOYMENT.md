# Deployment

## Local

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

## Database

Use managed PostgreSQL in production. Run migrations during deployment:

```bash
npm run db:migrate
```

## Vercel

1. Create a PostgreSQL database.
2. Create a Supabase bucket named `application-documents`.
3. Add all variables from `.env.example`.
4. Install Playwright browser dependencies if automation routes are enabled in the hosting environment.
5. Set build command:

```bash
npm run build
```

## Docker-Friendly Notes

Playwright automation needs browser binaries and OS dependencies. For container deployment, install:

```bash
npx playwright install --with-deps chromium
```

Run the automation routes on a Node.js runtime, not Edge.

## Production Hardening

- Move agent execution to a background queue.
- Add rate limits to upload, AI, email, and automation routes.
- Add virus scanning for uploaded documents.
- Add audit logs for submission attempts.
- Add final human approval records for any real form submission.
- Store generated PDF/DOCX exports in Supabase and attach signed URLs.

