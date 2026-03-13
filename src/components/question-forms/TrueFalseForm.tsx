import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, XCircle } from "lucide-react";
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
  trueFalseFormSchema,
  type TrueFalseFormValues,
} from "@/quiz-schemas/true-false";

interface TrueFalseFormProps {
  onSubmit: (values: TrueFalseFormValues) => void;
  onCancel: () => void;
  defaultValues?: TrueFalseFormValues;
  hidePoints?: boolean;
}

export function TrueFalseForm({
  onSubmit,
  onCancel,
  defaultValues,
  hidePoints = false,
}: TrueFalseFormProps) {
  const form = useForm<TrueFalseFormValues>({
    resolver: zodResolver(trueFalseFormSchema),
    defaultValues: defaultValues ?? {
      question: "",
      points: 1,
      correctAnswer: true,
    },
  });

  const correctAnswer = form.watch("correctAnswer");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statement</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. The Earth revolves around the Sun."
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="correctAnswer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct Answer</FormLabel>
              <FormControl>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all
                      ${
                        correctAnswer
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/40"
                      }`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    True
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all
                      ${
                        !correctAnswer
                          ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/40"
                      }`}
                  >
                    <XCircle className="h-4 w-4" />
                    False
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!hidePoints && (
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
        )}

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
