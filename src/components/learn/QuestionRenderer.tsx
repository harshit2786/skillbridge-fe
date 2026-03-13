/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  XCircle,
  CheckCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseQuestionItem } from "@/types/learn";
import type { QuizQuestionItem } from "@/types/learn";

import "../question-forms/rich-text-styles.css";

// ─── Types ───────────────────────────────────────────────────────

type QuestionItem = CourseQuestionItem | QuizQuestionItem;

type Mode = "course" | "quiz";

interface QuestionRendererProps {
  question: QuestionItem;
  index: number;
  mode: Mode;
  onSubmit: (questionId: string, answer: any) => Promise<any>;
  isSubmitting: boolean;
}

// Helpers to check state
function isCompleted(question: QuestionItem, mode: Mode): boolean {
  if (mode === "course") return (question as CourseQuestionItem).completed;
  return (question as QuizQuestionItem).submitted;
}

function getSubmittedResponse(question: QuestionItem, mode: Mode): any {
  if (mode === "quiz") return (question as QuizQuestionItem).submittedResponse;
  return null;
}

// ─── Main Renderer ───────────────────────────────────────────────

export default function QuestionRenderer({
  question,
  index,
  mode,
  onSubmit,
  isSubmitting,
}: QuestionRendererProps) {
  const done = isCompleted(question, mode);

  if (question.type === "content_block") {
    return <ContentBlockView question={question} />;
  }

  return (
    <div
      className={`rounded-xl border transition-all ${
        done
          ? mode === "course"
            ? "border-emerald-200 bg-emerald-50/30"
            : "border-violet-200 bg-violet-50/30"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="p-6">
        {/* Question header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? mode === "course"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-violet-100 text-violet-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {index + 1}
            </div>
            <p className="text-sm font-medium leading-relaxed text-gray-900">
              {question.question}
            </p>
          </div>
          {done && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                mode === "course"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-violet-100 text-violet-600"
              }`}
            >
              {mode === "course" ? "✓ Correct" : "✓ Locked"}
            </span>
          )}
        </div>

        {/* Question body by type */}
        <QuestionBody
          question={question}
          mode={mode}
          done={done}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

// ─── Question Body Router ────────────────────────────────────────

