import { z } from "zod";

/**
 * Extracts answers wrapped in *asterisks* from a template string.
 * E.g. "Delhi is the capital of *India*" → ["India"]
 */
export function extractBlanks(template: string) {
  const regex = /\*([^*]+)\*/g;
  const blanks: { index: number; answer: string }[] = [];
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(template)) !== null) {
    blanks.push({ index: i, answer: match[1].trim() });
    i++;
  }

  return blanks;
}

/**
 * Generates the display version of the question by replacing
 * *answer* with _____ (for preview purposes).
 */
export function templateToDisplay(template: string): string {
  return template.replace(/\*([^*]+)\*/g, "_____");
}

export const fillUpsFormSchema = z
  .object({
    template: z.string().min(1, "Question is required"),
    points: z
      .number({ error: "Points must be a number" })
      .min(1, "Minimum 1 point")
      .max(100, "Maximum 100 points"),
  })
  .refine(
    (data) => {
      const blanks = extractBlanks(data.template);
      return blanks.length > 0;
    },
    {
      message:
        "Question must contain at least one blank. Wrap answers in asterisks, e.g. *answer*",
      path: ["template"],
    }
  );

export type FillUpsFormValues = z.infer<typeof fillUpsFormSchema>;