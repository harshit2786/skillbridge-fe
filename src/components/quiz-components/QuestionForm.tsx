import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { questionTypeConfigs } from "@/config/questionTypes";
import {
  MCQForm,
  FillUpsForm,
  TrueFalseForm,
  LongAnswerForm,
  ContentBlockForm,
} from "@/components/question-forms";
import type {
  Question,
  QuestionType,
  MCQQuestion,
  FillUpsQuestion,
  TrueFalseQuestion,
  LongAnswerQuestion,
  ContentBlockQuestion,
} from "@/types/quiz";
import {
  type FillUpsFormValues,
  extractBlanks,
  templateToDisplay,
} from "@/quiz-schemas/fill-ups";
import type { TrueFalseFormValues } from "@/quiz-schemas/true-false";
import type { LongAnswerFormValues } from "@/quiz-schemas/long-answer";
import type { ContentBlockFormValues } from "@/quiz-schemas/content-block";
import type { MCQFormValues } from "@/quiz-schemas/mcq";

interface QuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: QuestionType;
  onSubmit: (question: Question) => void;
  editingQuestion?: Question | null;
  nextOrder: number;
}

export function QuestionForm({
  open,
  onOpenChange,
  type,
  onSubmit,
  editingQuestion,
  nextOrder,
}: QuestionFormProps) {
  const typeConfig = questionTypeConfigs.find((c) => c.id === type);
  const Icon = typeConfig?.icon;
  const isEditing = !!editingQuestion;
  const order = editingQuestion?.order ?? nextOrder;

  /* ─── Per-type submit handlers ──────────── */

  const handleMCQSubmit = (values: MCQFormValues) => {
    const question: MCQQuestion = {
      id: editingQuestion?.id ?? crypto.randomUUID(),
      type: "mcq",
      question: values.question,
      points: values.points,
      createdAt: "",
      updatedAt: "",
      sectionId: "",
      order,
      data: {
        options: values.options,
        shuffleOptions: values.shuffleOptions,
      },
    };
    onSubmit(question);
  };

  const handleFillUpsSubmit = (values: FillUpsFormValues) => {
    const blanks = extractBlanks(values.template);
    const displayQuestion = templateToDisplay(values.template);

    const question: FillUpsQuestion = {
      id: editingQuestion?.id ?? crypto.randomUUID(),
      type: "fill_ups",
      question: displayQuestion,
      points: values.points,
      order,
      createdAt: "",
      updatedAt: "",
      sectionId: "",
      data: {
        template: values.template,
        blanks,
      },
    };
    onSubmit(question);
  };

  const handleTrueFalseSubmit = (values: TrueFalseFormValues) => {
    const question: TrueFalseQuestion = {
      id: editingQuestion?.id ?? crypto.randomUUID(),
      type: "true_false",
      question: values.question,
      points: values.points,
      order,
      createdAt: "",
      updatedAt: "",
      sectionId: "",
      data: {
        correctAnswer: values.correctAnswer,
      },
    };
    onSubmit(question);
  };

  const handleLongAnswerSubmit = (values: LongAnswerFormValues) => {
    const question: LongAnswerQuestion = {
      id: editingQuestion?.id ?? crypto.randomUUID(),
      type: "long_answer",
      question: values.question,
      points: values.points,
      order,
      createdAt: "",
      updatedAt: "",
      sectionId: "",
      data: {
        rubric: values.rubric,
        goldenSolution: values.goldenSolution,
      },
    };
    onSubmit(question);
  };

  const handleContentBlockSubmit = (values: ContentBlockFormValues) => {
    const div = document.createElement("div");
    div.innerHTML = values.content;
    const plainText = div.textContent || div.innerText || "";

    const question: ContentBlockQuestion = {
      id: editingQuestion?.id ?? crypto.randomUUID(),
      type: "content_block",
      question: plainText.slice(0, 120).trim() || "Content Block",
      points: 0,
      order,
      createdAt: "",
      updatedAt: "",
      sectionId: "",
      data: {
        content: values.content,
        contentText: plainText.trim(),
      },
    };
    onSubmit(question);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  /* ─── Extract default values for editing ── */

  const getMCQDefaults = (): MCQFormValues | undefined => {
    if (!editingQuestion || editingQuestion.type !== "mcq") return undefined;
    const q = editingQuestion;
    return {
      question: q.question,
      points: q.points,
      options: q.data.options,
      shuffleOptions: q.data.shuffleOptions,
    };
  };

  const getFillUpsDefaults = (): FillUpsFormValues | undefined => {
    if (!editingQuestion || editingQuestion.type !== "fill_ups") return undefined;
    const q = editingQuestion;
    return {
      template: q.data.template,
      points: q.points,
    };
  };

  const getTrueFalseDefaults = (): TrueFalseFormValues | undefined => {
    if (!editingQuestion || editingQuestion.type !== "true_false") return undefined;
    const q = editingQuestion;
    return {
      question: q.question,
      points: q.points,
      correctAnswer: q.data.correctAnswer,
    };
  };

  const getLongAnswerDefaults = (): LongAnswerFormValues | undefined => {
    if (!editingQuestion || editingQuestion.type !== "long_answer") return undefined;
    const q = editingQuestion;
    return {
      question: q.question,
      points: q.points,
      rubric: q.data.rubric,
      goldenSolution: q.data.goldenSolution,
    };
  };

  const getContentBlockDefaults = (): ContentBlockFormValues | undefined => {
    if (!editingQuestion || editingQuestion.type !== "content_block") return undefined;
    const q = editingQuestion;
    return {
      content: q.data.content,
    };
  };

  /* ─── Form renderer ────────────────────── */

  const renderForm = () => {
    switch (type) {
      case "mcq":
        return (
          <MCQForm
            key={editingQuestion?.id ?? "new"}
            onSubmit={handleMCQSubmit}
            onCancel={handleCancel}
            defaultValues={getMCQDefaults()}
          />
        );
      case "fill_ups":
        return (
          <FillUpsForm
            key={editingQuestion?.id ?? "new"}
            onSubmit={handleFillUpsSubmit}
            onCancel={handleCancel}
            defaultValues={getFillUpsDefaults()}
          />
        );
      case "true_false":
        return (
          <TrueFalseForm
            key={editingQuestion?.id ?? "new"}
            onSubmit={handleTrueFalseSubmit}
            onCancel={handleCancel}
            defaultValues={getTrueFalseDefaults()}
          />
        );
      case "long_answer":
        return (
          <LongAnswerForm
            key={editingQuestion?.id ?? "new"}
            onSubmit={handleLongAnswerSubmit}
            onCancel={handleCancel}
            defaultValues={getLongAnswerDefaults()}
          />
        );
      case "content_block":
        return (
          <ContentBlockForm
            key={editingQuestion?.id ?? "new"}
            onSubmit={handleContentBlockSubmit}
            onCancel={handleCancel}
            defaultValues={getContentBlockDefaults()}
          />
        );
      default:
        return (
          <p className="py-8 text-center text-sm text-muted-foreground">
            This question type is not yet implemented.
          </p>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {typeConfig && Icon && (
              <div className={`rounded-lg p-2.5 ${typeConfig.bgColor}`}>
                <Icon className={`h-5 w-5 ${typeConfig.iconColor}`} />
              </div>
            )}
            <div>
              <DialogTitle className="text-lg">
                {isEditing ? "Edit" : "Add"}{" "}
                {type === "content_block"
                  ? "Content Block"
                  : `${typeConfig?.label} Question`}
              </DialogTitle>
              <DialogDescription>{typeConfig?.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2">{renderForm()}</div>
      </DialogContent>
    </Dialog>
  );
}