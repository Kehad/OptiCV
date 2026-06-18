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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="text-muted-foreground mt-1">Manage your base resumes and tailored versions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Card */}
        <ResumeUploadButton />

        {/* Existing Resumes */}
        {resumes.map((resume) => (
          <div key={resume.id} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${!resume.isOriginal ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 line-clamp-2">{resume.title}</h3>
              <p className="text-xs text-muted-foreground">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                !resume.isOriginal ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {resume.isOriginal ? 'Base Resume' : 'Tailored'}
              </span>
              <button className="text-sm text-primary font-medium hover:underline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
