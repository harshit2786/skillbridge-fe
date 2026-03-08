// src/pages/trainee/TraineeDashboard.tsx

import { useTraineeMe } from "../../controllers/traineeAuth";
import { FolderOpen, BookOpen, LogOut, Loader2 } from "lucide-react";
import type { Project } from "../../models/types";
import { useAuth } from "@/hooks/useAuth";
import { navigate } from "raviger";

export default function TraineeDashboard() {
  const { user, logout } = useAuth();
  const { data, isLoading, isError } = useTraineeMe(!!user?.token);

  const trainee = data?.trainee ?? user?.trainee;
  const projects = trainee?.projects_trainee ?? [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                SkillBridge
              </h1>
              <p className="text-xs text-gray-500">Trainee Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {trainee?.name ?? "New User"}
              </p>
              <p className="text-xs text-gray-500">{trainee?.phone}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 rounded-2xl bg-linear-to-r from-emerald-700 to-emerald-600 px-8 py-6 text-white">
          <h2 className="text-xl font-bold">
            Welcome back, {trainee?.name?.split(" ")[0] ?? "there"}!
          </h2>
          <p className="mt-1 text-sm text-emerald-100">
            Continue your learning journey
          </p>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">My Projects</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            Projects you are enrolled in
          </p>
        </div>

        {isError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Failed to load projects. Please try again.
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && !isError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <FolderOpen className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No courses yet
            </h3>
            <p className="mt-1 max-w-xs text-center text-sm text-gray-500">
              You haven't been enrolled in any projects yet. Contact your
              trainer to get started.
            </p>
          </div>
        )}

        {/* Project Grid */}
        {projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <TraineeProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- Trainee Project Card ---

function TraineeProjectCard({ project }: { project: Project }) {
  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50"
    >
      {/* Color Bar */}
      <div className="h-2 bg-linear-to-r from-emerald-500 to-emerald-400" />

      <div className="p-5">
        {/* Icon */}
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
          <BookOpen className="h-5 w-5 text-emerald-600" />
        </div>

        {/* Content */}
        <h4 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700">
          {project.name}
        </h4>
        <p className="mt-1 text-xs text-gray-500">Enrolled</p>

        {/* CTA */}
        <div className="mt-4">
          <span className="inline-flex items-center text-xs font-medium text-emerald-600 group-hover:text-emerald-700">
            Continue Learning →
          </span>
        </div>
      </div>
    </div>
  );
}
