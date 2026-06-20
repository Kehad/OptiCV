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
    <div className="space-y-8 font-sans">
      {tailoredResumeId ? (
        <div className="text-center py-12 space-y-5 animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-glow">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold font-outfit text-foreground">Resume Tailored Successfully!</h2>
          <p className="text-muted-foreground text-sm font-light max-w-md mx-auto leading-relaxed">
            Your resume has been optimized with target keywords and aligned experience to match the job requirements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <button 
              onClick={() => router.push(`/dashboard/resumes`)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg hover-lift"
            >
              View Tailored Resume
            </button>
            <button 
              onClick={() => router.push(`/dashboard/cover-letter?jobId=${jobId}`)}
              className="w-full sm:w-auto px-6 py-3 bg-card text-foreground border border-border hover:bg-muted rounded-xl text-sm font-semibold transition-all duration-200 hover-lift"
            >
              Generate Cover Letter
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="font-bold text-lg font-outfit text-foreground">Select Base Resume</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {baseResumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => setSelectedResume(resume.id)}
                  className={`p-5 border rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${
                    selectedResume === resume.id
                      ? "border-primary bg-primary/5 shadow-glow"
                      : "border-border hover:border-primary/30 bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors duration-300 ${selectedResume === resume.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-foreground">{resume.title}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 font-light">Original Base Version</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleTailor}
            disabled={isTailoring || !selectedResume}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-xl text-base hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg disabled:opacity-75 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6"
          >
            {isTailoring ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Tailoring Resume with AI...
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
