import { FileText, Plus, Target, Briefcase, ExternalLink, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: jobsData } = await supabase
    .from('JobDescription')
    .select('*')
    .eq('userId', user.id)
    .order('updatedAt', { ascending: false });

  const jobs = jobsData || [];


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Opportunities</h1>
          <p className="text-muted-foreground mt-1">Analyze job descriptions and calculate match scores.</p>
        </div>
        <Link 
          href="/dashboard/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all shadow-glow hover:shadow-glow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">No jobs added yet</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Start by pasting a job description, providing a URL, or uploading a job description file to analyze match scores.
            </p>
            <Link 
              href="/dashboard/jobs/new"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white text-foreground border border-border hover:bg-muted rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Job
            </Link>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex flex-shrink-0 items-center justify-center font-bold text-2xl text-primary">
                {job.company.charAt(0)}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-xl mb-1">{job.title}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job.company}
                  </span>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" />
                      View Posting
                    </a>
                  )}
                  <span>Added {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 min-w-[120px]">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {job.matchScore ?? '--'}%
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Match Score</div>
                </div>
              </div>

              <Link 
                href={`/dashboard/jobs/${job.id}`}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
