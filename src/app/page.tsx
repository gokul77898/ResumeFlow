
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  handleScreenResumes, 
  handleSummarizeResume,
  handleParseJobDescription,
  handleSkillGapAnalysis,
  handleGenerateInterviewQuestions,
  handleCompareCandidates
} from "@/app/actions";
import { CriteriaForm, useCriteriaForm } from "@/components/resume-flow/criteria-form";
import { ResumeUploader } from "@/components/resume-flow/resume-uploader";
import { ResultsTable } from "@/components/resume-flow/results-table";
import { ResumeSummaryDialog } from "@/components/resume-flow/resume-summary-dialog";
import { JobDescriptionParserDialog } from "@/components/resume-flow/job-description-parser-dialog";
import { SaveTemplateDialog } from "@/components/resume-flow/save-template-dialog";
import { LoadTemplateDialog } from "@/components/resume-flow/load-template-dialog";
import { SkillGapDialog } from "@/components/resume-flow/skill-gap-dialog";
import { InterviewQuestionsDialog } from "@/components/resume-flow/interview-questions-dialog";
import { CandidateComparisonDialog } from "@/components/resume-flow/candidate-comparison-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type {
  ScreeningCriteria,
  UploadedResume,
  EnrichedScreeningResult,
  AISummary,
  SavedScreeningTemplate,
  ExperienceLevel,
  SkillGapData,
  InterviewQuestionsData,
  CandidateComparisonData,
} from "@/lib/types";
import { screeningCriteriaSchema } from "@/lib/types";
import { Briefcase, Loader2, ListFilter, FileUp, CheckCircle, FileText, BookOpenCheck, Save, UsersRound, Lightbulb, MessagesSquare } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";

const SAVED_TEMPLATES_KEY = "resumeFlow_savedCriteriaTemplates";

