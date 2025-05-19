
// 'use server'
'use server';

/**
 * @fileOverview Implements a Genkit flow for screening resumes based on defined criteria.
 *
 * - screenResumes - Screens resumes based on keywords, experience, and skills.
 * - ScreenResumesInput - The input type for the screenResumes function.
 * - ScreenResumesOutput - The return type for the screenResumes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { screeningCriteriaSchema } from '@/lib/types'; // Import the centralized schema

// const ScreeningCriteriaSchema = z.object({ // Remove local definition
//   keywords: z.string().describe('Keywords to search for in the resume.'),
//   experienceLevel: z
//     .string()
//     .describe('Minimum experience level required (e.g., entry, mid, senior).'),
//   skills: z.string().describe('Specific skills required for the job.'),
// });

const ResumeSchema = z.object({
  filename: z.string().describe('Name of the uploaded file'),
  dataUri: z
    .string()
    .describe(
      "Resume document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const ScreenResumesInputSchema = z.object({
  screeningCriteria: screeningCriteriaSchema.describe( // Use imported schema
    'Criteria to use for screening resumes.'
  ),
  resumes: z.array(ResumeSchema).describe('Array of resumes to screen.'),
});

export type ScreenResumesInput = z.infer<typeof ScreenResumesInputSchema>;

const ResumeResultSchema = z.object({
  filename: z.string().describe('Name of the uploaded file'),
  match: z.boolean().describe('Whether the resume matches the screening criteria.'),
  summary: z.string().describe('Summary of why the resume matches or does not match the criteria.'),
});

const ScreenResumesOutputSchema = z.array(ResumeResultSchema);

export type ScreenResumesOutput = z.infer<typeof ScreenResumesOutputSchema>;

export async function screenResumes(input: ScreenResumesInput): Promise<ScreenResumesOutput> {
  return screenResumesFlow(input);
}

const screenResumesPrompt = ai.definePrompt({
  name: 'screenResumesPrompt',
  input: {schema: ScreenResumesInputSchema},
  output: {schema: ScreenResumesOutputSchema},
  prompt: `You are an AI resume screener.  Given the following screening criteria and resumes, determine which resumes match the criteria.

Screening Criteria:
Keywords: {{{screeningCriteria.keywords}}}
Experience Level: {{{screeningCriteria.experienceLevel}}}
Skills: {{{screeningCriteria.skills}}}

Resumes:
{{#each resumes}}
Filename: {{{filename}}}
Data: {{media url=dataUri}}
{{/each}}

For each resume, determine if it is a match based on the screening criteria.  Also provide a short summary of why it matches or does not match. Return the results as a JSON array.
`,
});

const screenResumesFlow = ai.defineFlow(
  {
    name: 'screenResumesFlow',
    inputSchema: ScreenResumesInputSchema,
    outputSchema: ScreenResumesOutputSchema,
  },
  async input => {
    const {output} = await screenResumesPrompt(input);
    return output!;
  }
);

