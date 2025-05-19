
"use client";

import React, { useState } from "react";
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
import { Loader2, FileText } from "lucide-react";

interface JobDescriptionParserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (jobDescriptionText: string) => Promise<void>;
  isLoading: boolean;
}

export function JobDescriptionParserDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
}: JobDescriptionParserDialogProps) {
  const [jobDescriptionText, setJobDescriptionText] = useState("");

  const handleSubmit = () => {
    if (!jobDescriptionText.trim()) {
      alert("Job description cannot be empty."); // Or use toast
      return;
    }
    onSubmit(jobDescriptionText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Parse Job Description
          </DialogTitle>
          <DialogDescription>
            Paste a job description below. The AI will attempt to extract keywords, experience level, and skills to pre-fill the screening criteria.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="job-description-parser-textarea">Job Description</Label>
          <Textarea
            id="job-description-parser-textarea"
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-[200px]"
            rows={10}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !jobDescriptionText.trim()}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Parse and Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
