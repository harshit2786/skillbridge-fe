// src/pages/trainer/project/ProjectDashboard.tsx

import { navigate } from "raviger";
import { useProjectContents } from "../../../controllers/contents";
import { useQuizzes } from "../../../controllers/quizzes";
import { useCourses } from "../../../controllers/courses";
import { useResources } from "../../../controllers/resources";
import { Button } from "../../../components/ui/button";
import {
  ArrowRight,
  BookOpen,
  FileQuestion,
  FileText,
  Video,
  Route,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useProject } from "@/hooks/useProject";

const dummyWebinars = [
  {
    id: "1",
    title: "Weekly Standup",
    date: "Jan 20, 2025",
    time: "10:00 AM",
  },
  {
    id: "2",
    title: "Project Review",
    date: "Jan 22, 2025",
    time: "2:00 PM",
  },
];

export default function ProjectDashboard() {
  const { project, currentTrainer, isAdmin } = useProject();
  const { data: contentsData } = useProjectContents(project.id);
  const { data: quizzesData, isLoading: loadingQuizzes } = useQuizzes(project.id);
  const { data: coursesData, isLoading: loadingCourses } = useCourses(project.id);
  const { data: resourcesData, isLoading: loadingResources } = useResources(project.id);

  const basePath = `/projects/${project.id}`;
  const firstName = currentTrainer?.name?.split(" ")[0] ?? "there";
  const contents = contentsData?.contents ?? [];
  const quizzes = quizzesData?.quizzes ?? [];
  const courses = coursesData?.courses ?? [];
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
          Here's an overview of {project.name}
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* ===== 1. Learning Path — Full Width ===== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 p-8 text-white lg:col-span-2">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute left-1/2 top-0 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Route className="h-5 w-5 text-emerald-200" />
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-200">
                  Learning Path
                </span>
              </div>
              <h2 className="text-2xl font-bold">
                Define the Learning Journey
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-emerald-100">
                Arrange courses and quizzes in the order trainees should complete
                them. {contents.length > 0
                  ? `Currently ${contents.length} items in the path.`
                  : "No items added yet."}
              </p>
              <Button
                onClick={() => navigate(`${basePath}/learning-path`)}
                className="mt-5 gap-2 bg-white text-emerald-700 hover:bg-emerald-50"
              >
                <Route className="h-4 w-4" />
                {isAdmin ? "Manage Learning Path" : "View Learning Path"}
              </Button>
            </div>

            {/* Mini preview of path */}
            <div className="hidden lg:block">
              <div className="flex flex-col items-center gap-2">
                {contents.slice(0, 4).map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        item.type === "COURSE"
                          ? "bg-blue-400/20 text-blue-100"
                          : "bg-amber-400/20 text-amber-100"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="w-36 truncate text-xs text-emerald-100">
                      {item.quiz?.name || item.course?.name}
                    </span>
                  </div>
                ))}
                {contents.length > 4 && (
                  <span className="text-xs text-emerald-200">
                    +{contents.length - 4} more
                  </span>
                )}
                {contents.length === 0 && (
                  <div className="rounded-lg border border-dashed border-emerald-400/40 px-6 py-4 text-center text-xs text-emerald-200">
                    No items yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 2. Courses ===== */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Courses</h3>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                {courses.length}
              </span>
            </div>
            <button
              onClick={() => navigate(`${basePath}/courses`)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {loadingCourses && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          )}

          {!loadingCourses && courses.length === 0 && (
            <div className="flex flex-col items-center py-6 text-center">
              <BookOpen className="mb-2 h-6 w-6 text-gray-300" />
              <p className="text-xs text-gray-400">No courses yet</p>
            </div>
          )}

          {!loadingCourses && courses.length > 0 && (
            <div className="space-y-2">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`${basePath}/courses/${course.id}`)}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 group-hover:text-emerald-700">
                      {course.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {course.published ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <XCircle className="h-2.5 w-2.5" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-emerald-500" />
                </div>
              ))}
              {courses.length > 3 && (
                <button
                  onClick={() => navigate(`${basePath}/courses`)}
                  className="w-full rounded-lg py-2 text-center text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  +{courses.length - 3} more courses
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===== 3. Quizzes ===== */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <FileQuestion className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Quizzes</h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {quizzes.length}
              </span>
            </div>
            <button
              onClick={() => navigate(`${basePath}/quizzes`)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {loadingQuizzes && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          )}

          {!loadingQuizzes && quizzes.length === 0 && (
            <div className="flex flex-col items-center py-6 text-center">
              <FileQuestion className="mb-2 h-6 w-6 text-gray-300" />
              <p className="text-xs text-gray-400">No quizzes yet</p>
            </div>
          )}

          {!loadingQuizzes && quizzes.length > 0 && (
            <div className="space-y-2">
              {quizzes.slice(0, 3).map((quiz) => (
                <div
                  key={quiz.id}
                  onClick={() => navigate(`${basePath}/quizzes/${quiz.id}`)}
                  className="group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                    <FileQuestion className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 group-hover:text-emerald-700">
                      {quiz.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {quiz.published ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <XCircle className="h-2.5 w-2.5" />
                          Draft
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        · {quiz.passingPercent}% pass
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-emerald-500" />
                </div>
              ))}
              {quizzes.length > 3 && (
                <button
                  onClick={() => navigate(`${basePath}/quizzes`)}
                  className="w-full rounded-lg py-2 text-center text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  +{quizzes.length - 3} more quizzes
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===== 4. Resources ===== */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                {resources.length}
              </span>
            </div>
            <button
              onClick={() => navigate(`${basePath}/knowledge-base`)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {loadingResources && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          )}

          {!loadingResources && resources.length === 0 && (
            <div className="flex flex-col items-center py-6 text-center">
              <FileText className="mb-2 h-6 w-6 text-gray-300" />
              <p className="text-xs text-gray-400">No resources yet</p>
            </div>
          )}

          {!loadingResources && resources.length > 0 && (
            <div className="space-y-2">
              {resources.slice(0, 3).map((resource) => (
                <div
                  key={resource.id}
                  className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                    <FileText className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {resource.filename.replace(/\.pdf$/i, "")}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {resource.uploader.name}
                    </p>
                  </div>
                </div>
              ))}
              {resources.length > 3 && (
                <button
                  onClick={() => navigate(`${basePath}/knowledge-base`)}
                  className="w-full rounded-lg py-2 text-center text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                >
                  +{resources.length - 3} more resources
                </button>
              )}
            </div>
          )}
        </div>

        {/* ===== 5. Webinars (Dummy) ===== */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                <Video className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Webinars</h3>
            </div>
            <button
              onClick={() => navigate(`${basePath}/webinars`)}
              className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {dummyWebinars.map((webinar) => (
              <div
                key={webinar.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="text-sm font-medium text-gray-900">
                  {webinar.title}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {webinar.date}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-500">
                    <Clock className="h-3 w-3" />
                    {webinar.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}