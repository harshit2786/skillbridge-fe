/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/quiz-components/QuizCreator.tsx
import api from "@/api/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, ScrollText, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/quiz-components/EmptyState";
import { QuestionTypeSelector } from "@/components/quiz-components/QuestionTypeSelector";
import { QuestionForm } from "@/components/quiz-components/QuestionForm";
import { QuestionList } from "@/components/quiz-components/QuestionList";
import {
  useQuestions,
  useCreateQuestion,
  // useUpdateQuestion,
  useDeleteQuestion,
  useReorderQuestions,
} from "@/controllers/questions";
import type { Question, QuestionType } from "@/types/quiz";
import type { ContentType } from "@/models/types";

interface QuizCreatorProps {
  projectId: string;
  contentType: ContentType;
  contentId: string;
  sectionId: string;
  sectionTitle: string;
  isCreator: boolean;
  hidePoints?: boolean; // For courses
}

export function QuizCreator({
  projectId,
  contentType,
  contentId,
  sectionId,
  sectionTitle,
  isCreator,
  hidePoints = false,
}: QuizCreatorProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuestions(
    projectId,
    contentType,
    contentId,
    sectionId,
  );
  const createQuestion = useCreateQuestion(
    projectId,
    contentType,
    contentId,
    sectionId,
  );
  const deleteQuestion = useDeleteQuestion(
    projectId,
    contentType,
    contentId,
    sectionId,
  );
  const reorderQuestions = useReorderQuestions(
    projectId,
    contentType,
    contentId,
    sectionId,
  );
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [error, setError] = useState("");

  const questions = data?.questions ?? [];
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  /* ─── Handlers ─────────────────────────── */

  const handleSelectType = (type: QuestionType) => {
    setTypeSelectorOpen(false);
    setSelectedType(type);
    setEditingQuestion(null);
    setTimeout(() => setFormOpen(true), 200);
  };

  const handleFormSubmit = (question: Question) => {
    setError("");

    if (editingQuestion) {
      const payload = {
        type: question.type,
        question: question.question,
        points: question.points,
        data: question.data,
      };

      api
        .patch(
          `/projects/${projectId}/${contentType}/${contentId}/sections/${sectionId}/questions/${editingQuestion.id}`,
          payload,
        )
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [
              "projects",
              projectId,
              contentType,
              contentId,
              "sections",
              sectionId,
              "questions",
            ],
          });
          setFormOpen(false);
          setSelectedType(null);
          setEditingQuestion(null);
        })
        .catch((err: any) => {
          setError(err.response?.data?.message || "Failed to update question");
        });

      return;
    }

    createQuestion.mutate(
      {
        type: question.type,
        question: question.question,
        points: question.points,
        data: question.data as Record<string, any>,
      },
      {
        onSuccess: () => {
          setFormOpen(false);
          setSelectedType(null);
          setEditingQuestion(null);
        },
        onError: (err) => {
          setError(err.response?.data?.message || "Failed to create question");
        },
      },
    );
  };

  const handleFormClose = (open: boolean) => {
    if (!open) {
      setFormOpen(false);
      setSelectedType(null);
      setEditingQuestion(null);
      setError("");
    }
  };

  const handleReorder = (reordered: Question[]) => {
    reorderQuestions.mutate({
      order: reordered.map((q, i) => ({ questionId: q.id, order: i })),
    });
  };

  const handleEdit = (id: string) => {
    const question = questions.find((q) => q.id === id);
    if (!question) return;

    setEditingQuestion(question);
    setSelectedType(question.type);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteQuestion.mutate(id);
  };

  /* ─── Render ───────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2.5">
            <ScrollText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {sectionTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              {questions.length === 0
                ? "Create and manage your quiz questions"
                : `${questions.length} question${questions.length !== 1 ? "s" : ""} · ${totalPoints} total pts`}
            </p>
          </div>
        </div>

        {isCreator && (
          <Button onClick={() => setTypeSelectorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-border" />

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Stats bar */}
      {questions.length > 0 && (
        <div className="mb-6 flex items-center gap-6 rounded-lg border bg-muted/40 px-5 py-3 text-sm">
          {!hidePoints && (
            <>
              <div className="flex items-center gap-2 font-medium">
                <Trophy className="h-4 w-4 text-amber-500" />
                Total Points:&nbsp;
                <span className="text-foreground">{totalPoints}</span>
              </div>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          <span className="text-muted-foreground">
            {isCreator
              ? "Drag cards to reorder questions"
              : `${questions.length} questions in this section`}
          </span>
          {reorderQuestions.isPending && (
            <>
              <div className="h-4 w-px bg-border" />
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving order...
              </span>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {questions.length === 0 ? (
        <EmptyState onAddQuestion={() => setTypeSelectorOpen(true)} />
      ) : (
        <QuestionList
          questions={sortedQuestions}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ── Dialogs ──────────────────────── */}
      {isCreator && (
        <>
          <QuestionTypeSelector
            open={typeSelectorOpen}
            onOpenChange={setTypeSelectorOpen}
            onSelect={handleSelectType}
          />

          {selectedType && (
            <QuestionForm
              key={editingQuestion?.id ?? selectedType}
              open={formOpen}
              onOpenChange={handleFormClose}
              type={selectedType}
              onSubmit={handleFormSubmit}
              editingQuestion={editingQuestion}
              nextOrder={questions.length}
              hidePoints={hidePoints}
            />
          )}
        </>
      )}
    </div>
  );
}
