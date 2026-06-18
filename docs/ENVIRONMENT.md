# Environment Setup

Copy `.env.example` to `.env`.

## Required

### `DATABASE_URL`

PostgreSQL connection string.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resume_tailor"
```

### `NEXTAUTH_URL`

Base app URL.

```env
NEXTAUTH_URL="http://localhost:3000"
```

### `NEXTAUTH_SECRET`

Random secret used by NextAuth.

```bash
openssl rand -base64 32
```

## AI

### `OPENAI_API_KEY`

OpenAI API key for resume parsing, job analysis, tailoring, cover letters, and form mapping.

### `OPENAI_MODEL`

Defaults to the requested `gpt-5.5`. Change this to the model available in your OpenAI account if needed.

## Storage

### `SUPABASE_URL`

Supabase project URL.

### `SUPABASE_SERVICE_ROLE_KEY`

Service role key used server-side only.

### `SUPABASE_STORAGE_BUCKET`

Defaults to `application-documents`.

## Email

### `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`

Used by `/api/submissions/email`. If omitted, email submission returns `skipped` and keeps the application as a draft.

## Automation

### `APPROVE_FINAL_SUBMISSION`

Keep this `false` by default. Production form submission should require a separate explicit user approval flow.

