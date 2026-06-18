# Architecture

## Layers

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: reusable UI, dashboard widgets, and workflow forms.
- `src/lib/ai`: autonomous agent orchestration and prompts.
- `src/lib/parsers`: PDF, DOCX, and TXT resume parsing.
- `src/lib/automation`: Playwright form inspection and mapping preview.
- `src/lib/storage`: Supabase Storage integration.
- `src/lib/email`: SMTP application email sender.
- `prisma/schema.prisma`: database schema and domain model.

## Agents

### Resume Agent

Tailors resumes into ATS and human-readable versions. It is constrained to supported resume facts and records output in `ResumeVersion`.

### Cover Letter Agent

Generates tone-specific cover letters with relevant achievements from the resume and job analysis.

### Application Agent

Inspects application forms, extracts fields, and maps resume/profile data to answers. It produces a preview requiring user approval.

### Tracking Agent

Represented by application events and statuses. The schema supports scheduled status checks or inbox integrations later.

## Data Flow

1. User uploads resume.
2. Parser extracts raw text.
3. AI extraction stores editable structured profile data.
4. User analyzes a job description.
5. AI analysis stores ATS keywords and match score.
6. Tailoring generates resume versions and cover letters.
7. Application draft links job, resume, generated documents, method, and automation preview.
8. User reviews before submission or manual status change.

## Scalability Notes

- Long-running AI and automation work is isolated behind agent functions and `AgentRun`.
- Agent runs can move to a queue such as BullMQ, Inngest, Trigger.dev, or Temporal without changing route contracts.
- File storage is abstracted through Supabase Storage.
- Prisma relations are user-scoped and cascade on account deletion.
- The API routes are intentionally thin; business logic lives in `src/lib`.

