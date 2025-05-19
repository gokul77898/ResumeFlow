
import type { ScreenResumesInput } from '@/ai/flows/screen-resumes';
import type { SummarizeResumeInput, SummarizeResumeOutput } from '@/ai/flows/summarize-resume';
import type { ParseJobDescriptionInput, ParseJobDescriptionOutput } from '@/ai/flows/parse-job-description-flow';
import type { SkillGapAnalysisInput, SkillGapAnalysisOutput } from '@/ai/flows/skill-gap-analysis-flow';
import type { InterviewQuestionInput, InterviewQuestionOutput } from '@/ai/flows/interview-question-flow';
import type { CompareCandidatesInput, CompareCandidatesOutput } from '@/ai/flows/compare-candidates-flow';
import * as z from 'zod';

export const experienceLevels = ["Entry-level", "Mid-level", "Senior", "Lead", "Principal", "Staff", "Manager"] as const;
export type ExperienceLevel = typeof experienceLevels[number];

export const screeningCriteriaSchema = z.object({
  keywords: z.string().min(1, "Keywords are required.").describe('Comma-separated keywords to look for in resumes.'),
  experienceLevel: z.enum(experienceLevels, {
    required_error: "Experience level is required.",
  }).describe('Minimum experience level required.'),
  skills: z.string().min(1, "Skills are required.").describe('Comma-separated list of essential skills.'),
});

export type ScreeningCriteria = z.infer<typeof screeningCriteriaSchema>;

export type UploadedResume = {
  id: string; // Unique ID for client-side keying and React lists
  file: File; // Original file object
  filename: string;
  dataUri: string; // For screenResumes AI flow
  textContent: string | null; // For summarizeResume AI flow, null if not .txt or unreadable
};

// This type comes from the AI flow (ScreenResumesOutput is an array of this)
export type ScreeningResultItem = { 
  filename: string;
  match: boolean;
  summary: string;
};

// Enriched type for local state, linking back to original uploaded resume for summarization
export type EnrichedScreeningResult = ScreeningResultItem & {
  originalResumeId: string; 
  resumeTextContent: string | null; // To pass to summarization dialog
};

export type ResumeSummaryJobData = {
  jobDescription: string;
  resumeText: string;
};

export type AISummary = SummarizeResumeOutput;

// Types for new features
export type ParsedJobCriteria = ParseJobDescriptionOutput;
export type JobParserInput = ParseJobDescriptionInput;

export type SkillGapInput = SkillGapAnalysisInput;
export type SkillGapData = SkillGapAnalysisOutput;

export type InterviewQuestionsInput = InterviewQuestionInput;
export type InterviewQuestionsData = InterviewQuestionOutput;

export type CandidateComparisonInput = CompareCandidatesInput;
export type CandidateComparisonData = CompareCandidatesOutput;

export type SavedScreeningTemplate = {
  id: string;
  name: string;
  criteria: ScreeningCriteria;
};

