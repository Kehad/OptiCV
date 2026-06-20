import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Mail, Briefcase, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function CoverLettersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: coverLettersData } = await supabase
    .from('CoverLetter')
    .select('*, job:JobDescription(*)')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false });

  const coverLetters = (coverLettersData || []) as any[];


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-foreground md:text-4xl">Cover Letters</h1>
          <p className="text-muted-foreground mt-1 font-light text-sm">View and manage your AI-generated cover letters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coverLetters.length === 0 ? (
          <div className="col-span-1 md:col-span-2 glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center border border-border/60">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl font-outfit text-foreground">No cover letters generated</h3>
            <p className="text-slate-400 mt-2 max-w-sm font-light text-sm">
              You haven't generated any cover letters yet. Start by analyzing a job and generating one.
            </p>
            <Link 
              href="/dashboard/jobs"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-sm font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg hover-lift"
            >
              <Briefcase className="w-4 h-4" />
              View Jobs
            </Link>
          </div>
        ) : (
          coverLetters.map((cl) => (
            <div key={cl.id} className="glass-panel p-6 rounded-3xl flex flex-col h-full hover:-translate-y-1 hover:shadow-glow transition-all duration-300 border border-border/60 justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{cl.job.company}</h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-light">
                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                        {cl.job.title}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground rounded-full border border-border/40">
                    {cl.tone}
                  </span>
                </div>
                
                <div className="bg-muted/40 border border-border/40 p-4 rounded-2xl text-xs text-slate-500 dark:text-slate-400 mb-5 line-clamp-4 relative leading-relaxed font-sans font-light select-none">
                  {cl.content}
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card/85 to-transparent"></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-auto">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-light">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(cl.createdAt).toLocaleDateString()}
                </span>
                <Link 
                  href={`/dashboard/apply?jobId=${cl.jobId}`}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  Use to Apply
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
