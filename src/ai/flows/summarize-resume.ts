// SummarizeResume story implementation.

'use server';

/**
 * @fileOverview Summarizes a resume based on a job description.
 *
 * - summarizeResume - A function that handles the resume summarization process.
 * - SummarizeResumeInput - The input type for the summarizeResume function.
 * - SummarizeResumeOutput - The return type for the summarizeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeResumeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description to tailor the resume summary to.'),
});
export type SummarizeResumeInput = z.infer<typeof SummarizeResumeInputSchema>;

const SummarizeResumeOutputSchema = z.object({
  summary: z.string().describe('A summary of the resume highlighting strengths relevant to the job description.'),
});
export type SummarizeResumeOutput = z.infer<typeof SummarizeResumeOutputSchema>;

export async function summarizeResume(input: SummarizeResumeInput): Promise<SummarizeResumeOutput> {
  return summarizeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeResumePrompt',
  input: {schema: SummarizeResumeInputSchema},
  output: {schema: SummarizeResumeOutputSchema},
  prompt: `You are a recruiter summarizing a resume based on a job description.

  Resume Text: {{{resumeText}}}

  Job Description: {{{jobDescription}}}

  Summarize the resume, highlighting the candidate's strengths relevant to the job description. Focus on skills and experiences that align with the job requirements.`,
});

const summarizeResumeFlow = ai.defineFlow(
  {
    name: 'summarizeResumeFlow',
    inputSchema: SummarizeResumeInputSchema,
    outputSchema: SummarizeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