export default function ResumeFlowPage() {
  const { toast } = useToast();
  
  const defaultCriteria: ScreeningCriteria = { keywords: "", experienceLevel: "Entry-level", skills: "" };
  const criteriaForm = useCriteriaForm<ScreeningCriteria>({
    resolver: zodResolver(screeningCriteriaSchema),
    defaultValues: defaultCriteria,
  });

  const [uploadedResumes, setUploadedResumes] = useState<UploadedResume[]>([]);
  const [screeningResults, setScreeningResults] = useState<EnrichedScreeningResult[]>([]);
  const [selectedResumeForSummary, setSelectedResumeForSummary] = useState<EnrichedScreeningResult | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryResult, setSummaryResult] = useState<AISummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [isLoadingScreening, setIsLoadingScreening] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const [isJobParserDialogOpen, setIsJobParserDialogOpen] = useState(false);
  const [isLoadingJobParser, setIsLoadingJobParser] = useState(false);
  
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [isLoadTemplateDialogOpen, setIsLoadTemplateDialogOpen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedScreeningTemplate[]>([]);

  const [selectedResumeForAnalysis, setSelectedResumeForAnalysis] = useState<EnrichedScreeningResult | null>(null);

  const [isSkillGapDialogOpen, setIsSkillGapDialogOpen] = useState(false);
  const [skillGapData, setSkillGapData] = useState<SkillGapData | null>(null);
  const [isLoadingSkillGap, setIsLoadingSkillGap] = useState(false);
  const [skillGapError, setSkillGapError] = useState<string | null>(null);

  const [isInterviewQuestionsDialogOpen, setIsInterviewQuestionsDialogOpen] = useState(false);
  const [interviewQuestionsData, setInterviewQuestionsData] = useState<InterviewQuestionsData | null>(null);
  const [isLoadingInterviewQuestions, setIsLoadingInterviewQuestions] = useState(false);
  const [interviewQuestionsError, setInterviewQuestionsError] = useState<string | null>(null);

  const [selectedCandidateIdsForComparison, setSelectedCandidateIdsForComparison] = useState<Set<string>>(new Set());
  const [isCandidateComparisonDialogOpen, setIsCandidateComparisonDialogOpen] = useState(false);
  const [candidateComparisonData, setCandidateComparisonData] = useState<CandidateComparisonData | null>(null);
  const [isLoadingCandidateComparison, setIsLoadingCandidateComparison] = useState(false);
  const [candidateComparisonError, setCandidateComparisonError] = useState<string | null>(null);

  const [jobContextForAnalysis, setJobContextForAnalysis] = useState<string>(() => {
    if (defaultCriteria.skills && defaultCriteria.keywords) {
      return `${defaultCriteria.skills}, ${defaultCriteria.keywords}`;
    }
    return defaultCriteria.skills || defaultCriteria.keywords || "";
  });


  useEffect(() => {
    const storedTemplates = localStorage.getItem(SAVED_TEMPLATES_KEY);
    if (storedTemplates) {
      setSavedTemplates(JSON.parse(storedTemplates));
    }
  }, []);

  const handleResumesUploaded = (resumes: UploadedResume[]) => {
    setUploadedResumes(resumes);
  };

  const onSubmitCriteriaAndResumes: SubmitHandler<ScreeningCriteria> = async (criteria) => {
    if (uploadedResumes.length === 0) {
      toast({ title: "No Resumes Uploaded", description: "Please upload at least one resume.", variant: "destructive" });
      return;
    }
    setIsLoadingScreening(true);
    setScreeningResults([]);
    setSelectedCandidateIdsForComparison(new Set()); 

    const { skills, keywords } = criteria;
    setJobContextForAnalysis(skills && keywords ? `${skills}, ${keywords}` : skills || keywords || "");

    const resumesForApi = uploadedResumes.map(r => ({ filename: r.filename, dataUri: r.dataUri }));
    try {
      const results = await handleScreenResumes({ screeningCriteria: criteria, resumes: resumesForApi });
      const enriched = results.map(apiResult => {
        const original = uploadedResumes.find(ur => ur.filename === apiResult.filename);
        return { ...apiResult, originalResumeId: original?.id || apiResult.filename, resumeTextContent: original?.textContent || null };
      });
      setScreeningResults(enriched);
      toast({ title: "Screening Complete", description: `${results.length} resumes processed.`, variant: "default" });
    } catch (error) {
      toast({ title: "Screening Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingScreening(false);
    }
  };
  
  const handleParseJobDescriptionSubmit = async (jobDescriptionText: string) => {
    setIsLoadingJobParser(true);
    try {
      const parsedCriteria = await handleParseJobDescription({ jobDescriptionText });
      criteriaForm.reset({
        keywords: parsedCriteria.keywords,
        experienceLevel: screeningCriteriaSchema.shape.experienceLevel.safeParse(parsedCriteria.experienceLevel).success 
            ? parsedCriteria.experienceLevel as ExperienceLevel
            : "Entry-level",
        skills: parsedCriteria.skills,
      });
      setJobContextForAnalysis(jobDescriptionText); // Use full JD text for context
      toast({ title: "Job Description Parsed", description: "Screening criteria have been pre-filled.", variant: "default" });
      setIsJobParserDialogOpen(false);
    } catch (error) {
      toast({ title: "Parsing Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingJobParser(false);
    }
  };

  const handleSaveTemplate = (templateName: string) => {
    const currentCriteria = criteriaForm.getValues();
    const newTemplate: SavedScreeningTemplate = { id: Date.now().toString(), name: templateName, criteria: currentCriteria };
    const updatedTemplates = [...savedTemplates, newTemplate];
    setSavedTemplates(updatedTemplates);
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    toast({ title: "Template Saved", description: `Criteria "${templateName}" saved successfully.`, variant: "default" });
    setIsSaveTemplateDialogOpen(false);
  };

  const handleLoadTemplate = (templateId: string) => {
    const templateToLoad = savedTemplates.find(t => t.id === templateId);
    if (templateToLoad) {
      criteriaForm.reset(templateToLoad.criteria);
      const { skills, keywords } = templateToLoad.criteria;
      setJobContextForAnalysis(skills && keywords ? `${skills}, ${keywords}` : skills || keywords || "");
      toast({ title: "Template Loaded", description: `Criteria "${templateToLoad.name}" applied.`, variant: "default" });
      setIsLoadTemplateDialogOpen(false);
    }
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
    setSavedTemplates(updatedTemplates);
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    toast({ title: "Template Deleted", variant: "default" });
  };

  const handleOpenSummaryDialog = (result: EnrichedScreeningResult) => {
    setSelectedResumeForSummary(result);
    setSummaryResult(null);
    setSummaryError(null);
    setIsSummaryDialogOpen(true);
  };
  const handleGenerateSummary = async (jobDescriptionForSummary: string) => { // Note: this specific JD is for summary only
    if (!selectedResumeForSummary || !selectedResumeForSummary.resumeTextContent) return;
    setIsLoadingSummary(true);
    setSummaryResult(null); setSummaryError(null);
    try {
      const summary = await handleSummarizeResume({ resumeText: selectedResumeForSummary.resumeTextContent, jobDescription: jobDescriptionForSummary });
      setSummaryResult(summary);
      toast({ title: "Summary Generated", variant: "default" });
    } catch (error) {
      setSummaryError((error as Error).message);
      toast({ title: "Summarization Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleOpenSkillGapDialog = (result: EnrichedScreeningResult) => {
    setSelectedResumeForAnalysis(result);
    setSkillGapData(null);
    setSkillGapError(null);
    setIsSkillGapDialogOpen(true);
  };
  const handleGenerateSkillGap = async () => {
    if (!selectedResumeForAnalysis || !selectedResumeForAnalysis.resumeTextContent) return;
    if (!jobContextForAnalysis.trim()) {
        toast({ title: "Missing Job Context", description: "Please define screening criteria or parse a job description first.", variant: "destructive"});
        setSkillGapError("Job context is missing. Please ensure criteria are set or a job description is parsed.");
        return;
    }
    setIsLoadingSkillGap(true);
    setSkillGapData(null); setSkillGapError(null);
    try {
      const analysis = await handleSkillGapAnalysis({ resumeText: selectedResumeForAnalysis.resumeTextContent, jobDescription: jobContextForAnalysis });
      setSkillGapData(analysis);
      toast({ title: "Skill Gap Analysis Complete", variant: "default" });
    } catch (error) {
      setSkillGapError((error as Error).message);
      toast({ title: "Skill Gap Analysis Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingSkillGap(false);
    }
  };
  
  const handleOpenInterviewQuestionsDialog = (result: EnrichedScreeningResult) => {
    setSelectedResumeForAnalysis(result);
    setInterviewQuestionsData(null);
    setInterviewQuestionsError(null);
    setIsInterviewQuestionsDialogOpen(true);
  };
  const handleGenerateInterviewQuestionsAction = async () => {
    if (!selectedResumeForAnalysis || !selectedResumeForAnalysis.resumeTextContent) return;
     if (!jobContextForAnalysis.trim()) {
        toast({ title: "Missing Job Context", description: "Please define screening criteria or parse a job description first.", variant: "destructive"});
        setInterviewQuestionsError("Job context is missing. Please ensure criteria are set or a job description is parsed.");
        return;
    }
    setIsLoadingInterviewQuestions(true);
    setInterviewQuestionsData(null); setInterviewQuestionsError(null);
    try {
      const questions = await handleGenerateInterviewQuestions({ resumeText: selectedResumeForAnalysis.resumeTextContent, jobDescription: jobContextForAnalysis });
      setInterviewQuestionsData(questions);
      toast({ title: "Interview Questions Generated", variant: "default" });
    } catch (error) {
      setInterviewQuestionsError((error as Error).message);
      toast({ title: "Failed to Generate Questions", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingInterviewQuestions(false);
    }
  };

  const handleResultsSelectionChange = (id: string, checked: boolean) => {
    const newSet = new Set(selectedCandidateIdsForComparison);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedCandidateIdsForComparison(newSet);
  };

  const handleOpenCandidateComparisonDialog = () => {
    if (selectedCandidateIdsForComparison.size < 2) {
      toast({ title: "Select Candidates", description: "Please select at least two candidates to compare.", variant: "destructive" });
      return;
    }
    setCandidateComparisonData(null);
    setCandidateComparisonError(null);
    setIsCandidateComparisonDialogOpen(true);
  };

  const handleGenerateCandidateComparison = async () => {
     if (!jobContextForAnalysis.trim()) {
        toast({ title: "Missing Job Context", description: "Please define screening criteria or parse a job description first for comparison.", variant: "destructive"});
        setCandidateComparisonError("Job context is missing. Please ensure criteria are set or a job description is parsed.");
        return;
    }
    const candidatesToCompare = screeningResults
      .filter(r => selectedCandidateIdsForComparison.has(r.originalResumeId) && r.resumeTextContent)
      .map(r => ({ filename: r.filename, resumeText: r.resumeTextContent! }));

    if (candidatesToCompare.length < 2) {
      toast({ title: "Not Enough Data", description: "Need at least two resumes with text content for comparison.", variant: "destructive" });
      setCandidateComparisonError("Not enough candidates with readable text content selected.");
      return;
    }

    setIsLoadingCandidateComparison(true);
    setCandidateComparisonData(null); setCandidateComparisonError(null);
    try {
      const comparison = await handleCompareCandidates({ candidates: candidatesToCompare, jobDescription: jobContextForAnalysis });
      setCandidateComparisonData(comparison);
      toast({ title: "Candidate Comparison Complete", variant: "default" });
    } catch (error) {
      setCandidateComparisonError((error as Error).message);
      toast({ title: "Comparison Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingCandidateComparison(false);
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
          Intelligently screen, summarize, and analyze resumes with AI. Streamline your hiring process.
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
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ListFilter className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Define Screening Criteria</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsJobParserDialogOpen(true)}>
                        <FileText className="mr-2 h-4 w-4" /> Parse JD
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsSaveTemplateDialogOpen(true)} disabled={!criteriaForm.formState.isDirty && !Object.values(criteriaForm.getValues()).some(v => v !== "" && v !== defaultCriteria.experienceLevel)}>
                        <Save className="mr-2 h-4 w-4" /> Save Criteria
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsLoadTemplateDialogOpen(true)} disabled={savedTemplates.length === 0}>
                        <BookOpenCheck className="mr-2 h-4 w-4" /> Load Criteria
                    </Button>
                </div>
            </div>
            <CardDescription>
              Specify or parse criteria. Save/load templates for efficiency.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CriteriaForm 
              onSubmit={criteriaForm.handleSubmit(onSubmitCriteriaAndResumes)}
              isLoading={isLoadingScreening}
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
              type="button"
              onClick={criteriaForm.handleSubmit(onSubmitCriteriaAndResumes)}
              disabled={isLoadingScreening || uploadedResumes.length === 0}
              size="lg"
              className="w-full max-w-xs transition-all"
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl">Screening Results</CardTitle>
                </div>
                <Button 
                    onClick={handleOpenCandidateComparisonDialog} 
                    disabled={selectedCandidateIdsForComparison.size < 2 || isLoadingCandidateComparison}
                    variant="outline"
                >
                    <UsersRound className="mr-2 h-4 w-4" />
                    Compare ({selectedCandidateIdsForComparison.size}) Selected
                </Button>
              </div>
              <CardDescription>
                View outcomes, select candidates for comparison, or analyze individuals.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResultsTable 
                results={screeningResults} 
                selectedIds={selectedCandidateIdsForComparison}
                onSelectionChange={handleResultsSelectionChange}
                onSummarize={handleOpenSummaryDialog} 
                onSkillGap={handleOpenSkillGapDialog}
                onInterviewQuestions={handleOpenInterviewQuestionsDialog}
              />
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
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
        <JobDescriptionParserDialog
            isOpen={isJobParserDialogOpen}
            onOpenChange={setIsJobParserDialogOpen}
            onSubmit={handleParseJobDescriptionSubmit}
            isLoading={isLoadingJobParser}
        />
        <SaveTemplateDialog
            isOpen={isSaveTemplateDialogOpen}
            onOpenChange={setIsSaveTemplateDialogOpen}
            onSave={handleSaveTemplate}
        />
        <LoadTemplateDialog
            isOpen={isLoadTemplateDialogOpen}
            onOpenChange={setIsLoadTemplateDialogOpen}
            templates={savedTemplates}
            onLoad={handleLoadTemplate}
            onDelete={handleDeleteTemplate}
        />
        {selectedResumeForAnalysis && (
            <>
                <SkillGapDialog
                    isOpen={isSkillGapDialogOpen}
                    onOpenChange={setIsSkillGapDialogOpen}
                    resumeFileName={selectedResumeForAnalysis.filename}
                    skillGapData={skillGapData}
                    isLoading={isLoadingSkillGap}
                    error={skillGapError}
                    onGenerate={handleGenerateSkillGap}
                />
                <InterviewQuestionsDialog
                    isOpen={isInterviewQuestionsDialogOpen}
                    onOpenChange={setIsInterviewQuestionsDialogOpen}
                    resumeFileName={selectedResumeForAnalysis.filename}
                    questionsData={interviewQuestionsData}
                    isLoading={isLoadingInterviewQuestions}
                    error={interviewQuestionsError}
                    onGenerate={handleGenerateInterviewQuestionsAction}
                />
            </>
        )}
        <CandidateComparisonDialog
            isOpen={isCandidateComparisonDialogOpen}
            onOpenChange={setIsCandidateComparisonDialogOpen}
            comparisonData={candidateComparisonData}
            isLoading={isLoadingCandidateComparison}
            error={candidateComparisonError}
            onGenerate={handleGenerateCandidateComparison}
            candidateCount={selectedCandidateIdsForComparison.size}
        />

         <footer className="text-center py-8 mt-12 border-t">
            <p className="text-sm text-muted-foreground">
                ResumeFlow &copy; {new Date().getFullYear()}. Powered by GenAI.
            </p>
         </footer>
      </main>
    </>
  );
}
