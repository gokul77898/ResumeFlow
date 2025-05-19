
'use server';
/**
 * @fileOverview Parses a job description to extract screening criteria.
 *
 * - parseJobDescription - Extracts keywords, experience level, and skills from a job description.
 * - ParseJobDescriptionInput - The input type for the parseJobDescription function.
 * - ParseJobDescriptionOutput - The return type for the parseJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { screeningCriteriaSchema, experienceLevels } from '@/lib/types'; // Updated import

const ParseJobDescriptionInputSchema = z.object({
  jobDescriptionText: z.string().describe('The full text of the job description.'),
});
export type ParseJobDescriptionInput = z.infer<typeof ParseJobDescriptionInputSchema>;

// Output schema should match ScreeningCriteria from lib/types or criteria-form
// Removed 'export' from the line below
const ParseJobDescriptionOutputSchema = screeningCriteriaSchema.pick({
  keywords: true,
  experienceLevel: true,
  skills: true,
});
export type ParseJobDescriptionOutput = z.infer<typeof ParseJobDescriptionOutputSchema>;

export async function parseJobDescription(input: ParseJobDescriptionInput): Promise<ParseJobDescriptionOutput> {
  return parseJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseJobDescriptionPrompt',
  input: {schema: ParseJobDescriptionInputSchema},
  output: {schema: ParseJobDescriptionOutputSchema},
  prompt: `You are an expert HR assistant. Parse the following job description and extract:
1.  Relevant keywords (comma-separated).
2.  The required experience level. Choose ONE from the following list: ${experienceLevels.join(', ')}.
3.  Essential skills (comma-separated).

Job Description:
{{{jobDescriptionText}}}

Present the output as a JSON object matching the specified output schema. Ensure the experienceLevel field strictly matches one of the provided options.`,
});

const parseJobDescriptionFlow = ai.defineFlow(
  {
    name: 'parseJobDescriptionFlow',
    inputSchema: ParseJobDescriptionInputSchema,
    outputSchema: ParseJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

