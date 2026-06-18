# API Documentation

All routes require an authenticated NextAuth session unless noted.

## Auth

### `POST /api/auth/register`

Create an email/password account.

```json
{
  "name": "Alex Morgan",
  "email": "alex@example.com",
  "password": "password123"
}
```

## Resumes

### `GET /api/resumes`

Returns all resume records and versions for the current user.

### `POST /api/resumes`

Multipart form upload.

Fields:

- `title`
- `file`: PDF, DOCX, or TXT

Creates a parsed resume plus an `ORIGINAL` resume version.

### `GET /api/resumes/:id`

Returns one resume with versions.

### `PATCH /api/resumes/:id`

Updates extracted editable profile fields.

## Jobs

### `GET /api/jobs`

Returns analyzed jobs with generated assets.

### `POST /api/jobs/analyze`

Analyzes a job description and stores skills, ATS requirements, keywords, missing skills, and match score.

```json
{
  "resumeId": "optional",
  "companyName": "Acme",
  "title": "Senior Product Engineer",
  "location": "Remote",
  "postingUrl": "https://example.com/job",
  "sourceText": "Full job description..."
}
```

## AI Generation

### `POST /api/tailor/resume`

Creates ATS and human-readable resume versions.

```json
{
  "resumeId": "resume_id",
  "jobId": "job_id"
}
```

### `POST /api/cover-letter`

Creates a tailored cover letter.

```json
{
  "resumeId": "resume_id",
  "jobId": "job_id",
  "tone": "PROFESSIONAL"
}
```

Tones: `PROFESSIONAL`, `FORMAL`, `FRIENDLY`, `STARTUP`, `EXECUTIVE`.

## Applications

### `GET /api/applications`

Returns application drafts and statuses.

### `POST /api/applications`

Creates an application draft.

```json
{
  "jobId": "job_id",
  "resumeId": "resume_id",
  "method": "FORM",
  "automationUrl": "https://company.example/apply"
}
```

Methods: `EMAIL`, `FORM`, `GOOGLE_FORM`, `MANUAL`.

### `PATCH /api/applications/:id/status`

Updates pipeline status and records an event.

```json
{
  "status": "INTERVIEW",
  "note": "Recruiter screen scheduled."
}
```

Statuses: `DRAFT`, `SUBMITTED`, `INTERVIEW`, `REJECTED`, `OFFER`.

## Submission

### `POST /api/submissions/email`

Sends an application email when SMTP is configured. If SMTP is missing, the route leaves the application in draft and returns a skipped status.

```json
{
  "applicationId": "application_id",
  "recruiterEmail": "recruiter@example.com",
  "subject": "Application for Senior Product Engineer",
  "notes": "Thank you for reviewing my application."
}
```

## Automation

### `POST /api/automation/inspect-form`

Uses Playwright to inspect application fields and returns an AI field mapping preview. It never submits the form.

```json
{
  "applicationId": "application_id",
  "url": "https://company.example/apply"
}
```

## Export

### `GET /api/export/resume/:versionId/docx`

Downloads a generated resume version as DOCX.

