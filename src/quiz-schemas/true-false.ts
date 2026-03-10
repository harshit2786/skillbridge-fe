import { z } from "zod";

export const trueFalseFormSchema = z.object({
  question: z.string().min(1, "Statement is required"),
  points: z
    .number({ error: "Points must be a number" })
    .min(1, "Minimum 1 point")
    .max(100, "Maximum 100 points"),
  correctAnswer: z.boolean(),
});

export type TrueFalseFormValues = z.infer<typeof trueFalseFormSchema>;