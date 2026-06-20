import { FileText, Send, Briefcase, Plus, Clock, Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!user) {
    redirect('/login');
  }

  // Fetch stats
  const { data: applicationsData } = await supabase
    .from('Application')
    .select('*, job:JobDescription(*)')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false });

  const applications = (applicationsData || []) as any[];

  const { count: resumesCount } = await supabase
    .from('Resume')
    .select('*', { count: 'exact', head: true })
    .eq('userId', user.id)
    .eq('isOriginal', false);

  const { count: baseResumesCount } = await supabase
    .from('Resume')
    .select('*', { count: 'exact', head: true })
    .eq('userId', user.id)
    .eq('isOriginal', true);


  const autoSubmittedCount = applications.filter((app) => app.submissionMethod === 'Form_Assistant' || app.submissionMethod === 'Google_Forms').length;
  const interviewsCount = applications.filter((app) => app.status === 'Interview').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-foreground md:text-4xl">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 font-light text-sm">
            Welcome back, <span className="font-medium text-foreground">{(user.user_metadata.name || user.user_metadata.full_name || 'User').split(' ')[0]}</span>! Here's what's happening with your job search.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/resumes" className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground border border-border hover:bg-muted rounded-xl text-sm font-semibold transition-all duration-200 hover-lift">
            <Plus className="w-4 h-4 text-primary" />
            New Resume
          </Link>
          <Link href="/dashboard/jobs/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-sm font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg hover-lift">
            <Target className="w-4 h-4" />
            Tailor Application
          </Link>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Applications', value: applications.length, icon: Briefcase, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
          { title: 'Tailored Resumes', value: resumesCount, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Auto-Submitted', value: autoSubmittedCount, icon: Send, color: 'text-accent', bg: 'bg-accent/10' },
          { title: 'Interviews Scheduled', value: interviewsCount, icon: Target, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 shadow-sm border border-border/60 hover:border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{stat.title}</h3>
              <div className="text-3xl font-extrabold text-foreground mt-1 font-outfit">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Card */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-border/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-outfit text-foreground">Recent Applications</h2>
          </div>
          
          <div className="space-y-3.5">
            {applications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-light text-sm">
                No applications submitted yet. Start by tailoring a job.
              </div>
            ) : (
              applications.slice(0, 5).map((app, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-muted/30 transition-all duration-200 border border-border/40 hover:border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white text-sm shadow-sm select-none">
                      {app.job.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{app.job.title}</h4>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-foreground/80">{app.job.company}</span>
                        <span className="w-1 h-1 bg-muted-foreground/50 rounded-full"></span>
                        <span>{app.submissionMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      app.status === 'Applied' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                      app.status === 'Interview' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      app.status === 'Draft' ? 'bg-muted text-muted-foreground' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="glass-panel rounded-2xl p-6 border border-border/60 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold font-outfit text-foreground mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/dashboard/resumes" className="w-full flex items-center gap-3.5 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/40 hover:border-primary/20 transition-all duration-300 text-left group">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Upload Base Resume</div>
                  <div className="text-xs text-muted-foreground mt-0.5">PDF, DOCX, or TXT format</div>
                </div>
              </Link>
              <Link href="/dashboard/jobs/new" className="w-full flex items-center gap-3.5 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/40 hover:border-primary/20 transition-all duration-300 text-left group block">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-200">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Analyze Job Post</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Paste description or job link</div>
                </div>
              </Link>
              <Link href="/dashboard/settings" className="w-full flex items-center gap-3.5 p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/40 hover:border-primary/20 transition-all duration-300 text-left group block">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors duration-200">
                  <Send className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Auto-Apply Setup</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Configure details and extension</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
