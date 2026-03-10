import { z } from "zod";

export const contentBlockFormSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export type ContentBlockFormValues = z.infer<typeof contentBlockFormSchema>;