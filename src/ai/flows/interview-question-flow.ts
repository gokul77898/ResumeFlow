'use server';
/**
 * @fileOverview Generates interview questions based on a resume and job description.
 *
 * - generateInterviewQuestions - Creates tailored interview questions.
 * - InterviewQuestionInput - The input type.
 * - InterviewQuestionOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterviewQuestionInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description for the role.'),
});
export type InterviewQuestionInput = z.infer<typeof InterviewQuestionInputSchema>;

const InterviewQuestionOutputSchema = z.object({
  behavioral: z.array(z.string()).describe('Behavioral questions to assess soft skills and past experiences.'),
  technical: z.array(z.string()).describe('Technical questions to assess specific skills and knowledge (if applicable to the role).'),
  situational: z.array(z.string()).describe('Situational questions to assess problem-solving and decision-making abilities.'),
});
export type InterviewQuestionOutput = z.infer<typeof InterviewQuestionOutputSchema>;

export async function generateInterviewQuestions(input: InterviewQuestionInput): Promise<InterviewQuestionOutput> {
  return interviewQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewQuestionPrompt',
  input: {schema: InterviewQuestionInputSchema},
  output: {schema: InterviewQuestionOutputSchema},
  prompt: `You are an experienced hiring manager. Based on the candidate's resume and the target job description below, generate a list of 3-5 insightful interview questions for each category: behavioral, technical (if the job description implies technical skills, otherwise this can be a short list or focus on role-specific knowledge), and situational.

Candidate's Resume Text:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Return the questions as a JSON object with three arrays: 'behavioral', 'technical', and 'situational'.`,
});

const interviewQuestionFlow = ai.defineFlow(
  {
    name: 'interviewQuestionFlow',
    inputSchema: InterviewQuestionInputSchema,
    outputSchema: InterviewQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
