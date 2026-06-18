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
          className={`glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center border-dashed border-2 transition-all cursor-pointer group h-full min-h-[200px] outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isDragging ? 'border-primary bg-primary/5' : 'border-primary/30 hover:border-primary/60'
          } ${error ? 'border-destructive/50' : ''}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h3 className="font-semibold text-lg">Parsing Resume...</h3>
              <p className="text-sm text-muted-foreground mt-2">Extracting skills and experience with AI</p>
            </>
          ) : (
            <>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${isDragging ? 'bg-primary/20 scale-110' : 'bg-primary/10 group-hover:scale-110'}`}>
                <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-primary'}`} />
              </div>
              <h3 className="font-semibold text-lg">Upload New Resume</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-2">Drag & drop or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT up to 5MB</p>
              
              {error && (
                <div className="mt-4 flex items-center text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  }
