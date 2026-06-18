"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";

export function TailorResumeForm({
  jobId,
  baseResumes,
}: {
  jobId: string;
  baseResumes: { id: string; title: string }[];
}) {
  const [selectedResume, setSelectedResume] = useState<string>(
    baseResumes[0]?.id || ""
  );
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResumeId, setTailoredResumeId] = useState<string | null>(null);
  const router = useRouter();

  const handleTailor = async () => {
    if (!selectedResume) return;

    setIsTailoring(true);
    setTailoredResumeId(null);

    try {
      const response = await fetch("/api/resumes/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, baseResumeId: selectedResume }),
      });

      if (!response.ok) {
        throw new Error("Failed to tailor resume");
      }

      const data = await response.json();
      setTailoredResumeId(data.resume.id);
      
      // We could redirect to a resume preview page, or just show success here.
      // router.push(`/dashboard/resumes/${data.resume.id}`);
    } catch (error) {
      console.error(error);
      alert("An error occurred while tailoring the resume.");
    } finally {
      setIsTailoring(false);
    }
  };

  if (baseResumes.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="font-semibold text-lg mb-2">No Base Resumes Found</h3>
        <p className="text-muted-foreground mb-6">
          You need to upload at least one base resume before you can tailor it for a job.
        </p>
        <button
          onClick={() => router.push("/dashboard/resumes")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Go to Resumes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {tailoredResumeId ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold">Resume Tailored Successfully!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your resume has been optimized with keywords and relevant experience matching the job description.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={() => router.push(`/dashboard/resumes`)} // TODO: link to view resume
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-glow"
            >
              View Tailored Resume
            </button>
            <button 
              onClick={() => router.push(`/dashboard/cover-letter?jobId=${jobId}`)}
              className="px-6 py-3 bg-white text-foreground border border-border hover:bg-muted rounded-xl font-bold transition-colors"
            >
              Generate Cover Letter
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Base Resume</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {baseResumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => setSelectedResume(resume.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                    selectedResume === resume.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedResume === resume.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{resume.title}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleTailor}
            disabled={isTailoring || !selectedResume}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isTailoring ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Tailoring Resume...
              </>
            ) : (
              "Tailor with AI"
            )}
          </button>
        </>
      )}
    </div>
  );
}
