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
    <div className="space-y-8">
      {generatedLetter ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your Generated Cover Letter</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy text"}
              </button>
              <button
                onClick={() => router.push(`/dashboard/apply?jobId=${jobId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-colors shadow-glow"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl bg-muted/30 whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar">
            {generatedLetter}
          </div>
          <button
            onClick={() => setGeneratedLetter(null)}
            className="text-sm text-primary hover:underline"
          >
            Generate another version
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Select Resume to use
              </h3>
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title} {resume.isOriginal ? "(Base)" : "(Tailored)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-purple-500" />
                Select Tone
              </h3>
              <div className="flex flex-wrap gap-3">
                {TONES.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTone === tone
                        ? "bg-purple-500/20 text-purple-500 border border-purple-500/50"
                        : "bg-muted text-muted-foreground border border-transparent hover:border-border"
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
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Writing Cover Letter...
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
