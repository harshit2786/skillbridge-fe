// src/pages/trainee/project/TraineeProjectHome.tsx

import { navigate } from "raviger";
import { Button } from "../../../components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Video,
  Calendar,
  FileText,
  Clock,
  Play,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useResources } from "@/controllers/resources";

// Dummy data for resources (backend not implemented yet)
// const dummyResources = [
//   { id: "1", title: "Getting Started Guide", type: "PDF", icon: FileText },
//   { id: "2", title: "Project Overview", type: "DOC", icon: BookOpen },
//   { id: "3", title: "Best Practices", type: "PDF", icon: FileText },
// ];

// Dummy data for upcoming webinars
const dummyWebinars = [
  {
    id: "1",
    title: "Introduction Session",
    date: "Jan 15, 2025",
    time: "10:00 AM",
    host: "John Doe",
  },
  {
    id: "2",
    title: "Q&A with Trainers",
    date: "Jan 18, 2025",
    time: "2:00 PM",
    host: "Jane Smith",
  },
];
const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function TraineeProjectHome() {
  const { project, currentTrainee } = useProject();
  const basePath = `/projects/${project.id}`;
  const firstName = currentTrainee?.name?.split(" ")[0] ?? "there";
  const { data: resourcesData, isLoading: isLoadingResources } = useResources(
    project.id,
  );
  const resources = resourcesData?.resources ?? [];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 lg:p-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening in your project today
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* ===== Card 1: Project Hero (spans full width) ===== */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-700 via-emerald-600 to-emerald-500 p-8 text-white lg:col-span-2">
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute left-1/2 top-0 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative z-10">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              Current Project
            </span>
            <h2 className="mt-4 text-3xl font-bold">{project.name}</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-emerald-100">
              {project.description ||
                "Welcome to your learning journey. Explore courses, attend webinars, and track your progress all in one place."}
            </p>
            <Button
              onClick={() => navigate(`${basePath}/learn`)}
              className="mt-6 gap-2 bg-white text-emerald-700 hover:bg-emerald-50"
            >
              <Play className="h-4 w-4" />
              Start Learning
            </Button>
          </div>
        </div>

        {/* ===== Card 2: Resources / Guidelines ===== */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <BookOpen className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Project Guidelines
              </h3>
            </div>
            <button
              onClick={() => navigate(`${basePath}/resources`)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {isLoadingResources && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          )}

          {!isLoadingResources && resources.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <FolderOpen className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-xs text-gray-500">
                No resources available yet
              </p>
            </div>
          )}

          {!isLoadingResources && resources.length > 0 && (
            <div className="space-y-2">
              {resources.slice(0, 4).map((resource) => (
                <div
                  key={resource.id}
                  onClick={() =>
                    navigate(`${basePath}/resources?file=${resource.id}`)
                  }
                  className="group flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 group-hover:text-emerald-700">
                      {resource.filename.replace(/\.pdf$/i, "")}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {formatSize(resource.size)} • {resource.uploader.name}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 transition-colors group-hover:text-emerald-500" />
                </div>
              ))}

              {resources.length > 4 && (
                <button
                  onClick={() => navigate(`${basePath}/resources`)}
                  className="w-full rounded-lg py-2 text-center text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  +{resources.length - 4} more resources
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===== Card 3: Upcoming Webinars ===== */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                <Video className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Upcoming Webinars
              </h3>
            </div>
            <button
              onClick={() => navigate(`${basePath}/webinars`)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {dummyWebinars.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Video className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-500">No upcoming webinars</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dummyWebinars.map((webinar) => (
                <div
                  key={webinar.id}
                  className="group cursor-pointer rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-emerald-700">
                        {webinar.title}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-gray-500">
                        Hosted by {webinar.host}
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-3 w-3 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] text-gray-600 shadow-sm">
                      <Calendar className="h-3 w-3" />
                      {webinar.date}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] text-gray-600 shadow-sm">
                      <Clock className="h-3 w-3" />
                      {webinar.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
