
"use server";

import { screenResumes, type ScreenResumesInput, type ScreenResumesOutput } from "@/ai/flows/screen-resumes";
import { summarizeResume, type SummarizeResumeInput, type SummarizeResumeOutput } from "@/ai/flows/summarize-resume";
import { parseJobDescription, type ParseJobDescriptionInput, type ParseJobDescriptionOutput } from "@/ai/flows/parse-job-description-flow";
import { skillGapAnalysis, type SkillGapAnalysisInput, type SkillGapAnalysisOutput } from "@/ai/flows/skill-gap-analysis-flow";
import { generateInterviewQuestions, type InterviewQuestionInput, type InterviewQuestionOutput } from "@/ai/flows/interview-question-flow";
import { compareCandidates, type CompareCandidatesInput, type CompareCandidatesOutput } from "@/ai/flows/compare-candidates-flow";

export async function handleScreenResumes(input: ScreenResumesInput): Promise<ScreenResumesOutput> {
  try {
    const results = await screenResumes(input);
    return results;
  } catch (error) {
    console.error("Error screening resumes:", error);
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

export async function handleParseJobDescription(input: ParseJobDescriptionInput): Promise<ParseJobDescriptionOutput> {
  try {
    const criteria = await parseJobDescription(input);
    return criteria;
  } catch (error) {
    console.error("Error parsing job description:", error);
    throw new Error("Failed to parse job description. Please try again.");
  }
}

export async function handleSkillGapAnalysis(input: SkillGapAnalysisInput): Promise<SkillGapAnalysisOutput> {
  try {
    const analysis = await skillGapAnalysis(input);
    return analysis;
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    throw new Error("Failed to analyze skill gap. Please try again.");
  }
}

export async function handleGenerateInterviewQuestions(input: InterviewQuestionInput): Promise<InterviewQuestionOutput> {
  try {
    const questions = await generateInterviewQuestions(input);
    return questions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw new Error("Failed to generate interview questions. Please try again.");
  }
}

export async function handleCompareCandidates(input: CompareCandidatesInput): Promise<CompareCandidatesOutput> {
  try {
    const comparison = await compareCandidates(input);
    return comparison;
  } catch (error) {
    console.error("Error comparing candidates:", error);
    throw new Error("Failed to compare candidates. Please try again.");
  }
}
