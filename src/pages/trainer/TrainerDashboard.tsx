// src/pages/trainer/TrainerDashboard.tsx

import { useTrainerMe } from "../../controllers/trainerAuth";
import { Button } from "../../components/ui/button";
import {
  Plus,
  FolderOpen,
  Shield,
  BookOpen,
  LogOut,
  Loader2,
} from "lucide-react";
import type { Project } from "../../models/types";
import { useAuth } from "@/hooks/useAuth";
import { navigate } from "raviger";

export default function TrainerDashboard() {
  const { user, logout } = useAuth();
  const { data, isLoading, isError } = useTrainerMe(!!user?.token);

  const trainer = data?.trainer ?? user?.trainer;
  const adminProjects = trainer?.project_admin ?? [];
  const memberProjects = trainer?.projects_trainer ?? [];

  // Deduplicate: remove admin projects from member list
  const adminIds = new Set(adminProjects.map((p) => p.id));
  const onlyMemberProjects = memberProjects.filter((p) => !adminIds.has(p.id));

  const allEmpty =
    adminProjects.length === 0 && onlyMemberProjects.length === 0;

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
              <p className="text-xs text-gray-500">Trainer Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {trainer?.name}
              </p>
              <p className="text-xs text-gray-500">{trainer?.email}</p>
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
        {/* Title Row */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage and access your training projects
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {isError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Failed to load projects. Please try again.
          </div>
        )}

        {/* Empty State */}
        {allEmpty && !isError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <FolderOpen className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No projects yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first project to get started
            </p>
            <Button className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        )}

        {/* Admin Projects */}
        {adminProjects.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Admin
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {adminProjects.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminProjects.map((project) => (
                <AdminProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* Member Projects */}
        {onlyMemberProjects.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Member
              </h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {onlyMemberProjects.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {onlyMemberProjects.map((project) => (
                <MemberProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// --- Admin Project Card ---

function AdminProjectCard({ project }: { project: Project }) {
  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-5 transition-all hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100"
    >
      {/* Admin Badge */}
      <div className="absolute right-3 top-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      </div>

      {/* Icon */}
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100">
        <FolderOpen className="h-5 w-5 text-emerald-700" />
      </div>

      {/* Content */}
      <h4 className="pr-16 text-base font-semibold text-gray-900 group-hover:text-emerald-800">
        {project.name}
      </h4>
      <p className="mt-1 text-xs text-gray-500">
        You have full admin access to this project
      </p>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-linear-to-r from-emerald-500 to-emerald-300" />
    </div>
  );
}

// --- Member Project Card ---

function MemberProjectCard({ project }: { project: Project }) {
  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md"
    >
      {/* Icon */}
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
        <BookOpen className="h-5 w-5 text-gray-500" />
      </div>

      {/* Content */}
      <h4 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700">
        {project.name}
      </h4>
      <p className="mt-1 text-xs text-gray-500">Trainer</p>
    </div>
  );
}
