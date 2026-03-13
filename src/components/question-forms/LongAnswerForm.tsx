import { useState } from "react";
import { useFieldArray, useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Sparkles, Scale } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RubricCriterionItem } from "./RubricCriterionItem";
import {
  longAnswerFormSchema,
  type LongAnswerFormValues,
} from "@/quiz-schemas/long-answer";

interface LongAnswerFormProps {
  onSubmit: (values: LongAnswerFormValues) => void;
  onCancel: () => void;
  defaultValues?: LongAnswerFormValues;
  hidePoints?: boolean;
}

function createCriterion() {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    weight: 0,
  };
}

export function LongAnswerForm({
  onSubmit,
  onCancel,
  defaultValues,
  hidePoints = false,
}: LongAnswerFormProps) {
  const initialValues = defaultValues ?? {
    question: "",
    points: 1,
    rubric: [createCriterion()],
    goldenSolution: "",
  };

  const form = useForm<LongAnswerFormValues>({
    resolver: zodResolver(longAnswerFormSchema),
    defaultValues: initialValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "rubric",
  });

  const [openItems, setOpenItems] = useState<string[]>([
    initialValues.rubric[0]?.id ?? "",
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const handleAddCriterion = () => {
    const newCriterion = createCriterion();
    append(newCriterion);
    setOpenItems((prev) => [...prev, newCriterion.id]);
  };

  const totalWeight = form
    .watch("rubric")
    .reduce((sum, c) => sum + (c.weight || 0), 0);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your long-answer question here…"
                  rows={3}
                  className="resize-none"
                  {...field}
                />
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

        {/* ── Rubric ───────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <FormLabel className="text-sm font-medium">
                Grading Rubric
              </FormLabel>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                className="gap-1.5"
                title="Coming soon"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ask AI
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCriterion}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Criterion
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Each criterion is a yes/no check applied to the student's answer.
            Assign a weight (%) to indicate importance.
          </p>

          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium
              ${
                totalWeight === 100
                  ? "bg-emerald-50 text-emerald-700"
                  : totalWeight > 100
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700"
              }`}
          >
            <Scale className="h-3.5 w-3.5" />
            Total weight: {totalWeight}%
            {totalWeight !== 100 && (
              <span className="ml-1 font-normal">
                {totalWeight < 100
                  ? `(${100 - totalWeight}% remaining)`
                  : `(${totalWeight - 100}% over)`}
              </span>
            )}
          </div>

          {form.formState.errors.rubric?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.rubric.message}
            </p>
          )}
          {form.formState.errors.rubric?.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.rubric.root.message}
            </p>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <Accordion
                type="multiple"
                value={openItems}
                onValueChange={setOpenItems}
                className="space-y-2"
              >
                {fields.map((field, index) => (
                  <RubricCriterionItem
                    key={field.id}
                    id={field.id}
                    index={index}
                    canRemove={fields.length > 1}
                    onRemove={() => remove(index)}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
        </div>

        <FormField
          control={form.control}
          name="goldenSolution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Golden Solution</FormLabel>
              <p className="text-xs text-muted-foreground">
                An ideal answer for reference. This can be used by AI grading or
                shown after the quiz.
              </p>
              <FormControl>
                <Textarea
                  placeholder="Write the ideal/expected answer here…"
                  rows={5}
                  className="resize-none"
                  {...field}
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
            {defaultValues ? "Save Changes" : "Add Question"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
