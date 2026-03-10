import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Shuffle,
  TextCursorInput,
  CheckCircle,
  XCircle,
  Scale,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  Question,
  MCQQuestion,
  FillUpsQuestion,
  TrueFalseQuestion,
  LongAnswerQuestion,
  ContentBlockQuestion,
} from "@/types/quiz";

import "../question-forms/rich-text-styles.css"
import { questionTypeConfigs } from "@/config/questionTypes";

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/* ─── MCQ details ────────────────────── */
function MCQDetails({ question }: { question: MCQQuestion }) {
  return (
    <div className="mt-3 space-y-1.5">
      {question.data.options.map((opt) => (
        <div
          key={opt.id}
          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs
            ${opt.isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-muted/50 text-muted-foreground"}`}
        >
          {opt.isCorrect ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Circle className="h-3.5 w-3.5 shrink-0" />
          )}
          <span className="truncate">{opt.text || "Empty option"}</span>
        </div>
      ))}
      {question.data.shuffleOptions && (
        <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <Shuffle className="h-3 w-3" />
          Options will be shuffled
        </div>
      )}
    </div>
  );
}

/* ─── Fill-ups details ───────────────── */
function FillUpsDetails({ question }: { question: FillUpsQuestion }) {
  const parts = question.data.template.split(/\*([^*]+)\*/g);
  return (
    <div className="mt-3 space-y-2.5">
      <div className="rounded-md bg-muted/40 px-3 py-2 text-sm leading-relaxed">
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <span
              key={i}
              className="mx-0.5 inline-flex items-center gap-1 rounded bg-violet-100 px-2 py-0.5 font-medium text-violet-700"
            >
              <TextCursorInput className="h-3 w-3" />
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {question.data.blanks.length} blank
          {question.data.blanks.length !== 1 ? "s" : ""}:
        </span>
        {question.data.blanks.map((blank) => (
          <span
            key={blank.index}
            className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
          >
            {blank.answer}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── True/False details ─────────────── */
function TrueFalseDetails({ question }: { question: TrueFalseQuestion }) {
  return (
    <div className="mt-3">
      <div
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium
          ${question.data.correctAnswer ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
      >
        {question.data.correctAnswer ? (
          <CheckCircle className="h-3.5 w-3.5" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        Answer: {question.data.correctAnswer ? "True" : "False"}
      </div>
    </div>
  );
}

/* ─── Long Answer details ────────────── */
function LongAnswerDetails({ question }: { question: LongAnswerQuestion }) {
  const totalWeight = question.data.rubric.reduce(
    (sum, c) => sum + c.weight,
    0
  );
  return (
    <div className="mt-3 space-y-2.5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Scale className="h-3 w-3" />
          Rubric · {question.data.rubric.length} criteri
          {question.data.rubric.length === 1 ? "on" : "a"} · {totalWeight}%
          total weight
        </div>
        {question.data.rubric.map((criterion, i) => (
          <div
            key={criterion.id}
            className="flex items-center gap-2 rounded-md bg-amber-50/60 px-2.5 py-1.5 text-xs"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
              {i + 1}
            </span>
            <span className="flex-1 truncate font-medium text-amber-900">
              {criterion.title || "Untitled criterion"}
            </span>
            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              {criterion.weight}%
            </span>
          </div>
        ))}
      </div>
      {question.data.goldenSolution && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3 w-3" />
          Golden solution provided
        </div>
      )}
    </div>
  );
}

/* ─── Content Block details ──────────── */
function ContentBlockDetails({
  question,
}: {
  question: ContentBlockQuestion;
}) {
  return (
    <div className="mt-3">
      <div
        className="tiptap max-h-[300px] overflow-hidden rounded-md border bg-muted/20 px-3 py-2 text-sm
                   [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
        dangerouslySetInnerHTML={{ __html: question.data.content }}
      />
    </div>
  );
}

/* ─── Main card ──────────────────────── */
export function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConfig = questionTypeConfigs.find((c) => c.id === question.type);
  const Icon = typeConfig?.icon;

  const renderDetails = () => {
    switch (question.type) {
      case "mcq":
        return <MCQDetails question={question} />;
      case "fill_ups":
        return <FillUpsDetails question={question} />;
      case "true_false":
        return <TrueFalseDetails question={question} />;
      case "long_answer":
        return <LongAnswerDetails question={question} />;
      case "content_block":
        return <ContentBlockDetails question={question} />;
      default:
        return null;
    }
  };

  const isContentBlock = question.type === "content_block";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border bg-card p-4 transition-all
        ${isContentBlock ? "border-dashed" : ""}
        ${isDragging ? "z-50 scale-[1.02] shadow-xl ring-2 ring-primary/20" : "shadow-sm hover:shadow-md"}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded-md p-1.5 text-muted-foreground/50 transition-colors
                     hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">
            {isContentBlock
              ? question.data.contentText
                ? question.data.contentText.slice(0, 80) +
                  (question.data.contentText.length > 80 ? "…" : "")
                : "Content Block"
              : question.question || "Untitled Question"}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {typeConfig && Icon && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${typeConfig.bgColor} ${typeConfig.iconColor}`}
              >
                <Icon className="h-3 w-3" />
                {typeConfig.label}
              </span>
            )}
            {!isContentBlock && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {question.points} {question.points === 1 ? "pt" : "pts"}
              </span>
            )}
          </div>

          {renderDetails()}
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(question.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(question.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}