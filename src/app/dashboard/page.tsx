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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {(user.user_metadata.name || user.user_metadata.full_name || 'User').split(' ')[0]}! Here's what's happening with your job search.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/resumes" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-foreground border border-border hover:bg-muted rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Resume
          </Link>
          <Link href="/dashboard/jobs/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all shadow-glow hover:shadow-glow-lg">
            <Target className="w-4 h-4" />
            Tailor Application
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Applications', value: applications.length, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Tailored Resumes', value: resumesCount, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Auto-Submitted', value: autoSubmittedCount, icon: Send, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { title: 'Interviews', value: interviewsCount, icon: Target, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-muted-foreground text-sm font-medium">{stat.title}</h3>
              <div className="text-3xl font-bold text-foreground mt-1">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Applications</h2>
          </div>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No applications submitted yet.
              </div>
            ) : (
              applications.slice(0, 5).map((app, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center font-bold text-primary">
                      {app.job.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{app.job.title}</h4>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {app.job.company}
                        <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                        {app.submissionMethod}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${app.status === 'Applied' ? 'bg-blue-500/10 text-blue-500' :
                        app.status === 'Interview' ? 'bg-success/10 text-success' :
                          app.status === 'Draft' ? 'bg-muted text-muted-foreground' :
                            'bg-purple-500/10 text-purple-500'
                      }`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/resumes" className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left group block">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Upload Base Resume</div>
                  <div className="text-xs text-muted-foreground">PDF, DOCX, or TXT</div>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/jobs/new" className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left group block">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Target className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <div className="font-medium">Analyze Job Post</div>
                  <div className="text-xs text-muted-foreground">Paste URL or description</div>
                </div>
              </div>
            </Link>
            <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors text-left group">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Send className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="font-medium">Auto-Apply Setup</div>
                <div className="text-xs text-muted-foreground">Configure form filler</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
