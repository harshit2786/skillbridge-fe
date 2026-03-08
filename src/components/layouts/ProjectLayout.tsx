// src/components/layouts/ProjectLayout.tsx

import { type ReactNode } from "react";
import { navigate } from "raviger";
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Library,
  Video,
  Settings,
  LogOut,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Courses", path: "/courses", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Quizzes", path: "/quizzes", icon: <HelpCircle className="h-4 w-4" /> },
  { label: "Knowledge Base", path: "/knowledge-base", icon: <Library className="h-4 w-4" /> },
  { label: "Webinars", path: "/webinars", icon: <Video className="h-4 w-4" /> },
  { label: "Settings", path: "/settings", icon: <Settings className="h-4 w-4" />, adminOnly: true },
];

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const { project, isAdmin, currentTrainer } = useProject();
  const { logout } = useAuth();

  // Get current path to highlight active nav item
  const currentPath = window.location.pathname;
  const basePath = `/projects/${project.id}`;

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ===== Sidebar ===== */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* Sidebar Header */}
        <div className="border-b border-gray-200 p-4">
          <button
            onClick={() => navigate("/")}
            className="mb-3 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-3 w-3" />
            All Projects
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700">
              <span className="text-sm font-bold text-white">
                {project.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-gray-900">
                {project.name}
              </h2>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const fullPath = item.path === "/" 
                ? basePath 
                : `${basePath}${item.path}`;
              const isActive =
                item.path === "/"
                  ? currentPath === basePath || currentPath === `${basePath}/`
                  : currentPath.startsWith(fullPath);

              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(fullPath)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span
                      className={
                        isActive ? "text-emerald-600" : "text-gray-400"
                      }
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
              {currentTrainer?.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-900">
                {currentTrainer?.name}
              </p>
              <p className="truncate text-[10px] text-gray-500">
                {currentTrainer?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}