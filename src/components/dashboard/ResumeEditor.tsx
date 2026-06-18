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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl h-[90vh] rounded-2xl shadow-xl flex flex-col border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-bold">Review Resume Details</h2>
            <p className="text-sm text-muted-foreground mt-1">Please verify the extracted information and make any necessary edits.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Version Settings</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Resume Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 rounded-lg border border-input bg-background"
                placeholder="e.g. Software Engineer Base"
              />
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['name', 'email', 'phone', 'location', 'linkedin', 'portfolio'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={data.personalInfo?.[field] || ""}
                    onChange={(e) => updatePersonalInfo(field, e.target.value)}
                    className="w-full p-2 rounded-lg border border-input bg-background"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Professional Summary</h3>
            <textarea
              value={data.summary || ""}
              onChange={(e) => setData({ ...data, summary: e.target.value })}
              className="w-full p-3 rounded-lg border border-input bg-background min-h-[100px]"
            />
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold">Experience</h3>
              <button
                onClick={() => addArrayItem('experience', { company: "", position: "", startDate: "", endDate: "", description: [] })}
                className="text-sm flex items-center text-primary hover:underline"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Experience
              </button>
            </div>
            {(data.experience || []).map((exp: any, i: number) => (
              <div key={i} className="p-4 border border-border rounded-xl bg-muted/10 relative group">
                <button
                  onClick={() => removeArrayItem('experience', i)}
                  className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Company</label>
                    <input type="text" value={exp.company || ""} onChange={(e) => updateArrayItem('experience', i, 'company', e.target.value)} className="w-full p-2 rounded border border-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Position</label>
                    <input type="text" value={exp.position || ""} onChange={(e) => updateArrayItem('experience', i, 'position', e.target.value)} className="w-full p-2 rounded border border-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Start Date</label>
                    <input type="text" value={exp.startDate || ""} onChange={(e) => updateArrayItem('experience', i, 'startDate', e.target.value)} className="w-full p-2 rounded border border-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">End Date</label>
                    <input type="text" value={exp.endDate || ""} onChange={(e) => updateArrayItem('experience', i, 'endDate', e.target.value)} className="w-full p-2 rounded border border-input text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Description (Bullets)</label>
                  <textarea
                    value={(exp.description || []).join('\n')}
                    onChange={(e) => updateArrayItem('experience', i, 'description', e.target.value.split('\n'))}
                    className="w-full p-2 rounded border border-input text-sm min-h-[80px]"
                    placeholder="One bullet per line..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold">Education</h3>
              <button
                onClick={() => addArrayItem('education', { institution: "", degree: "", startDate: "", endDate: "" })}
                className="text-sm flex items-center text-primary hover:underline"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Education
              </button>
            </div>
            {(data.education || []).map((edu: any, i: number) => (
              <div key={i} className="p-4 border border-border rounded-xl bg-muted/10 relative group">
                <button
                  onClick={() => removeArrayItem('education', i)}
                  className="absolute top-2 right-2 p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Institution</label>
                    <input type="text" value={edu.institution || ""} onChange={(e) => updateArrayItem('education', i, 'institution', e.target.value)} className="w-full p-2 rounded border border-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Degree</label>
                    <input type="text" value={edu.degree || ""} onChange={(e) => updateArrayItem('education', i, 'degree', e.target.value)} className="w-full p-2 rounded border border-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Start Date</label>
                    <input type="text" value={edu.startDate || ""} onChange={(e) => updateArrayItem('education', i, 'startDate', e.target.value)} className="w-full p-2 rounded border border-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">End Date</label>
                    <input type="text" value={edu.endDate || ""} onChange={(e) => updateArrayItem('education', i, 'endDate', e.target.value)} className="w-full p-2 rounded border border-input text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills & Certs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Skills & Certifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skills (Comma separated)</label>
                <textarea
                  value={(data.skills || []).join(", ")}
                  onChange={(e) => handleStringArrayChange('skills', e.target.value)}
                  className="w-full p-2 rounded-lg border border-input bg-background min-h-[80px] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certifications (Comma separated)</label>
                <textarea
                  value={(data.certifications || []).join(", ")}
                  onChange={(e) => handleStringArrayChange('certifications', e.target.value)}
                  className="w-full p-2 rounded-lg border border-input bg-background min-h-[80px] text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted border border-border transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              "Saving..."
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
