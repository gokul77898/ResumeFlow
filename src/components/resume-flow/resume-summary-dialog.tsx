
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AISummary, ResumeSummaryJobData } from "@/lib/types";
import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResumeSummaryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  resumeFileName: string;
  resumeTextContent: string | null;
  onSubmit: (jobDescription: string) => Promise<void>; // Parent handles API call
  summaryResult: AISummary | null;
  isLoading: boolean;
  error?: string | null;
}

export function ResumeSummaryDialog({
  isOpen,
  onOpenChange,
  resumeFileName,
  resumeTextContent,
  onSubmit,
  summaryResult,
  isLoading,
  error
}: ResumeSummaryDialogProps) {
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    // Reset job description when dialog opens for a new resume
    if (isOpen) {
      setJobDescription("");
    }
  }, [isOpen, resumeFileName]);


  const handleSubmit = async () => {
    if (!resumeTextContent) {
        // This case should ideally be prevented by disabling the summarize button
        alert("Resume text content is not available for summarization.");
        return;
    }
    if (!jobDescription.trim()) {
        alert("Job description cannot be empty.");
        return;
    }
    await onSubmit(jobDescription);
  };
  
  if (!resumeTextContent && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Summarize Resume: {resumeFileName}</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Resume text content is not available for summarization. This typically occurs for non-.txt files.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Resume Summary for: {resumeFileName}</DialogTitle>
          <DialogDescription>
            Provide a job description to generate an AI-powered summary highlighting the candidate's strengths relevant to the role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="jobDescription" className="text-sm font-medium">Job Description</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="mt-1 min-h-[150px]"
              rows={6}
            />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              <span>Generating summary...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {summaryResult && !isLoading && (
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-primary flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                AI Generated Summary
              </h3>
              <ScrollArea className="h-48 rounded-md border bg-muted/30 p-3">
                <p className="text-sm whitespace-pre-wrap">{summaryResult.summary}</p>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !jobDescription.trim() || !resumeTextContent}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Summary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
