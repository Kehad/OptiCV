import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { TailorResumeForm } from '@/components/dashboard/TailorResumeForm';

export default async function TailorResumePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string; baseResumeId?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { jobId } = await searchParams;

  if (!jobId) {
    // If no jobId provided, they should select a job first
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

  const { data: baseResumesData } = await supabase
    .from('Resume')
    .select('*')
    .eq('userId', user.id)
    .eq('isOriginal', true)
    .order('createdAt', { ascending: false });

  const baseResumes = (baseResumesData || []) as any[];


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tailor Your Resume</h1>
        <p className="text-muted-foreground mt-1">
          Optimizing your resume for <strong>{job.title}</strong> at <strong>{job.company}</strong>.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <TailorResumeForm jobId={job.id} baseResumes={baseResumes} />
      </div>
    </div>
  );
}
