import { FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddQuestion: () => void;
}

export function EmptyState({ onAddQuestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-24 text-center">
      <div className="mb-6 rounded-full bg-muted p-5">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>

      <h2 className="text-xl font-semibold tracking-tight">
        No questions yet
      </h2>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Get started by adding your first question. You can choose from multiple
        question types including MCQ, Fill‑ups, True/False, and more.
      </p>

      <Button className="mt-8" size="lg" onClick={onAddQuestion}>
        <Plus className="mr-2 h-4 w-4" />
        Add Your First Question
      </Button>
    </div>
  );
}