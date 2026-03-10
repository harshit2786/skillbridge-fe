import { z } from "zod";

export const mcqOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

export const mcqFormSchema = z
  .object({
    question: z.string().min(1, "Question is required"),
    points: z
      .number({ error: "Points must be a number" })
      .min(1, "Minimum 1 point")
      .max(100, "Maximum 100 points"),
    options: z
      .array(mcqOptionSchema)
      .min(1, "At least one option is required"),
    shuffleOptions: z.boolean(),
  })
  .refine((data) => data.options.some((o) => o.isCorrect), {
    message: "At least one option must be marked as correct",
    path: ["options"],
  });

export type MCQFormValues = z.infer<typeof mcqFormSchema>;