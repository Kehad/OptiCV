# Automation Safety

The application is designed around preview-first automation.

## Form Filling Assistant

`/api/automation/inspect-form` launches Playwright, extracts visible `input`, `textarea`, and `select` fields, asks the AI mapping agent to propose answers, and stores the preview on the application draft.

The current route does not submit forms.

## Google Forms

Google Forms are detected when the URL host includes `docs.google.com`. The same inspection route extracts questions and returns suggested answers.

## Submission Guardrails

- Never auto-click final submit in the default workflow.
- Keep `APPROVE_FINAL_SUBMISSION=false` unless a separate reviewed approval workflow is implemented.
- Store every automation preview in `Application.automationPreview`.
- Store every agent attempt in `AgentRun`.
- Show unmapped fields and warnings to the user before any action.

## Recommended Next Step

Add a dedicated `POST /api/automation/execute-approved-form` route that requires:

- application id
- saved preview id or hash
- explicit approval checkbox timestamp
- final field mapping payload
- browser recording or screenshot evidence

