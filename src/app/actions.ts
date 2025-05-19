
"use server";

import { screenResumes, type ScreenResumesInput, type ScreenResumesOutput } from "@/ai/flows/screen-resumes";
import { summarizeResume, type SummarizeResumeInput, type SummarizeResumeOutput } from "@/ai/flows/summarize-resume";

export async function handleScreenResumes(input: ScreenResumesInput): Promise<ScreenResumesOutput> {
  try {
    const results = await screenResumes(input);
    return results;
  } catch (error) {
    console.error("Error screening resumes:", error);
    // Consider returning a structured error or throwing a custom error
    throw new Error("Failed to screen resumes. Please try again.");
  }
}

export async function handleSummarizeResume(input: SummarizeResumeInput): Promise<SummarizeResumeOutput> {
  try {
    const summary = await summarizeResume(input);
    return summary;
  } catch (error) {
    console.error("Error summarizing resume:", error);
    throw new Error("Failed to summarize resume. Please try again.");
  }
}
