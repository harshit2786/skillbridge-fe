import { z } from "zod";

export const rubricCriterionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Criterion title is required"),
  description: z.string(),
  weight: z
    .number({ error: "Weight must be a number" })
    .min(0, "Weight cannot be negative")
    .max(100, "Maximum weight is 100"),
});

export const longAnswerFormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  points: z
    .number({ error: "Points must be a number" })
    .min(1, "Minimum 1 point")
    .max(100, "Maximum 100 points"),
  rubric: z
    .array(rubricCriterionSchema)
    .min(1, "At least one rubric criterion is required"),
  goldenSolution: z.string(),
});

export type LongAnswerFormValues = z.infer<typeof longAnswerFormSchema>;