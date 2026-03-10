import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { LongAnswerFormValues } from "@/quiz-schemas/long-answer";

interface RubricCriterionItemProps {
  id: string;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

export function RubricCriterionItem({
  id,
  index,
  onRemove,
  canRemove,
}: RubricCriterionItemProps) {
  const form = useFormContext<LongAnswerFormValues>();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const title = form.watch(`rubric.${index}.title`);
  const weight = form.watch(`rubric.${index}.weight`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "z-50 opacity-90" : ""}`}
    >
      <AccordionItem value={id} className="rounded-lg border bg-card">
        <div className="flex items-center gap-1 pr-2">
          {/* Drag handle — outside the trigger so it doesn't toggle accordion */}
          <button
            type="button"
            className="shrink-0 cursor-grab touch-none rounded-md p-2 text-muted-foreground/50 transition-colors
                       hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <AccordionTrigger className="flex-1 gap-2 py-3 hover:no-underline">
            <div className="flex flex-1 items-center gap-3 text-left">
              {/* Index */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>

              <span className="truncate text-sm font-medium">
                {title || `Criterion ${index + 1}`}
              </span>

              {weight > 0 && (
                <span className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {weight}%
                </span>
              )}
            </div>
          </AccordionTrigger>

          {/* Delete button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            disabled={!canRemove}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <AccordionContent className="px-4 pb-4 pt-0">
          <div className="space-y-4 pl-7">
            {/* Title */}
            <FormField
              control={form.control}
              name={`rubric.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Mentions key concept X"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weight + Description side by side on larger screens */}
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <FormField
                control={form.control}
                name={`rubric.${index}.weight`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Weight (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`rubric.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this criterion checks for…"
                        rows={2}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}