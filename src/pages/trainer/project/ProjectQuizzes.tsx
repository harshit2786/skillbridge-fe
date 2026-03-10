// src/pages/trainer/project/ProjectQuizzes.tsx

import { useState } from "react";
import { navigate } from "raviger";
import { useQuizzes, useCreateQuiz } from "../../../controllers/quizzes";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Plus,
  FileQuestion,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  X,
  Search,
  ChevronRight,
} from "lucide-react";
import type { Quiz, Trainer } from "../../../models/types";
import { useProject } from "@/hooks/useProject";
import { useProjectDetail } from "@/controllers/projects";

export default function ProjectQuizzes() {
  const { project, isAdmin } = useProject();
  const { data, isLoading } = useQuizzes(project.id);
  const { data: projectDetail } = useProjectDetail(project.id);

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const quizzes = data?.quizzes ?? [];
  const trainers = projectDetail?.project?.trainers ?? [];

  const filtered = quizzes.filter((q) =>
    q.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage quizzes for {project.name}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Quiz
          </Button>
        )}
      </div>

      {/* Search */}
      {quizzes.length > 0 && (
        <div className="relative mb-4 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && quizzes.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <FileQuestion className="h-7 w-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No quizzes yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first quiz to get started
          </p>
          {isAdmin && (
            <Button onClick={() => setShowCreate(true)} className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
          )}
        </div>
      )}

      {/* Quiz Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} projectId={project.id} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateQuizModal
          projectId={project.id}
          trainers={trainers}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

// --- Quiz Card ---

function QuizCard({ quiz, projectId }: { quiz: Quiz; projectId: string }) {
  return (
    <div
      onClick={() => navigate(`/projects/${projectId}/quizzes/${quiz.id}`)}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
          <FileQuestion className="h-5 w-5 text-emerald-600" />
        </div>
        {quiz.published ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Published
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            <XCircle className="h-3 w-3" />
            Draft
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
        {quiz.name}
      </h4>
      {quiz.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
          {quiz.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span>Pass: {quiz.passingPercent}%</span>
          {quiz.creators.length > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>
                  {quiz.creators.length} creator
                  {quiz.creators.length > 1 ? "s" : ""}
                </span>
              </div>
            </>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-emerald-500" />
      </div>
    </div>
  );
}

// --- Create Quiz Modal ---

function CreateQuizModal({
  projectId,
  trainers,
  onClose,
}: {
  projectId: string;
  trainers: Trainer[];
  onClose: () => void;
}) {
  const createQuiz = useCreateQuiz(projectId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [passingPercent, setPassingPercent] = useState(60);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [creatorSearch, setCreatorSearch] = useState("");
  const [error, setError] = useState("");

  const filteredTrainers = trainers.filter(
    (t) =>
      !selectedCreators.includes(t.id) &&
      (t.name.toLowerCase().includes(creatorSearch.toLowerCase()) ||
        t.email.toLowerCase().includes(creatorSearch.toLowerCase())),
  );

  const selectedTrainers = trainers.filter((t) =>
    selectedCreators.includes(t.id),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Quiz name is required");
      return;
    }

    createQuiz.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        passingPercent,
        creatorIds: selectedCreators.length > 0 ? selectedCreators : undefined,
      },
      {
        onSuccess: (data) => {
          navigate(`/projects/${projectId}/quizzes/${data.quiz.id}`);
          onClose();
        },
        onError: (err) => {
          setError(err.response?.data?.message || "Failed to create quiz");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Create New Quiz</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-900">
                Quiz Name *
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. JavaScript Fundamentals Quiz"
                className="h-10 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-900">
                Description
              </Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the quiz..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Passing Percent */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-900">
                Passing Percentage
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={passingPercent}
                  onChange={(e) => setPassingPercent(Number(e.target.value))}
                  className="h-10 w-24 text-sm"
                />
                <span className="text-sm text-gray-500">%</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={passingPercent}
                  onChange={(e) => setPassingPercent(Number(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
              </div>
            </div>

            {/* Creators */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-900">
                Quiz Creators
              </Label>
              <p className="text-[11px] text-gray-400">
                Trainers who can edit this quiz (you can add more later)
              </p>

              {/* Selected */}
              {selectedTrainers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {selectedTrainers.map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
                    >
                      {t.name}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCreators((prev) =>
                            prev.filter((id) => id !== t.id),
                          )
                        }
                        className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-200"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trainers..."
                  value={creatorSearch}
                  onChange={(e) => setCreatorSearch(e.target.value)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs outline-none focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {/* Trainer List */}
              {creatorSearch && filteredTrainers.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                  {filteredTrainers.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => {
                        setSelectedCreators((prev) => [...prev, t.id]);
                        setCreatorSearch("");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{t.name}</p>
                        <p className="text-[10px] text-gray-400">{t.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {creatorSearch && filteredTrainers.length === 0 && (
                <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-400">
                  No matching trainers
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createQuiz.isPending}
              className="gap-2"
            >
              {createQuiz.isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              Create Quiz
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
