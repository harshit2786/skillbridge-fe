import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fillUpsFormSchema,
  extractBlanks,
  templateToDisplay,
  type FillUpsFormValues,
} from "@/quiz-schemas/fill-ups";

interface FillUpsFormProps {
  onSubmit: (values: FillUpsFormValues) => void;
  onCancel: () => void;
  defaultValues?: FillUpsFormValues;
}

export function FillUpsForm({ onSubmit, onCancel, defaultValues }: FillUpsFormProps) {
  const form = useForm<FillUpsFormValues>({
    resolver: zodResolver(fillUpsFormSchema),
    defaultValues: defaultValues ?? {
      template: "",
      points: 1,
    },
  });

  const templateValue = form.watch("template");
  const blanks = extractBlanks(templateValue);
  const preview = templateToDisplay(templateValue);
  const hasBlanks = blanks.length > 0;

  const handleSubmit = (values: FillUpsFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* ── Instructions ─────────────────── */}
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1.5">
            <p className="font-medium">How to write fill-in-the-blank questions</p>
            <p>
              Write your question normally and wrap the answer(s) you want to
              blank out with <strong>asterisks (*)</strong>.
            </p>
            <div className="rounded-md bg-blue-100/70 px-3 py-2 font-mono text-xs">
              Delhi is the capital of <strong>*India*</strong>.
            </div>
            <p>
              You can have <strong>multiple blanks</strong> in a single question:
            </p>
            <div className="rounded-md bg-blue-100/70 px-3 py-2 font-mono text-xs">
              The <strong>*Sun*</strong> rises in the <strong>*East*</strong>.
            </div>
          </div>
        </div>

        {/* ── Template ─────────────────────── */}
        <FormField
          control={form.control}
          name="template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. The chemical formula of water is *H2O*"
                  rows={4}
                  className="resize-none font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Live preview ─────────────────── */}
        {templateValue.trim().length > 0 && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preview
            </p>
            <p className="text-sm leading-relaxed">
              {hasBlanks ? (
                preview.split("_____").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="mx-1 inline-block min-w-[80px] border-b-2 border-primary/50 text-center text-xs text-muted-foreground">
                        blank {i + 1}
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="italic text-muted-foreground">
                  No blanks detected. Wrap answers with *asterisks*.
                </span>
              )}
            </p>

            {hasBlanks && (
              <div className="flex flex-wrap gap-2 border-t pt-3">
                <p className="w-full text-xs font-medium text-muted-foreground">
                  Answers:
                </p>
                {blanks.map((blank) => (
                  <span
                    key={blank.index}
                    className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                  >
                    {blank.index + 1}. {blank.answer}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Points ───────────────────────── */}
        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  className="w-28"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Actions ──────────────────────── */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {defaultValues ? "Save Changes" : "Add Question"}
          </Button>
        </div>
      </form>
    </Form>
  );
}