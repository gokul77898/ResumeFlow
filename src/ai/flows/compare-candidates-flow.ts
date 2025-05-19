'use server';
/**
 * @fileOverview Compares multiple candidates against a job description.
 *
 * - compareCandidates - Generates a comparison report.
 * - CompareCandidatesInput - The input type.
 * - CompareCandidatesOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CandidateDetailSchema = z.object({
  filename: z.string().describe('Filename of the resume.'),
  resumeText: z.string().describe('The text content of the resume.'),
});

const CompareCandidatesInputSchema = z.object({
  candidates: z.array(CandidateDetailSchema).describe('An array of candidate resumes to compare.'),
  jobDescription: z.string().describe('The job description for the role.'),
});
export type CompareCandidatesInput = z.infer<typeof CompareCandidatesInputSchema>;

const CandidateComparisonResultSchema = z.object({
  filename: z.string().describe('Filename of the resume.'),
  strengths: z.string().describe('Key strengths of this candidate relevant to the job description.'),
  weaknesses: z.string().describe('Potential weaknesses or areas where the candidate is less aligned with the job description.'),
  overallFit: z.enum(["Excellent", "Good", "Fair", "Poor"]).describe('Overall assessment of fit for the role (Excellent, Good, Fair, Poor).'),
});

const CompareCandidatesOutputSchema = z.object({
  overallSummary: z.string().describe('A brief executive summary comparing the candidates.'),
  comparisonDetails: z.array(CandidateComparisonResultSchema).describe('Detailed comparison for each candidate.'),
});
export type CompareCandidatesOutput = z.infer<typeof CompareCandidatesOutputSchema>;

export async function compareCandidates(input: CompareCandidatesInput): Promise<CompareCandidatesOutput> {
  return compareCandidatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareCandidatesPrompt',
  input: {schema: CompareCandidatesInputSchema},
  output: {schema: CompareCandidatesOutputSchema},
  prompt: `You are a lead recruiter tasked with comparing multiple candidates for a role.
Analyze each candidate's resume against the provided job description.
Provide an 'overallSummary' that briefly compares the candidates.
Then, for each candidate, provide:
- 'filename': The resume's filename.
- 'strengths': Key strengths relevant to the job.
- 'weaknesses': Potential weaknesses or misalignments.
- 'overallFit': An assessment from "Excellent", "Good", "Fair", "Poor".

Job Description:
{{{jobDescription}}}

Candidates:
{{#each candidates}}
---
Filename: {{{filename}}}
Resume Text:
{{{resumeText}}}
---
{{/each}}

Return the full comparison as a JSON object matching the specified output schema.`,
});

const compareCandidatesFlow = ai.defineFlow(
  {
    name: 'compareCandidatesFlow',
    inputSchema: CompareCandidatesInputSchema,
    outputSchema: CompareCandidatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
