import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { questionTypeConfigs } from "@/config/questionTypes";
import type { QuestionType } from "@/types/quiz";

interface QuestionTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: QuestionType) => void;
}

export function QuestionTypeSelector({
  open,
  onOpenChange,
  onSelect,
}: QuestionTypeSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose Question Type</DialogTitle>
          <DialogDescription>
            Select the type of question you'd like to add to your quiz.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {questionTypeConfigs.map((config) => {
            const Icon = config.icon;
            return (
              <button
                key={config.id}
                onClick={() => onSelect(config.id)}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 text-left transition-all
                           hover:border-primary/40 hover:shadow-md
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Icon badge */}
                <div
                  className={`shrink-0 rounded-lg p-2.5 ${config.bgColor} transition-transform group-hover:scale-110`}
                >
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>

                {/* Label + description */}
                <div className="min-w-0">
                  <p className="font-medium leading-tight">{config.label}</p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {config.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}