"use client";

import { useState, useRef, DragEvent, KeyboardEvent } from "react";
import { UploadCloud, Plus, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ResumeEditor } from "./ResumeEditor";

export function ResumeUploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    setError(null);
    
    // Client-side validation
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      setError("Please upload a valid PDF, DOCX, or TXT file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      });

      console.log('reaponse for image', response)

      if (!response.ok) {
        throw new Error("Failed to upload resume");
      }

      const data = await response.json();
      setParsedData(data.parsedData);
      
      // router.refresh() will be called when the editor saves or closes.
    } catch (err) {
      console.error(err);
      setError("Error uploading resume. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      {parsedData && (
        <ResumeEditor
          initialData={parsedData}
          onClose={() => setParsedData(null)}
          onSave={() => {
            setParsedData(null);
            router.refresh();
          }}
        />
      )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label="Upload Resume"
          className={`glass-panel p-8 rounded-3xl flex flex-col items-center justify-center text-center border-dashed border-2 transition-all duration-300 cursor-pointer group h-full min-h-[220px] outline-none ${
            isDragging ? 'border-primary bg-primary/5 shadow-glow' : 'border-primary/20 hover:border-primary/40'
          } ${error ? 'border-destructive/40 bg-destructive/5' : ''}`}
        >
          {isUploading ? (
            <div className="space-y-3.5 animate-pulse">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-2 mx-auto" />
              <h3 className="font-bold text-lg font-outfit text-foreground">Parsing Resume...</h3>
              <p className="text-xs text-muted-foreground font-light">Extracting sections and skills using AI models</p>
            </div>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isDragging ? 'bg-primary/20 scale-110' : 'bg-primary/10 group-hover:scale-110 shadow-sm'}`}>
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-base font-outfit text-foreground">Upload New Resume</h3>
              <p className="text-xs text-slate-400 mt-1 font-light">Drag & drop or click to browse files</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-light">PDF, DOCX, or TXT formats (max 5MB)</p>
              
              {error && (
                <div className="mt-4 flex items-center text-xs text-destructive bg-destructive/10 px-3.5 py-2.5 rounded-xl border border-destructive/20 font-semibold">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  }
