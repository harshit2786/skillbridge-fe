import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RichTextEditor } from "./RichTextEditor";
import {
  contentBlockFormSchema,
  type ContentBlockFormValues,
} from "@/quiz-schemas/content-block";

import "./rich-text-styles.css";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";

interface ContentBlockFormProps {
  onSubmit: (values: ContentBlockFormValues) => void;
  onCancel: () => void;
  defaultValues?: ContentBlockFormValues;
}

export function ContentBlockForm({
  onSubmit,
  onCancel,
  defaultValues,
}: ContentBlockFormProps) {
  const form = useForm<ContentBlockFormValues>({
    resolver: zodResolver(contentBlockFormSchema),
    defaultValues: defaultValues ?? {
      content: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex gap-3 rounded-lg border border-pink-200 bg-pink-50 p-4 text-sm text-pink-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">Content Block</p>
            <p>
              This is not a question — it's an informational block displayed to
              the student. Use it for instructions, context, code snippets, or
              embedded videos.
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Write your content here… Use the toolbar for formatting, code blocks, and video embeds."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {defaultValues ? "Save Changes" : "Add Content Block"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
