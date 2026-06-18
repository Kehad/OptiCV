"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, LayoutTemplate, Send, CheckCircle2, AlertCircle } from "lucide-react";

export function ApplyForm({
  job,
  resumes,
  coverLetters,
  userEmail,
  userName,
}: {
  job: any;
  resumes: any[];
  coverLetters: any[];
  userEmail: string;
  userName: string;
}) {
  const [method, setMethod] = useState<"email" | "form">("email");
  const [selectedResume, setSelectedResume] = useState<string>(resumes[0]?.id || "");
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string>(coverLetters[0]?.id || "");
  
  // Email fields
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [subject, setSubject] = useState(`Application for ${job.title} - ${userName}`);
  const [notes, setNotes] = useState("");
  
  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleApplyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recruiterEmail) {
      setError("Recruiter email is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/apply/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          resumeId: selectedResume,
          coverLetterId: selectedCoverLetter,
          recruiterEmail,
          subject,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyForm = async (e: React.FormEvent) => {
    e.preventDefault();
    // For this prototype, we'll just mock the form filler success
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold">Application Submitted!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {method === "email" 
            ? "Your email has been sent to the recruiter with your resume and cover letter attached."
            : "The AI agent has successfully filled out the application form on your behalf."}
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => router.push(`/dashboard`)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-glow"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Method Selection */}
      <div className="flex bg-muted p-1 rounded-xl w-full max-w-md mx-auto mb-8">
        {[
          { id: "email", label: "Email Application", icon: Mail },
          { id: "form", label: "Auto-fill Form", icon: LayoutTemplate },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMethod(tab.id as "email" | "form")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              method === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-medium">Select Resume</label>
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
          <label className="text-sm font-medium">Select Cover Letter (Optional)</label>
          <select
            value={selectedCoverLetter}
            onChange={(e) => setSelectedCoverLetter(e.target.value)}
            className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            <option value="">-- None --</option>
            {coverLetters.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.tone} Cover Letter - {new Date(cl.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {method === "email" ? (
        <form onSubmit={handleApplyEmail} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Recruiter Email</label>
            <input
              type="email"
              required
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="recruiter@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes (Optional)</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-y"
              placeholder="Hi [Name], I'm interested in the role..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your cover letter will be appended below these notes if selected.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedResume}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Email...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Application
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleApplyForm} className="space-y-6">
          <div className="p-6 bg-muted/50 rounded-xl border border-border space-y-4">
            <div className="flex items-center gap-3 text-purple-500 font-semibold">
              <LayoutTemplate className="w-5 h-5" />
              AI Agent Form Filler
            </div>
            <p className="text-sm text-muted-foreground">
              The AI Agent will use Playwright to navigate to the job URL and attempt to fill out standard application forms (like Workday, Greenhouse, or Lever) using your selected resume data.
            </p>
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Application URL</label>
              <input
                type="url"
                required
                defaultValue={job.url || ""}
                className="w-full p-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="https://..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedResume}
            className="w-full py-4 bg-purple-500 text-white rounded-xl font-bold text-lg hover:bg-purple-600 transition-all shadow-glow hover:shadow-glow-lg disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Agent is filling forms...
              </>
            ) : (
              <>
                <LayoutTemplate className="w-5 h-5" />
                Start AI Auto-fill
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
