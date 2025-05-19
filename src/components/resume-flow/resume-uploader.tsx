
"use client";

import React, { useState, useCallback, useId } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import type { UploadedResume } from "@/lib/types";

interface ResumeUploaderProps {
  onResumesUploaded: (resumes: UploadedResume[]) => void;
  maxFiles?: number;
  maxFileSizeMB?: number;
}

export function ResumeUploader({
  onResumesUploaded,
  maxFiles = 10,
  maxFileSizeMB = 5,
}: ResumeUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedResume[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  const readFileAsDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readFileAsText = (file: File): Promise<string | null> => {
    // Only attempt to read .txt files as text for direct summarization
    if (file.type === "text/plain") {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    }
    return Promise.resolve(null); // For non-txt files, textContent will be null
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const files = event.target.files;
      if (!files) return;

      if (uploadedFiles.length + files.length > maxFiles) {
        setError(`You can upload a maximum of ${maxFiles} files.`);
        return;
      }

      const newResumes: UploadedResume[] = [];
      for (const file of Array.from(files)) {
        if (file.size > maxFileSizeMB * 1024 * 1024) {
          setError(
            `File ${file.name} exceeds the ${maxFileSizeMB}MB size limit.`
          );
          continue;
        }
        // For now, accept common document types. The AI flow expects data URI.
        // Text extraction for summarization is limited to .txt
        if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
            setError(`File type for ${file.name} is not supported. Please upload PDF, DOC, DOCX, or TXT files.`);
            continue;
        }

        try {
          const dataUri = await readFileAsDataURI(file);
          const textContent = await readFileAsText(file);
          newResumes.push({
            id: `${file.name}-${Date.now()}`, // Simple unique ID
            file,
            filename: file.name,
            dataUri,
            textContent,
          });
        } catch (e) {
          console.error("Error reading file:", e);
          setError(`Error reading file ${file.name}.`);
        }
      }

      const updatedResumes = [...uploadedFiles, ...newResumes];
      setUploadedFiles(updatedResumes);
      onResumesUploaded(updatedResumes); // Notify parent immediately
    },
    [uploadedFiles, maxFiles, maxFileSizeMB, onResumesUploaded]
  );

  const handleRemoveFile = (resumeId: string) => {
    const updatedResumes = uploadedFiles.filter((r) => r.id !== resumeId);
    setUploadedFiles(updatedResumes);
    onResumesUploaded(updatedResumes);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1">Upload Resumes</label>
        <div className="flex items-center justify-center w-full">
            <label
                htmlFor={inputId}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-input bg-muted/50 hover:bg-muted/75 transition-colors"
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT (MAX. {maxFileSizeMB}MB each, up to {maxFiles} files)</p>
                </div>
                <Input
                    id={inputId}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                />
            </label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files:</h4>
          <ScrollArea className="h-40 w-full rounded-md border p-2">
            <ul className="space-y-1">
              {uploadedFiles.map((resume) => (
                <li
                  key={resume.id}
                  className="flex items-center justify-between p-2 rounded-md bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-sm truncate max-w-[200px] sm:max-w-xs">{resume.filename}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(resume.id)}
                    aria-label={`Remove ${resume.filename}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
