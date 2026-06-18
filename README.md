# OptiCV (formerly Tailor AI)

An AI-powered Full-Stack Resume Tailoring & Job Application Assistant. This application automates the tedious process of tailoring resumes for every job description, generating specific cover letters, and even auto-submitting applications.

## Features

- **Resume Upload & Management:** Store multiple resumes in PDF/DOCX formats.
- **Job Description Analysis:** Extracts skills and computes matching scores against your base resume using OpenAI.
- **AI Resume Tailoring:** Tailors your experience to highlight matches with the JD while maintaining ATS readability.
- **AI Cover Letter Generation:** Configurable tones (Professional, Startup, Friendly).
- **Application Dashboard:** Kanban/List tracking of all applied jobs.
- **Authentication:** Secure email/password login using NextAuth v5 & Prisma.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** Next.js API Routes.
- **Database:** PostgreSQL with Prisma ORM.
- **Authentication:** NextAuth v5 (Auth.js) with Credentials provider.
- **AI Integration:** OpenAI GPT API (gpt-4o / gpt-3.5-turbo).
- **Automation (Upcoming):** Playwright for form filling.

## Getting Started

### 1. Environment Variables
Copy `.env.example` to `.env` and configure your credentials:
```bash
cp .env.example .env
```
Ensure you have a running PostgreSQL database and provide the `DATABASE_URL`. Generate a secret for `NEXTAUTH_SECRET` using `openssl rand -base64 32`.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Push the schema to your database and generate the Prisma client:
```bash
npm run db:push
npm run db:generate
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

## Clean Architecture & Design System
This project utilizes a highly premium, animated dark/light glassmorphic UI design system implemented strictly with Tailwind CSS variables in `globals.css` and `tailwind.config.ts`. 

- `/src/app`: Contains Next.js App Router pages and API routes.
- `/src/components`: Contains reusable UI layout components (Sidebar, Header).
- `/src/lib`: Contains core utilities like Prisma instantiation.
- `/prisma`: Contains the database schema.

## Deployment Instructions

### Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Go to Vercel and import the repository.
3. In the environment variables section, add all variables from your `.env`.
4. Deploy! Vercel will automatically run `npm run build`. 
*Note:* Ensure you add a `postinstall` script in package.json for `prisma generate` if you experience build issues.

### Database Hosting
Use Supabase or Railway to spin up a managed PostgreSQL database, and use that connection string in your Vercel `DATABASE_URL`.
