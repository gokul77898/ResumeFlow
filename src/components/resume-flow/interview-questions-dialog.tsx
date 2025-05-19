
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
import type { InterviewQuestionsData } from "@/lib/types";
import { Loader2, MessagesSquare, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface InterviewQuestionsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  resumeFileName: string;
  questionsData: InterviewQuestionsData | null;
  isLoading: boolean;
  error?: string | null;
  onGenerate: () => void; // Callback to trigger generation
}

export function InterviewQuestionsDialog({
  isOpen,
  onOpenChange,
  resumeFileName,
  questionsData,
  isLoading,
  error,
  onGenerate,
}: InterviewQuestionsDialogProps) {

  React.useEffect(() => {
    if (isOpen && !questionsData && !error && !isLoading) {
      onGenerate();
    }
  }, [isOpen, questionsData, error, isLoading, onGenerate]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5 text-primary" />
            Generated Interview Questions: {resumeFileName}
          </DialogTitle>
          <DialogDescription>
            AI-suggested questions based on the resume and job description.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 min-h-[200px]">
          {isLoading && (
            <div className="flex items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              <span>Generating questions...</span>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {questionsData && !isLoading && (
            <ScrollArea className="h-[350px]">
              <Accordion type="multiple" defaultValue={['behavioral', 'technical', 'situational']} className="w-full">
                <AccordionItem value="behavioral">
                  <AccordionTrigger>Behavioral Questions ({questionsData.behavioral.length})</AccordionTrigger>
                  <AccordionContent>
                    {questionsData.behavioral.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {questionsData.behavioral.map((q, i) => <li key={`b-${i}`}>{q}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">No behavioral questions generated.</p>}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="technical">
                  <AccordionTrigger>Technical Questions ({questionsData.technical.length})</AccordionTrigger>
                  <AccordionContent>
                     {questionsData.technical.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {questionsData.technical.map((q, i) => <li key={`t-${i}`}>{q}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">No technical questions generated.</p>}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="situational">
                  <AccordionTrigger>Situational Questions ({questionsData.situational.length})</AccordionTrigger>
                  <AccordionContent>
                     {questionsData.situational.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {questionsData.situational.map((q, i) => <li key={`s-${i}`}>{q}</li>)}
                      </ul>
                    ) : <p className="text-sm text-muted-foreground">No situational questions generated.</p>}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
