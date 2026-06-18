import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { CoverLetterForm } from '@/components/dashboard/CoverLetterForm';

export default async function CoverLetterPage({
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


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Cover Letter</h1>
        <p className="text-muted-foreground mt-1">
          Create a highly personalized cover letter for <strong>{job.title}</strong> at <strong>{job.company}</strong>.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <CoverLetterForm jobId={job.id} resumes={resumes} />
      </div>
    </div>
  );
}
