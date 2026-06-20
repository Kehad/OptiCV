"use client";

import { useState } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";

export function ResumeEditor({
  initialData,
  onClose,
  onSave,
}: {
  initialData: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [title, setTitle] = useState("My Tailored Resume");
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: data,
          isOriginal: true, // we can treat this as a base original resume
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save resume");
      }

      onSave();
    } catch (err) {
      console.error(err);
      setError("Failed to save the resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setData({
      ...data,
      personalInfo: { ...(data.personalInfo || {}), [field]: value },
    });
  };

  const updateArrayItem = (arrayName: string, index: number, field: string, value: string) => {
    const newArray = [...(data[arrayName] || [])];
    if (!newArray[index]) newArray[index] = {};
    newArray[index][field] = value;
    setData({ ...data, [arrayName]: newArray });
  };

  const removeArrayItem = (arrayName: string, index: number) => {
    const newArray = [...(data[arrayName] || [])];
    newArray.splice(index, 1);
    setData({ ...data, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName: string, defaultItem: any) => {
    const newArray = [...(data[arrayName] || []), defaultItem];
    setData({ ...data, [arrayName]: newArray });
  };

  const handleStringArrayChange = (arrayName: string, value: string) => {
    setData({
      ...data,
      [arrayName]: value.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070913]/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex flex-col border border-border/60 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/60 bg-muted/30">
          <div>
            <h2 className="text-xl font-bold font-outfit text-foreground">Review Resume Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-light">Please verify the extracted information and make any necessary edits before saving.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-all duration-200">
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold rounded-xl">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">Version Settings</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Resume Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card/50 text-sm focus:bg-background outline-none transition-all duration-200 font-medium"
                placeholder="e.g. Software Engineer Base"
              />
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['name', 'email', 'phone', 'location', 'linkedin', 'portfolio'].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={data.personalInfo?.[field] || ""}
                    onChange={(e) => updatePersonalInfo(field, e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-card/50 text-sm focus:bg-background outline-none transition-all duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">Professional Summary</h3>
            <textarea
              value={data.summary || ""}
              onChange={(e) => setData({ ...data, summary: e.target.value })}
              className="w-full p-3.5 rounded-xl border border-border bg-card/50 text-sm focus:bg-background outline-none transition-all duration-200 min-h-[100px] resize-y custom-scrollbar font-light leading-relaxed"
            />
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Work Experience</h3>
              <button
                onClick={() => addArrayItem('experience', { company: "", position: "", startDate: "", endDate: "", description: [] })}
                className="text-xs flex items-center text-primary font-bold hover:underline"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Work
              </button>
            </div>
            {(data.experience || []).map((exp: any, i: number) => (
              <div key={i} className="p-5 border border-border/60 rounded-2xl bg-muted/20 relative group hover:border-primary/20 transition-all duration-300">
                <button
                  onClick={() => removeArrayItem('experience', i)}
                  className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Company</label>
                    <input type="text" value={exp.company || ""} onChange={(e) => updateArrayItem('experience', i, 'company', e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs focus:bg-background outline-none transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Position</label>
                    <input type="text" value={exp.position || ""} onChange={(e) => updateArrayItem('experience', i, 'position', e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs focus:bg-background outline-none transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Start Date</label>
                    <input type="text" value={exp.startDate || ""} onChange={(e) => updateArrayItem('experience', i, 'startDate', e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs focus:bg-background outline-none transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">End Date</label>
                    <input type="text" value={exp.endDate || ""} onChange={(e) => updateArrayItem('experience', i, 'endDate', e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs focus:bg-background outline-none transition-all duration-200" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Bullet achievements (one per line)</label>
                  <textarea
                    value={(exp.description || []).join('\n')}
                    onChange={(e) => updateArrayItem('experience', i, 'description', e.target.value.split('\n'))}
                    className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs min-h-[80px] focus:bg-background outline-none transition-all duration-200 custom-scrollbar font-light"
                    placeholder="Designed and developed..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Education</h3>
              <button
                onClick={() => addArrayItem('education', { institution: "", degree: "", startDate: "", endDate: "" })}
                className="text-xs flex items-center text-primary font-bold hover:underline"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Education
              </button>
            </div>
            {(data.education || []).map((edu: any, i: number) => (
              <div key={i} className="p-5 border border-border/60 rounded-2xl bg-muted/20 relative group hover:border-primary/20 transition-all duration-300">
                <button
                  onClick={() => removeArrayItem('education', i)}
                  className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Institution</label>
                    <input type="text" value={edu.institution || ""} onChange={(e) => updateArrayItem('education', i, 'institution', e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs focus:bg-background outline-none transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Degree</label>
                    <input type="text" value={edu.degree || ""} onChange={(e) => updateArrayItem('education', i, 'degree', e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs focus:bg-background outline-none transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">Start Date</label>
                    <input type="text" value={edu.startDate || ""} onChange={(e) => updateArrayItem('education', i, 'startDate', e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs focus:bg-background outline-none transition-all duration-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase tracking-wide">End Date</label>
                    <input type="text" value={edu.endDate || ""} onChange={(e) => updateArrayItem('education', i, 'endDate', e.target.value)} className="w-full p-2.5 rounded-xl border border-border bg-card/50 text-xs focus:bg-background outline-none transition-all duration-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills & Certs */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">Skills & Certifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Skills (separated by comma)</label>
                <textarea
                  value={(data.skills || []).join(", ")}
                  onChange={(e) => handleStringArrayChange('skills', e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-border bg-card/50 text-sm focus:bg-background outline-none transition-all duration-200 min-h-[90px] custom-scrollbar font-light leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Certifications (separated by comma)</label>
                <textarea
                  value={(data.certifications || []).join(", ")}
                  onChange={(e) => handleStringArrayChange('certifications', e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-border bg-card/50 text-sm focus:bg-background outline-none transition-all duration-200 min-h-[90px] custom-scrollbar font-light leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/60 bg-muted/30 flex justify-end gap-3.5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted border border-border transition-all duration-200 hover-lift"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-primary/95 hover:to-indigo-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg flex items-center disabled:opacity-75 hover-lift"
          >
            {isSaving ? (
              "Saving details..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Resume
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
