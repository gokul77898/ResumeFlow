'use server';
/**
 * @fileOverview Analyzes skill gaps between a resume and a job description.
 *
 * - skillGapAnalysis - Identifies missing skills and suggests improvements.
 * - SkillGapAnalysisInput - The input type.
 * - SkillGapAnalysisOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillGapAnalysisInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description to compare against.'),
});
export type SkillGapAnalysisInput = z.infer<typeof SkillGapAnalysisInputSchema>;

const SkillGapAnalysisOutputSchema = z.object({
  missingSkills: z.array(z.string()).describe('List of key skills from the job description missing or underrepresented in the resume.'),
  suggestions: z.string().describe('Actionable suggestions for improving the resume to address these gaps.'),
});
export type SkillGapAnalysisOutput = z.infer<typeof SkillGapAnalysisOutputSchema>;

export async function skillGapAnalysis(input: SkillGapAnalysisInput): Promise<SkillGapAnalysisOutput> {
  return skillGapAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillGapAnalysisPrompt',
  input: {schema: SkillGapAnalysisInputSchema},
  output: {schema: SkillGapAnalysisOutputSchema},
  prompt: `You are a career coach. Analyze the provided resume against the job description.
Identify key skills and requirements from the job description that are missing or significantly underrepresented in the resume.
List these missing skills.
Provide brief, actionable suggestions for how the resume could be improved to better align with the job description, focusing on the identified gaps.

Resume Text:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Return the analysis as a JSON object with 'missingSkills' (an array of strings) and 'suggestions' (a string).`,
});

const skillGapAnalysisFlow = ai.defineFlow(
  {
    name: 'skillGapAnalysisFlow',
    inputSchema: SkillGapAnalysisInputSchema,
    outputSchema: SkillGapAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
