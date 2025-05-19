
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
import type { CandidateComparisonData } from "@/lib/types";
import { Loader2, UsersRound, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCnCardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CandidateComparisonDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  comparisonData: CandidateComparisonData | null;
  isLoading: boolean;
  error?: string | null;
  onGenerate: () => void; // Callback to trigger generation
  candidateCount: number;
}

export function CandidateComparisonDialog({
  isOpen,
  onOpenChange,
  comparisonData,
  isLoading,
  error,
  onGenerate,
  candidateCount,
}: CandidateComparisonDialogProps) {

  React.useEffect(() => {
    if (isOpen && !comparisonData && !error && !isLoading && candidateCount > 0) {
      onGenerate();
    }
  }, [isOpen, comparisonData, error, isLoading, onGenerate, candidateCount]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-primary" />
            Candidate Comparison Report
          </DialogTitle>
          <DialogDescription>
            AI-generated comparison of selected candidates against the job description.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 min-h-[300px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span>Comparing {candidateCount} candidates... This may take a moment.</span>
            </div>
          )}

          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Comparing Candidates</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {comparisonData && !isLoading && (
            <ScrollArea className="h-[500px] pr-3">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{comparisonData.overallSummary}</p>
                  </CardContent>
                </Card>

                <h3 className="text-lg font-semibold mt-4">Individual Candidate Details:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisonData.comparisonDetails.map((detail, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="truncate">{detail.filename}</CardTitle>
                       <ShadCnCardDescription>
                        Overall Fit: <Badge variant={
                            detail.overallFit === "Excellent" ? "default" :
                            detail.overallFit === "Good" ? "secondary" : // Assuming secondary is a positive-ish color
                            detail.overallFit === "Fair" ? "outline" : "destructive"
                        }>{detail.overallFit}</Badge>
                      </ShadCnCardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <h4 className="font-medium">Strengths:</h4>
                        <p className="whitespace-pre-wrap">{detail.strengths}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Weaknesses:</h4>
                        <p className="whitespace-pre-wrap">{detail.weaknesses}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </div>
              </div>
            </ScrollArea>
          )}
           {!comparisonData && !isLoading && !error && candidateCount === 0 && (
             <p className="text-center text-muted-foreground">Please select at least two candidates from the results table to compare.</p>
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
