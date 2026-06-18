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
    <div className="space-y-6">
      <div className="flex bg-muted p-1 rounded-xl w-full max-w-md mx-auto mb-8">
        {[
          { id: "text", label: "Paste Text", icon: FileText },
          { id: "url", label: "URL", icon: LinkIcon },
          { id: "file", label: "Upload File", icon: UploadCloud },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              required
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>

        {activeTab === "text" && (
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Job Description</label>
            <textarea
              id="description"
              name="description"
              required
              rows={8}
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y"
              placeholder="Paste the full job description here..."
            />
          </div>
        )}

        {activeTab === "url" && (
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">Job Posting URL</label>
            <input
              type="url"
              id="url"
              name="url"
              required
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="https://..."
            />
          </div>
        )}

        {activeTab === "file" && (
          <div className="space-y-2">
            <label htmlFor="file" className="text-sm font-medium">Upload Job Description</label>
            <div className="w-full p-8 bg-background border-2 border-dashed border-border rounded-xl text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="file"
                name="file"
                required
                accept=".pdf,.docx,.txt"
                className="mx-auto"
              />
              <p className="text-xs text-muted-foreground mt-4">Supported formats: PDF, DOCX, TXT</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Job Requirements"
          )}
        </button>
      </form>
    </div>
  );
}
