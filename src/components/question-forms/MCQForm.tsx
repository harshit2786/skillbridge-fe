import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { mcqFormSchema, type MCQFormValues } from "@/quiz-schemas/mcq";

interface MCQFormProps {
  onSubmit: (values: MCQFormValues) => void;
  onCancel: () => void;
  defaultValues?: MCQFormValues;
}

function createOption() {
  return { id: crypto.randomUUID(), text: "", isCorrect: false };
}

export function MCQForm({ onSubmit, onCancel, defaultValues }: MCQFormProps) {
  const form = useForm<MCQFormValues>({
    resolver: zodResolver(mcqFormSchema),
    defaultValues: defaultValues ?? {
      question: "",
      points: 1,
      options: [createOption(), createOption()],
      shuffleOptions: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const handleSubmit = (values: MCQFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* ── Question ─────────────────────── */}
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type your question here…"
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* ── Options ──────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-sm font-medium">Options</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(createOption())}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Option
            </Button>
          </div>

          {form.formState.errors.options?.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.options.root.message}
            </p>
          )}
          {form.formState.errors.options?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.options.message}
            </p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
              >
                <FormField
                  control={form.control}
                  name={`options.${index}.isCorrect`}
                  render={({ field: checkField }) => (
                    <FormItem className="mt-2.5 flex items-center space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={checkField.value}
                          onCheckedChange={checkField.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`options.${index}.text`}
                  render={({ field: textField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={`Option ${index + 1}`}
                          {...textField}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={fields.length <= 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Check the checkbox next to an option to mark it as correct.
          </p>
        </div>

        {/* ── Shuffle toggle ───────────────── */}
        <FormField
          control={form.control}
          name="shuffleOptions"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border bg-muted/30 p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div>
                <FormLabel className="text-sm font-medium leading-none">
                  Shuffle options
                </FormLabel>
                <p className="mt-1 text-xs text-muted-foreground">
                  Display options in a random order for each attempt
                </p>
              </div>
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