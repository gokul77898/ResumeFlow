
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SkillGapData } from "@/lib/types";
import { Loader2, Lightbulb, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SkillGapDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  resumeFileName: string;
  skillGapData: SkillGapData | null;
  isLoading: boolean;
  error?: string | null;
  onGenerate: () => void; // Callback to trigger generation
}

export function SkillGapDialog({
  isOpen,
  onOpenChange,
  resumeFileName,
  skillGapData,
  isLoading,
  error,
  onGenerate,
}: SkillGapDialogProps) {
  // Automatically trigger generation if dialog is open and no data/error yet
  React.useEffect(() => {
    if (isOpen && !skillGapData && !error && !isLoading) {
      onGenerate();
    }
  }, [isOpen, skillGapData, error, isLoading, onGenerate]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Skill Gap Analysis: {resumeFileName}
          </DialogTitle>
          <DialogDescription>
            AI-generated analysis of skills from the job description compared to the resume.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 min-h-[200px]">
          {isLoading && (
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              <span>Analyzing skill gap...</span>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {skillGapData && !isLoading && (
            <ScrollArea className="h-[300px] space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Missing or Underrepresented Skills:</h3>
                {skillGapData.missingSkills.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {skillGapData.missingSkills.map((skill, index) => (
                      <li key={index}><Badge variant="outline">{skill}</Badge></li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No significant skill gaps identified based on the provided text.</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mt-4 mb-2">Suggestions for Improvement:</h3>
                <p className="text-sm whitespace-pre-wrap">{skillGapData.suggestions}</p>
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
