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
  
  // Form field
  const [formUrl, setFormUrl] = useState(job.url || "");
  
  // Automation Review fields
  const [automationPreview, setAutomationPreview] = useState<any[] | null>(null);
  const [mappingValues, setMappingValues] = useState<Record<string, string>>({});

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
          userEmail,
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
    if (!formUrl) {
      setError("Application URL is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/automation/inspect-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formUrl,
          resumeId: selectedResume,
          coverLetterId: selectedCoverLetter || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to inspect form");
      }

      const data = await response.json();
      setAutomationPreview(data.mapping);
      
      const initialMap: Record<string, string> = {};
      data.mapping.forEach((m: any) => {
        initialMap[m.selector] = m.value;
      });
      setMappingValues(initialMap);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteForm = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const payload = automationPreview?.map(m => ({
        ...m,
        value: mappingValues[m.selector] || m.value
      })) || [];

      const response = await fetch("/api/automation/execute-approved-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          resumeId: selectedResume,
          coverLetterId: selectedCoverLetter,
          url: formUrl,
          mapping: payload
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit final application");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred during execution");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 space-y-5 animate-fade-in-up font-sans">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-glow animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-extrabold font-outfit text-foreground">Application Submitted!</h2>
        <p className="text-muted-foreground text-sm font-light max-w-md mx-auto leading-relaxed">
          {method === "email" 
            ? "Your email has been sent to the recruiter with your optimized resume and cover letter attachments."
            : "The AI agent has successfully filled out and submitted the application form on your behalf."}
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => router.push(`/dashboard`)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg hover-lift"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Method Selection */}
      <div className="flex bg-muted/60 p-1.5 rounded-2xl w-full max-w-md mx-auto mb-8 border border-border/40 backdrop-blur-sm">
        {[
          { id: "email", label: "Email Recruiter", icon: Mail },
          { id: "form", label: "Auto-fill Form", icon: LayoutTemplate },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMethod(tab.id as "email" | "form")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
              method === tab.id
                ? "bg-card text-foreground shadow-md border border-border/10"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${method === tab.id ? 'text-primary' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Resume Source</label>
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
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Cover Letter (Optional)</label>
          <select
            value={selectedCoverLetter}
            onChange={(e) => setSelectedCoverLetter(e.target.value)}
            className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200"
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
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2 border border-destructive/20 text-sm font-semibold animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {method === "email" ? (
        <form onSubmit={handleApplyEmail} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recruiter Email</label>
            <input
              type="email"
              required
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
              className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200"
              placeholder="recruiter@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Additional Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200 resize-y custom-scrollbar font-light leading-relaxed"
              placeholder="Hi [Name], I'm interested in the role..."
            />
            <p className="text-[10px] text-muted-foreground mt-1 font-light">
              Your cover letter will be appended below these notes if selected.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedResume}
            className="w-full py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold rounded-xl text-base hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg disabled:opacity-75 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Application Email...
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
        <div className="space-y-6">
          {!automationPreview ? (
            <form onSubmit={handleApplyForm} className="space-y-6 animate-fade-in">
              <div className="p-6 bg-muted/40 rounded-2xl border border-border/60 space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-indigo-500 dark:text-indigo-400 font-bold font-outfit">
                  <LayoutTemplate className="w-5 h-5" />
                  AI Agent Form Filler
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  The AI Agent uses automated browsing routines to navigate to the job link, inspect input fields, and map answers from your resume data. You will review mapping before submission.
                </p>
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Application URL</label>
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200"
                    placeholder="https://jobs.lever.co/company/role/apply"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedResume}
                className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl text-base hover:bg-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg disabled:opacity-75 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Agent is inspecting form details...
                  </>
                ) : (
                  <>
                    <LayoutTemplate className="w-5 h-5" />
                    Inspect Form
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-muted/40 rounded-2xl border border-border/60 space-y-4 shadow-sm">
                <h3 className="font-bold text-base flex items-center gap-2 text-foreground font-outfit">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Review Field Mapping
                </h3>
                <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                  The AI has proposed the following answers. Please review and edit them as necessary before confirming final submission.
                </p>
                
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {automationPreview.map((field, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400">{field.label || field.selector}</label>
                      {field.options && field.options.length > 0 ? (
                        <select
                          value={mappingValues[field.selector] || ""}
                          onChange={(e) => setMappingValues({...mappingValues, [field.selector]: e.target.value})}
                          className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200"
                        >
                          <option value="">-- Select Option --</option>
                          {field.options.map((opt: string, oIdx: number) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' || field.type === 'paragraph' ? (
                        <textarea
                          rows={3}
                          value={mappingValues[field.selector] || ""}
                          onChange={(e) => setMappingValues({...mappingValues, [field.selector]: e.target.value})}
                          className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200 resize-y custom-scrollbar font-light"
                        />
                      ) : (
                        <input
                          type="text"
                          value={mappingValues[field.selector] || ""}
                          onChange={(e) => setMappingValues({...mappingValues, [field.selector]: e.target.value})}
                          className="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:bg-background transition-all duration-200 font-light"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setAutomationPreview(null)}
                  className="flex-1 py-3 bg-card text-foreground border border-border rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-muted hover-lift"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteForm}
                  disabled={isSubmitting}
                  className="flex-[2] py-3 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 disabled:opacity-75 hover-lift"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Executing Auto-Submit...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Confirm & Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
