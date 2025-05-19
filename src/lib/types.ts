
import type { ScreenResumesInput, ScreenResumesOutput } from '@/ai/flows/screen-resumes';
import type { SummarizeResumeInput, SummarizeResumeOutput } from '@/ai/flows/summarize-resume';

export type ScreeningCriteria = ScreenResumesInput['screeningCriteria'];

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

export const experienceLevels = ["Entry-level", "Mid-level", "Senior", "Lead", "Principal", "Staff", "Manager"] as const;
export type ExperienceLevel = typeof experienceLevels[number];

