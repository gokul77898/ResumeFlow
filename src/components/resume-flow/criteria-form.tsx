
"use client";

import type { Control } from "react-hook-form";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScreeningCriteria } from "@/lib/types";
import { experienceLevels } from "@/lib/types";
import type { ExperienceLevel } from "@/lib/types";

export const screeningCriteriaSchema = z.object({
  keywords: z.string().min(1, "Keywords are required."),
  experienceLevel: z.enum(experienceLevels, {
    required_error: "Experience level is required.",
  }),
  skills: z.string().min(1, "Skills are required."),
});

type CriteriaFormProps = {
  onSubmit: (data: ScreeningCriteria) => void;
  isLoading?: boolean;
  initialData?: Partial<ScreeningCriteria>;
};

export function CriteriaForm({ onSubmit, isLoading, initialData }: CriteriaFormProps) {
  const form = useForm<ScreeningCriteria>({
    resolver: zodResolver(screeningCriteriaSchema),
    defaultValues: {
      keywords: initialData?.keywords || "",
      experienceLevel: initialData?.experienceLevel as ExperienceLevel || experienceLevels[0],
      skills: initialData?.skills || "",
    },
  });

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., TypeScript, Next.js, Agile" {...field} />
                </FormControl>
                <FormDescription>
                  Comma-separated keywords to look for in resumes.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Experience Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Required Skills</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Project Management, Figma, API Design" {...field} />
                </FormControl>
                <FormDescription>
                  Comma-separated list of essential skills.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* The submit button will be part of the parent form in page.tsx to coordinate with resume uploads */}
        </form>
      </Form>
    </FormProvider>
  );
}

// Export Control type for use in parent component if needed for external submit
export type CriteriaFormControl = Control<ScreeningCriteria>;
export { useForm as useCriteriaForm };
