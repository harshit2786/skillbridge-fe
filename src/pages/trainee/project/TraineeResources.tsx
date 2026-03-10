// src/pages/trainee/project/TraineeResources.tsx
// Only the changed parts — add useQueryParams and update auto-select logic

import { useState, useEffect } from "react";
import { useQueryParams } from "raviger";
import { useResources } from "../../../controllers/resources";
import {
  FileText,
  Search,
  X,
  Loader2,
  ChevronLeft,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { Resource } from "../../../models/types";
import { useProject } from "@/hooks/useProject";

export default function TraineeResources() {
  const { project } = useProject();
  const { data, isLoading, isError } = useResources(project.id);
  const [queryParams] = useQueryParams();

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resources = data?.resources ?? [];

  const filtered = resources.filter((r) =>
    r.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select from query param or first resource
  useEffect(() => {
    if (hasAutoSelected || isLoading || resources.length === 0) return;

    const fileId = queryParams?.file;
    if (fileId) {
      const found = resources.find((r) => r.id === fileId);
      if (found) {
        setSelectedResource(found);
        setHasAutoSelected(true);
        return;
      }
    }

    setSelectedResource(resources[0]);
    setHasAutoSelected(true);
  }, [resources, isLoading, queryParams, hasAutoSelected]);

  const displayName = (filename: string) =>
    filename.replace(/\.pdf$/i, "");

  return (
    <div className="flex h-full">
      {/* ===== Left Panel — File List ===== */}
      <div
        className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${
          sidebarCollapsed ? "w-0 overflow-hidden" : "w-80"
        }`}
      >
        <div className="border-b border-gray-100 p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-7 text-xs outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            </div>
          )}

          {isError && (
            <div className="px-4 py-8 text-center text-xs text-red-500">
              Failed to load resources
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <FolderOpen className="mb-2 h-8 w-8 text-gray-300" />
              <p className="text-xs text-gray-500">
                {resources.length === 0
                  ? "No resources available"
                  : "No matching files"}
              </p>
            </div>
          )}

          {!isLoading &&
            filtered.map((resource) => {
              const isSelected = selectedResource?.id === resource.id;

              return (
                <button
                  key={resource.id}
                  onClick={() => setSelectedResource(resource)}
                  className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-l-2 border-l-emerald-600 bg-emerald-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <FileText
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      isSelected ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm leading-snug ${
                      isSelected
                        ? "font-medium text-emerald-900"
                        : "text-gray-700"
                    }`}
                  >
                    {displayName(resource.filename)}
                  </span>
                </button>
              );
            })}
        </div>

        {!isLoading && resources.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-2">
            <p className="text-[10px] text-gray-400">
              {filtered.length} of {resources.length} resources
            </p>
          </div>
        )}
      </div>

      {/* ===== Collapse Toggle ===== */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="flex w-6 items-center justify-center border-r border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-3.5 w-3.5" />
        ) : (
          <PanelLeftClose className="h-3.5 w-3.5" />
        )}
      </button>

      {/* ===== Right Panel — PDF Viewer ===== */}
      <div className="flex flex-1 flex-col bg-gray-100">
        {selectedResource ? (
          <>
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-3">
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="mr-1 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
              <h2 className="truncate text-sm font-semibold text-gray-900">
                {displayName(selectedResource.filename)}
              </h2>
            </div>

            <div className="flex-1 p-4">
              <iframe
                src={`${selectedResource.url}#toolbar=1&navpanes=0`}
                title={selectedResource.filename}
                className="h-full w-full rounded-lg border border-gray-300 bg-white shadow-sm"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700">
              {isLoading
                ? "Loading resources..."
                : resources.length === 0
                  ? "No resources available"
                  : "Select a file to preview"}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-gray-400">
              {resources.length === 0
                ? "Your trainer hasn't uploaded any resources yet"
                : "Choose a PDF from the list on the left"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}