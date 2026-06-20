"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Link as LinkIcon, FileText, UploadCloud } from "lucide-react";

export function JobAnalyzerForm() {
  const [activeTab, setActiveTab] = useState<"text" | "url" | "file">("text");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("type", activeTab);

    try {
      const response = await fetch("/api/jobs/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze job");
      }

      const data = await response.json();
      router.push(`/dashboard/jobs/${data.job.id}`);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze job description.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex bg-muted/60 p-1.5 rounded-2xl w-full max-w-md mx-auto mb-8 border border-border/40 backdrop-blur-sm">
        {[
          { id: "text", label: "Paste Text", icon: FileText },
          { id: "url", label: "URL Link", icon: LinkIcon },
          { id: "file", label: "Upload File", icon: UploadCloud },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-md border border-border/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full p-3 bg-card border border-border/80 rounded-xl text-sm placeholder-slate-400 focus:bg-background outline-none transition-all duration-200"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="company" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              required
              className="w-full p-3 bg-card border border-border/80 rounded-xl text-sm placeholder-slate-400 focus:bg-background outline-none transition-all duration-200"
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>

        {activeTab === "text" && (
          <div className="space-y-2 animate-fade-in">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Description</label>
            <textarea
              id="description"
              name="description"
              required
              rows={8}
              className="w-full p-3.5 bg-card border border-border/80 rounded-xl text-sm placeholder-slate-400 focus:bg-background outline-none transition-all duration-200 resize-y custom-scrollbar font-light leading-relaxed"
              placeholder="Paste the full job description here..."
            />
          </div>
        )}

        {activeTab === "url" && (
          <div className="space-y-2 animate-fade-in">
            <label htmlFor="url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Posting URL</label>
            <input
              type="url"
              id="url"
              name="url"
              required
              className="w-full p-3 bg-card border border-border/80 rounded-xl text-sm placeholder-slate-400 focus:bg-background outline-none transition-all duration-200"
              placeholder="https://company.com/careers/senior-frontend-developer"
            />
          </div>
        )}

        {activeTab === "file" && (
          <div className="space-y-2 animate-fade-in">
            <label htmlFor="file" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload Job Description</label>
            <div className="w-full p-10 bg-card border-2 border-dashed border-border hover:border-primary/40 rounded-2xl text-center transition-all duration-300 relative cursor-pointer group shadow-sm">
              <input
                type="file"
                id="file"
                name="file"
                required
                accept=".pdf,.docx,.txt"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-sm text-foreground">Select Job Description File</h4>
              <p className="text-xs text-muted-foreground mt-2 font-light">Supported formats: PDF, DOCX, TXT up to 5MB</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-xl text-base hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg disabled:opacity-75 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Job Posting...
            </>
          ) : (
            "Analyze Job Requirements"
          )}
        </button>
      </form>
    </div>
  );
}
