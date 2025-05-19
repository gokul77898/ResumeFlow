
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { handleScreenResumes, handleSummarizeResume } from "@/app/actions";
import { CriteriaForm, screeningCriteriaSchema, useCriteriaForm } from "@/components/resume-flow/criteria-form";
import { ResumeUploader } from "@/components/resume-flow/resume-uploader";
import { ResultsTable } from "@/components/resume-flow/results-table";
import { ResumeSummaryDialog } from "@/components/resume-flow/resume-summary-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import type {
  ScreeningCriteria,
  UploadedResume,
  EnrichedScreeningResult,
  AISummary,
} from "@/lib/types";
import { Briefcase, Loader2, ListFilter, FileUp, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";


export default function ResumeFlowPage() {
  const { toast } = useToast();
  
  // Form for criteria
  const criteriaForm = useCriteriaForm<ScreeningCriteria>({
    resolver: zodResolver(screeningCriteriaSchema),
    defaultValues: { keywords: "", experienceLevel: "Entry-level", skills: "" },
  });

  const [uploadedResumes, setUploadedResumes] = useState<UploadedResume[]>([]);
  const [screeningResults, setScreeningResults] = useState<EnrichedScreeningResult[]>([]);
  
  const [selectedResumeForSummary, setSelectedResumeForSummary] = useState<EnrichedScreeningResult | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryResult, setSummaryResult] = useState<AISummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [isLoadingScreening, setIsLoadingScreening] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const handleResumesUploaded = (resumes: UploadedResume[]) => {
    setUploadedResumes(resumes);
  };

  const onSubmitCriteriaAndResumes: SubmitHandler<ScreeningCriteria> = async (criteria) => {
    if (uploadedResumes.length === 0) {
      toast({
        title: "No Resumes Uploaded",
        description: "Please upload at least one resume to screen.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingScreening(true);
    setScreeningResults([]); // Clear previous results

    const resumesForApi = uploadedResumes.map(r => ({ filename: r.filename, dataUri: r.dataUri }));

    try {
      const results = await handleScreenResumes({ screeningCriteria: criteria, resumes: resumesForApi });
      
      // Enrich results with original resume ID and text content for summarization
      const enriched = results.map(apiResult => {
        const original = uploadedResumes.find(ur => ur.filename === apiResult.filename);
        return {
          ...apiResult,
          originalResumeId: original?.id || apiResult.filename, // fallback to filename if id not found
          resumeTextContent: original?.textContent || null,
        };
      });

      setScreeningResults(enriched);
      toast({
        title: "Screening Complete",
        description: `${results.length} resumes processed.`,
        variant: "default",
        className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
      });
    } catch (error) {
      console.error("Screening error:", error);
      toast({
        title: "Screening Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingScreening(false);
    }
  };

  const handleOpenSummaryDialog = (result: EnrichedScreeningResult) => {
    setSelectedResumeForSummary(result);
    setSummaryResult(null); // Clear previous summary
    setSummaryError(null);
    setIsSummaryDialogOpen(true);
  };

  const handleGenerateSummary = async (jobDescription: string) => {
    if (!selectedResumeForSummary || !selectedResumeForSummary.resumeTextContent) {
      toast({ title: "Error", description: "Selected resume or its text content is not available.", variant: "destructive" });
      return;
    }
    
    setIsLoadingSummary(true);
    setSummaryResult(null);
    setSummaryError(null);

    try {
      const summary = await handleSummarizeResume({
        resumeText: selectedResumeForSummary.resumeTextContent,
        jobDescription,
      });
      setSummaryResult(summary);
      toast({ title: "Summary Generated", description: "AI summary created successfully.", 
        variant: "default",
        className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
      });
    } catch (error) {
      console.error("Summarization error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during summarization.";
      setSummaryError(errorMessage);
      toast({ title: "Summarization Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingSummary(false);
    }
  };
  
  const Header = () => (
    <header className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <Briefcase className="h-12 w-12 text-primary" />
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Resume<span className="text-primary">Flow</span>
          </h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Intelligently screen and summarize resumes with the power of AI. Streamline your hiring process and find the best candidates faster.
        </p>
      </div>
    </header>
  );


  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-card">
             <div className="flex items-center gap-2">
              <ListFilter className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Define Screening Criteria</CardTitle>
            </div>
            <CardDescription>
              Specify keywords, experience, and skills to filter resumes effectively.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CriteriaForm 
              onSubmit={criteriaForm.handleSubmit(onSubmitCriteriaAndResumes)}
              isLoading={isLoadingScreening}
              // Pass form control to CriteriaForm, so it can be managed by react-hook-form provider from page.tsx
              // This isn't strictly necessary if CriteriaForm wraps its own FormProvider and has its own useForm instance
              // For this setup, CriteriaForm will use its own internal form.
              // The `onSubmit` prop is what matters for connecting.
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-card">
            <div className="flex items-center gap-2">
              <FileUp className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Upload Resumes</CardTitle>
            </div>
            <CardDescription>
              Upload resume files (PDF, DOC, DOCX, TXT). Max 10 files, 5MB each.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResumeUploader onResumesUploaded={handleResumesUploaded} />
          </CardContent>
        </Card>
        
        <div className="text-center pt-4">
            <Button
              type="button" // Changed from "submit" as it's not part of a specific form element here
              onClick={criteriaForm.handleSubmit(onSubmitCriteriaAndResumes)}
              disabled={isLoadingScreening || uploadedResumes.length === 0}
              size="lg"
              className="w-full max-w-xs transition-all duration-150 ease-in-out transform hover:scale-105 focus:scale-105 active:scale-100"
              aria-label="Screen uploaded resumes based on defined criteria"
            >
              {isLoadingScreening ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-5 w-5" />
              )}
              Screen Resumes
            </Button>
        </div>


        {screeningResults.length > 0 && (
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-card">
              <div className="flex items-center gap-2">
                 <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Screening Results</CardTitle>
              </div>
              <CardDescription>
                View the outcome of the AI-powered resume screening.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResultsTable results={screeningResults} onSummarize={handleOpenSummaryDialog} />
            </CardContent>
          </Card>
        )}

        {selectedResumeForSummary && (
          <ResumeSummaryDialog
            isOpen={isSummaryDialogOpen}
            onOpenChange={setIsSummaryDialogOpen}
            resumeFileName={selectedResumeForSummary.filename}
            resumeTextContent={selectedResumeForSummary.resumeTextContent}
            onSubmit={handleGenerateSummary}
            summaryResult={summaryResult}
            isLoading={isLoadingSummary}
            error={summaryError}
          />
        )}
         <footer className="text-center py-8 mt-12 border-t">
            <p className="text-sm text-muted-foreground">
                ResumeFlow &copy; {new Date().getFullYear()}. Powered by GenAI.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
                Note: Uploaded resumes are processed for screening and summarization during your session and are not stored long-term.
            </p>
        </footer>
      </main>
    </>
  );
}
