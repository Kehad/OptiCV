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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Briefcase className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center font-bold text-4xl text-primary flex-shrink-0">
              {job.company.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-2">
                <span className="flex items-center gap-1 font-medium">
                  <Building className="w-4 h-4" />
                  {job.company}
                </span>
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    View Original Posting
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center bg-background/50 p-4 rounded-xl border border-border backdrop-blur-sm min-w-[150px]">
            <div className="text-4xl font-bold text-foreground flex items-center gap-2">
              {job.matchScore ?? '--'}%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Match Score</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Required Skills & Keywords
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {extractedData?.skills?.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                  {(!extractedData?.skills || extractedData.skills.length === 0) && (
                    <span className="text-muted-foreground text-sm">No skills extracted.</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {extractedData?.keywords?.map((kw: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Qualifications</h3>
                <ul className="space-y-2">
                  {extractedData?.qualifications?.map((qual: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Job Description</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none max-h-[500px] overflow-y-auto pr-4 custom-scrollbar whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <div className="space-y-3">
              <Link href={`/dashboard/tailor?jobId=${job.id}`} className="w-full flex items-center justify-between p-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-glow hover:shadow-glow-lg group">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold">Tailor Resume</span>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href={`/dashboard/cover-letter?jobId=${job.id}`} className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-muted transition-all group">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Generate Cover Letter</span>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link href={`/dashboard/apply?jobId=${job.id}`} className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-muted transition-all group">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Auto-Apply</span>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
