import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-resume.ts';
import '@/ai/flows/screen-resumes.ts';
import '@/ai/flows/parse-job-description-flow.ts';
import '@/ai/flows/skill-gap-analysis-flow.ts';
import '@/ai/flows/interview-question-flow.ts';
import '@/ai/flows/compare-candidates-flow.ts';