function QuestionBody({
  question,
  mode,
  done,
  onSubmit,
  isSubmitting,
}: {
  question: QuestionItem;
  mode: Mode;
  done: boolean;
  onSubmit: (questionId: string, answer: any) => Promise<any>;
  isSubmitting: boolean;
}) {
  switch (question.type) {
    case "mcq":
      return (
        <MCQInteractive
          question={question}
          mode={mode}
          done={done}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    case "true_false":
      return (
        <TrueFalseInteractive
          question={question}
          mode={mode}
          done={done}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    case "fill_ups":
      return (
        <FillUpsInteractive
          question={question}
          mode={mode}
          done={done}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    case "long_answer":
      return (
        <LongAnswerInteractive
          question={question}
          mode={mode}
          done={done}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      );
    default:
      return null;
  }
}

// ─── MCQ ─────────────────────────────────────────────────────────

function MCQInteractive({
  question,
  mode,
  done,
  onSubmit,
  isSubmitting,
}: {
  question: QuestionItem;
  mode: Mode;
  done: boolean;
  onSubmit: (questionId: string, answer: any) => Promise<any>;
  isSubmitting: boolean;
}) {
  const options: { id: string; text: string }[] = question.data?.options ?? [];
  const correctCount: number = question.data?.correctCount ?? 1;
  const isMultiSelect = correctCount > 1;
  const submittedResponse = getSubmittedResponse(question, mode);

  // For multi-select: store array of IDs. For single: still use array internally
  const getInitialSelected = (): string[] => {
    if (!done) return [];
    if (mode === "quiz" && submittedResponse) {
      // Handle both old format (selectedOptionId) and new (selectedOptionIds)
      if (Array.isArray(submittedResponse.selectedOptionIds)) {
        return submittedResponse.selectedOptionIds;
      }
      if (submittedResponse.selectedOptionId) {
        return [submittedResponse.selectedOptionId];
      }
    }
    return [];
  };

  const [selected, setSelected] = useState<string[]>(getInitialSelected());
  const [feedback, setFeedback] = useState<{
    correct?: boolean;
    message: string;
  } | null>(done ? getFeedbackForDone(mode) : null);

  const toggleOption = (optionId: string) => {
    if (done || (mode === "quiz" && !!feedback)) return;

    setFeedback(null);

    if (isMultiSelect) {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelected([optionId]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || done) return;
    try {
      const answer = isMultiSelect
        ? { selectedOptionIds: selected }
        : { selectedOptionId: selected[0] };

      const result = await onSubmit(question.id, answer);
      if (mode === "course") {
        setFeedback({
          correct: result.correct,
          message: result.message,
        });
        if (!result.correct) {
          setSelected([]);
        }
      } else {
        setFeedback({ message: result.message });
      }
    } catch {
      setFeedback({ correct: false, message: "Failed to submit. Try again." });
    }
  };

  return (
    <div>
      {/* Multi-select hint */}
      {isMultiSelect && !done && (
        <p className="mb-2 text-xs text-gray-500">
          Select {correctCount} options
        </p>
      )}

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);

          return (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              disabled={done || (mode === "quiz" && !!feedback)}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                isSelected
                  ? done
                    ? mode === "course"
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-violet-300 bg-violet-50"
                    : "border-emerald-300 bg-emerald-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              } ${done || (mode === "quiz" && !!feedback) ? "cursor-default" : "cursor-pointer"}`}
            >
              {isMultiSelect ? (
                // Checkbox style
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                    isSelected
                      ? done
                        ? mode === "course"
                          ? "border-emerald-600 bg-emerald-600"
                          : "border-violet-600 bg-violet-600"
                        : "border-emerald-600 bg-emerald-600"
                      : "border-gray-400"
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  )}
                </div>
              ) : // Radio style
              isSelected ? (
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${
                    done
                      ? mode === "course"
                        ? "text-emerald-600"
                        : "text-violet-600"
                      : "text-emerald-600"
                  }`}
                />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-gray-400" />
              )}
              <span
                className={
                  isSelected ? "font-medium text-gray-900" : "text-gray-700"
                }
              >
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>

      <SubmitArea
        done={done}
        feedback={feedback}
        mode={mode}
        canSubmit={selected.length > 0 && !feedback}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ─── True/False ──────────────────────────────────────────────────

function TrueFalseInteractive({
  question,
  mode,
  done,
  onSubmit,
  isSubmitting,
}: {
  question: QuestionItem;
  mode: Mode;
  done: boolean;
  onSubmit: (questionId: string, answer: any) => Promise<any>;
  isSubmitting: boolean;
}) {
  const submittedResponse = getSubmittedResponse(question, mode);

  // For course done: correct answer was submitted (we auto-accept only correct)
  // We don't know which is correct from stripped data, but since it was correct,
  // we just show the UI as done. For quiz: show submitted value.

  const [selected, setSelected] = useState<boolean | null>(
    done && mode === "quiz" ? (submittedResponse?.answer ?? null) : null,
  );
  const [feedback, setFeedback] = useState<{
    correct?: boolean;
    message: string;
  } | null>(done ? getFeedbackForDone(mode) : null);

  const handleSubmit = async () => {
    if (selected === null || done) return;
    try {
      const result = await onSubmit(question.id, { answer: selected });
      if (mode === "course") {
        setFeedback({ correct: result.correct, message: result.message });
        if (!result.correct) {
          setSelected(null);
        }
      } else {
        setFeedback({ message: result.message });
      }
    } catch {
      setFeedback({ correct: false, message: "Failed to submit. Try again." });
    }
  };

  const options = [
    { value: true, label: "True", Icon: CheckCircle },
    { value: false, label: "False", Icon: XCircle },
  ];

  return (
    <div>
      <div className="flex gap-3">
        {options.map(({ value, label, Icon }) => {
          const isSelected = selected === value;
          return (
            <button
              key={label}
              onClick={() => {
                if (!done && !(mode === "quiz" && feedback)) {
                  setSelected(value);
                  setFeedback(null);
                }
              }}
              disabled={done || (mode === "quiz" && !!feedback)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                isSelected
                  ? done
                    ? mode === "course"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-violet-300 bg-violet-50 text-violet-700"
                    : value
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-red-300 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              } ${done || (mode === "quiz" && !!feedback) ? "cursor-default" : "cursor-pointer"}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <SubmitArea
        done={done}
        feedback={feedback}
        mode={mode}
        canSubmit={selected !== null && !feedback}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ─── Fill Ups ────────────────────────────────────────────────────

function FillUpsInteractive({
  question,
  mode,
  done,
  onSubmit,
  isSubmitting,
}: {
  question: QuestionItem;
  mode: Mode;
  done: boolean;
  onSubmit: (questionId: string, answer: any) => Promise<any>;
  isSubmitting: boolean;
}) {
  const blanksCount = question.data?.blanks?.length ?? 0;
  const submittedResponse = getSubmittedResponse(question, mode);
  const template: string = question.data?.template ?? "";

  // Split by the blank markers — *___* for stripped, *word* for original
  const parts = template.split(/\*[^*]*\*/g);

  const getInitialBlanks = (): string[] => {
    if (done && mode === "quiz" && submittedResponse?.blanks) {
      return submittedResponse.blanks.map(
        (b: { index: number; answer: string }) => b.answer ?? "",
      );
    }
    return Array(blanksCount).fill("");
  };

  const [blanks, setBlanks] = useState<string[]>(getInitialBlanks());
  const [feedback, setFeedback] = useState<{
    correct?: boolean;
    message: string;
  } | null>(done ? getFeedbackForDone(mode) : null);

  const updateBlank = (index: number, value: string) => {
    if (done || (mode === "quiz" && !!feedback)) return;
    setBlanks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    setFeedback(null);
  };

  const allFilled = blanks.every((b) => b.trim().length > 0);

  const handleSubmit = async () => {
    if (!allFilled || done) return;
    try {
      const answer = {
        blanks: blanks.map((b, i) => ({ index: i, answer: b })),
      };
      const result = await onSubmit(question.id, answer);
      if (mode === "course") {
        setFeedback({ correct: result.correct, message: result.message });
      } else {
        setFeedback({ message: result.message });
      }
    } catch {
      setFeedback({ correct: false, message: "Failed to submit. Try again." });
    }
  };

  // Pre-compute which blank index corresponds to each gap
  // parts has N+1 elements for N blanks, gaps are between parts
  return (
    <div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-loose">
        {parts.map((part, partIndex) => (
          <span key={`part-${partIndex}`}>
            {part}
            {partIndex < parts.length - 1 && (
              <InlineBlankInput
                value={blanks[partIndex] ?? ""}
                onChange={(val) => updateBlank(partIndex, val)}
                disabled={done || (mode === "quiz" && !!feedback)}
                done={done}
                mode={mode}
              />
            )}
          </span>
        ))}
      </div>

      <SubmitArea
        done={done}
        feedback={feedback}
        mode={mode}
        canSubmit={allFilled && !feedback}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function InlineBlankInput({
  value,
  onChange,
  disabled,
  done,
  mode,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  done: boolean;
  mode: Mode;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="___"
      className={`mx-1 inline-block w-28 rounded-md border-b-2 bg-white px-2 py-0.5 text-center text-sm font-medium outline-none transition-all ${
        disabled
          ? done
            ? mode === "course"
              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : "border-violet-400 bg-violet-50 text-violet-700"
            : "border-gray-300 bg-gray-100 text-gray-600"
          : "border-gray-300 focus:border-emerald-500"
      }`}
    />
  );
}

// ─── Long Answer ─────────────────────────────────────────────────

function LongAnswerInteractive({
  question,
  mode,
  done,
  onSubmit,
  isSubmitting,
}: {
  question: QuestionItem;
  mode: Mode;
  done: boolean;
  onSubmit: (questionId: string, answer: any) => Promise<any>;
  isSubmitting: boolean;
}) {
  const submittedResponse = getSubmittedResponse(question, mode);

  const [text, setText] = useState<string>(
    done && mode === "quiz" ? (submittedResponse?.answer ?? "") : "",
  );
  const [feedback, setFeedback] = useState<{
    correct?: boolean;
    message: string;
  } | null>(done ? getFeedbackForDone(mode) : null);

  const handleSubmit = async () => {
    if (!text.trim() || done) return;
    try {
      const result = await onSubmit(question.id, { answer: text });
      if (mode === "course") {
        setFeedback({ correct: result.correct, message: result.message });
      } else {
        setFeedback({ message: result.message });
      }
    } catch {
      setFeedback({ correct: false, message: "Failed to submit. Try again." });
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => {
          if (!done && !(mode === "quiz" && !!feedback)) {
            setText(e.target.value);
            setFeedback(null);
          }
        }}
        disabled={done || (mode === "quiz" && !!feedback)}
        placeholder="Type your answer here..."
        rows={5}
        className={`w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition-all ${
          done || (mode === "quiz" && !!feedback)
            ? mode === "course"
              ? "border-emerald-200 bg-emerald-50/50 text-gray-700"
              : "border-violet-200 bg-violet-50/50 text-gray-700"
            : "border-gray-300 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        }`}
      />

      <SubmitArea
        done={done}
        feedback={feedback}
        mode={mode}
        canSubmit={!!text.trim() && !feedback}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ─── Content Block (read-only) ───────────────────────────────────

function ContentBlockView({ question }: { question: QuestionItem }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
      <div className="p-6">
        <div
          className="tiptap prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{
            __html: question.data?.content ?? "",
          }}
        />
      </div>
    </div>
  );
}

// ─── Submit Area (button + feedback message) ─────────────────────

function SubmitArea({
  done,
  feedback,
  mode,
  canSubmit,
  isSubmitting,
  onSubmit,
}: {
  done: boolean;
  feedback: { correct?: boolean; message: string } | null;
  mode: Mode;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-4">
      {/* Submit button — only show when not done and no locked feedback */}
      {!done && !(mode === "quiz" && feedback) && (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          size="sm"
          className={`gap-2 ${
            mode === "course"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-violet-600 hover:bg-violet-700"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      )}

      {/* Course retry button for incorrect */}
      {!done && mode === "course" && feedback && feedback.correct === false && (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          size="sm"
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Try Again"
          )}
        </Button>
      )}

      {/* Feedback message */}
      {feedback && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
            feedback.correct === true
              ? "bg-emerald-50 text-emerald-700"
              : feedback.correct === false
                ? "bg-red-50 text-red-700"
                : mode === "quiz"
                  ? "bg-violet-50 text-violet-700"
                  : "bg-gray-50 text-gray-600"
          }`}
        >
          <div className="flex items-start gap-2">
            {feedback.correct === true ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : feedback.correct === false ? (
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            <span className="whitespace-pre-line">{feedback.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper: default feedback for already-done questions ─────────

function getFeedbackForDone(mode: Mode): {
  correct?: boolean;
  message: string;
} {
  if (mode === "course") {
    return { correct: true, message: "Correct answer" };
  }
  return { message: "Response submitted" };
}
