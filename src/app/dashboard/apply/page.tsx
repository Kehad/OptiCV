import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ApplyForm } from '@/components/dashboard/ApplyForm';

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { jobId } = await searchParams;

  if (!jobId) {
    redirect('/dashboard/jobs');
  }

  const { data: job } = await supabase
    .from('JobDescription')
    .select('*')
    .eq('id', jobId)
    .eq('userId', user.id)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  const { data: resumesData } = await supabase
    .from('Resume')
    .select('*')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false });

  const resumes = (resumesData || []) as any[];

  const { data: coverLettersData } = await supabase
    .from('CoverLetter')
    .select('*')
    .eq('userId', user.id)
    .eq('jobId', job.id)
    .order('createdAt', { ascending: false });

  const coverLetters = (coverLettersData || []) as any[];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit Application</h1>
        <p className="text-muted-foreground mt-1">
          Apply for <strong>{job.title}</strong> at <strong>{job.company}</strong> via Email or Form Autofill.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <ApplyForm 
          job={job} 
          resumes={resumes} 
          coverLetters={coverLetters} 
          userEmail={user.email || ""} 
          userName={user.user_metadata.name || user.user_metadata.full_name || ""} 
        />
      </div>
    </div>
  );
}

