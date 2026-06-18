import { JobAnalyzerForm } from '@/components/dashboard/JobAnalyzerForm';

export default function NewJobPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyze Job Description</h1>
        <p className="text-muted-foreground mt-1">Paste a job posting or provide a URL to extract requirements and get your match score.</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <JobAnalyzerForm />
      </div>
    </div>
  );
}
