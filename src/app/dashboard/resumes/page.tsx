import { FileText, UploadCloud, MoreVertical } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ResumeUploadButton } from '@/components/dashboard/ResumeUploadButton';
import { redirect } from 'next/navigation';

export default async function ResumesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: resumesData } = await supabase
    .from('Resume')
    .select('*')
    .eq('userId', user.id)
    .order('updatedAt', { ascending: false });

  const resumes = resumesData || [];


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-foreground md:text-4xl">Resumes</h1>
          <p className="text-muted-foreground mt-1 font-light text-sm">Manage your base resumes and tailored versions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Card */}
        <ResumeUploadButton />

        {/* Existing Resumes */}
        {resumes.map((resume) => (
          <div key={resume.id} className="glass-panel p-6 rounded-3xl hover:-translate-y-1 hover:shadow-glow transition-all duration-300 flex flex-col h-full border border-border/60 justify-between">
            <div>
              <div className="flex justify-between items-start mb-5">
                <div className={`p-3 rounded-2xl ${!resume.isOriginal ? 'bg-primary/10 text-primary shadow-sm' : 'bg-muted/80 text-muted-foreground'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-2">{resume.title}</h3>
                <p className="text-[11px] text-muted-foreground font-light">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex items-center justify-between mt-auto">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                !resume.isOriginal ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {resume.isOriginal ? 'Base Resume' : 'Tailored'}
              </span>
              <button className="text-xs text-primary font-bold hover:underline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
