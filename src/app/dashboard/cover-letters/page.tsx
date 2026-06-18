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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cover Letters</h1>
          <p className="text-muted-foreground mt-1">View and manage your AI-generated cover letters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coverLetters.length === 0 ? (
          <div className="col-span-1 md:col-span-2 glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">No cover letters generated</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              You haven't generated any cover letters yet. Start by analyzing a job and generating one.
            </p>
            <Link 
              href="/dashboard/jobs"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all"
            >
              <Briefcase className="w-4 h-4" />
              View Jobs
            </Link>
          </div>
        ) : (
          coverLetters.map((cl) => (
            <div key={cl.id} className="glass-panel p-6 rounded-2xl flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">{cl.job.company}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {cl.job.title}
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                  {cl.tone}
                </span>
              </div>
              
              <div className="flex-1 bg-background/50 border border-border p-4 rounded-xl text-sm text-muted-foreground mb-4 line-clamp-4 relative">
                {cl.content}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/80 to-transparent"></div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(cl.createdAt).toLocaleDateString()}
                </span>
                <Link 
                  href={`/dashboard/apply?jobId=${cl.jobId}`}
                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
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
