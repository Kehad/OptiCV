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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-foreground md:text-4xl">Job Opportunities</h1>
          <p className="text-muted-foreground mt-1 font-light text-sm">Analyze job descriptions and calculate match scores.</p>
        </div>
        <Link 
          href="/dashboard/jobs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-sm font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg hover-lift"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </Link>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center border border-border/60">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl font-outfit text-foreground">No jobs added yet</h3>
            <p className="text-slate-400 mt-2 max-w-sm font-light text-sm">
              Start by pasting a job description, providing a URL, or uploading a file to analyze ATS match scores.
            </p>
            <Link 
              href="/dashboard/jobs/new"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-card hover:bg-muted text-foreground border border-border rounded-xl text-sm font-semibold transition-all duration-200 hover-lift"
            >
              <Plus className="w-4 h-4 text-primary" />
              Add Your First Job
            </Link>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center gap-6 border border-border/60 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex flex-shrink-0 items-center justify-center font-bold text-xl text-white shadow-sm select-none">
                {job.company.charAt(0)}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-lg text-foreground mb-0.5">{job.title}</h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Briefcase className="w-3.5 h-3.5" />
                    {job.company}
                  </span>
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline font-semibold">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Posting
                    </a>
                  )}
                  <span>Added {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 min-w-[140px] justify-center md:justify-end">
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-foreground font-outfit">
                    {job.matchScore ?? '--'}%
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Match Score</div>
                </div>
                
                <Link 
                  href={`/dashboard/jobs/${job.id}`}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-muted/60 hover:bg-primary hover:text-white transition-all duration-200 flex-shrink-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
