import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Briefcase, Building, ExternalLink, Target, CheckCircle2, ChevronRight, FileText, Send } from 'lucide-react';
import Link from 'next/link';

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }
  const { id } = await params;

  const { data: job } = await supabase
    .from('JobDescription')
    .select('*')
    .eq('id', id)
    .eq('userId', user.id)
    .maybeSingle();


  if (!job) {
    notFound();
  }

  const extractedData = job.extractedSkills as any;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Header Widget */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-border/60 shadow-md">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-primary">
          <Briefcase className="w-56 h-56" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-2xl text-white shadow-md flex-shrink-0 select-none">
              {job.company.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-outfit text-foreground md:text-3xl">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1.5 font-semibold text-foreground/80">
                  <Building className="w-4 h-4 text-primary" />
                  {job.company}
                </span>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline font-semibold">
                    <ExternalLink className="w-4 h-4" />
                    View Original Posting
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center bg-card/60 p-4 px-6 rounded-2xl border border-border/60 shadow-sm min-w-[140px]">
            <div className="text-3xl font-extrabold text-foreground font-outfit">
              {job.matchScore ?? '--'}%
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1">Match Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-6 rounded-3xl border border-border/60">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground font-outfit border-b border-border/40 pb-4">
              <Target className="w-5 h-5 text-primary" />
              Required Skills & Keywords
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {extractedData?.skills?.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                  {(!extractedData?.skills || extractedData.skills.length === 0) && (
                    <span className="text-muted-foreground text-xs font-light">No skills extracted.</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {extractedData?.keywords?.map((kw: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-muted/80 text-foreground/80 rounded-full text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Qualifications</h3>
                  <ul className="space-y-2.5">
                    {extractedData?.qualifications?.map((qual: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{qual}</span>
                      </li>
                    ))}
                    {(!extractedData?.qualifications || extractedData.qualifications.length === 0) && (
                      <li className="text-muted-foreground text-xs font-light">No specific qualifications listed.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">ATS Requirements</h3>
                  <ul className="space-y-2.5">
                    {extractedData?.atsRequirements?.map((req: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                        <Target className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                    {(!extractedData?.atsRequirements || extractedData.atsRequirements.length === 0) && (
                      <li className="text-muted-foreground text-xs font-light">No strict ATS requirements identified.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-border/60">
            <h2 className="text-lg font-bold mb-4 font-outfit text-foreground">Job Description</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none max-h-[400px] overflow-y-auto pr-4 custom-scrollbar text-slate-600 dark:text-slate-400 font-sans font-light leading-relaxed whitespace-pre-wrap text-sm">
              {job.description}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-border/60 shadow-sm">
            <h2 className="text-lg font-bold mb-5 font-outfit text-foreground">Actions</h2>
            <div className="space-y-3">
              <Link href={`/dashboard/tailor?jobId=${job.id}`} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg group hover-lift">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-white" />
                  <span className="font-semibold text-sm">Tailor Resume</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <Link href={`/dashboard/cover-letter?jobId=${job.id}`} className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition-all duration-200 group hover-lift">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  <span className="font-semibold text-sm text-foreground">Generate Cover Letter</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <Link href={`/dashboard/apply?jobId=${job.id}`} className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition-all duration-200 group hover-lift">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-sm text-foreground">Auto-Apply</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
