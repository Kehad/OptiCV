"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FileText, Settings2, Copy, Check } from "lucide-react";

const TONES = [
  "Professional",
  "Formal",
  "Friendly",
  "Startup-focused",
  "Executive",
];

export function CoverLetterForm({
  jobId,
  resumes,
}: {
  jobId: string;
  resumes: { id: string; title: string; isOriginal: boolean }[];
}) {
  const [selectedResume, setSelectedResume] = useState<string>(
    resumes[0]?.id || ""
  );
  const [selectedTone, setSelectedTone] = useState<string>("Professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!selectedResume) return;

    setIsGenerating(true);
    setGeneratedLetter(null);

    try {
      const response = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, resumeId: selectedResume, tone: selectedTone }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const data = await response.json();
      setGeneratedLetter(data.coverLetter.content);
    } catch (error) {
      console.error(error);
      alert("An error occurred while generating the cover letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="font-semibold text-lg mb-2">No Resumes Found</h3>
        <p className="text-muted-foreground mb-6">
          You need a resume to base the cover letter on.
        </p>
        <button
          onClick={() => router.push("/dashboard/resumes")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium"
        >
          Upload Resume
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {generatedLetter ? (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold font-outfit text-foreground">Your Generated Cover Letter</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-card hover:bg-muted text-foreground border border-border rounded-xl text-xs font-semibold transition-all duration-200 hover-lift"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy text"}
              </button>
              <button
                onClick={() => router.push(`/dashboard/apply?jobId=${jobId}`)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg hover-lift"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-3xl bg-muted/40 text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar border border-border/60 shadow-sm leading-[1.6]">
            {generatedLetter}
          </div>
          <button
            onClick={() => setGeneratedLetter(null)}
            className="text-xs font-bold text-primary hover:underline"
          >
            Generate another version
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-foreground font-outfit">
                <FileText className="w-5 h-5 text-primary" />
                Select Resume Source
              </h3>
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200"
              >
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title} {resume.isOriginal ? "(Base)" : "(Tailored)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-base flex items-center gap-2 text-foreground font-outfit">
                <Settings2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                Select Writing Tone
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {TONES.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      selectedTone === tone
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground border border-transparent hover:border-border/30"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedResume}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-xl text-base hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg disabled:opacity-75 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-6"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Cover Letter...
              </>
            ) : (
              "Generate with AI"
            )}
          </button>
        </>
      )}
    </div>
  );
}
