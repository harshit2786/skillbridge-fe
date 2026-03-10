// src/pages/trainer/project/ProjectKnowledgeBase.tsx

import { useState, useRef, useCallback } from "react";
import {
  useResources,
  useUploadResource,
  useDeleteResource,
} from "../../../controllers/resources";
import { Button } from "../../../components/ui/button";
import {
  FileText,
  Upload,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  X,
  AlertTriangle,
  ExternalLink,
  CloudUpload,
  File,
} from "lucide-react";
import type { Resource, ResourceStatus } from "../../../models/types";
import { useProject } from "@/hooks/useProject";

export default function ProjectKnowledgeBase() {
  const { project, isAdmin } = useProject();
  const { data, isLoading, isError } = useResources(project.id);
  const uploadMutation = useUploadResource(project.id);
  const deleteMutation = useDeleteResource(project.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | "ALL">("ALL");
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resources = data?.resources ?? [];

  // Filter resources
  const filtered = resources.filter((r) => {
    const matchesSearch = r.filename
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalCount = resources.length;
  const processedCount = resources.filter((r) => r.status === "PROCESSED").length;
  const processingCount = resources.filter((r) => r.status === "PROCESSING").length;
  const failedCount = resources.filter((r) => r.status === "FAILED").length;

  // File upload handler
  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        if (file.type === "application/pdf") {
          uploadMutation.mutate(file);
        }
      });
    },
    [uploadMutation]
  );

  // Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload]
  );

  // Delete handler
  const handleDelete = (resourceId: string) => {
    deleteMutation.mutate(resourceId, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload and manage PDF resources for {project.name}
        </p>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          label="Total"
          count={totalCount}
          icon={<FileText className="h-4 w-4" />}
          color="gray"
        />
        <StatCard
          label="Processed"
          count={processedCount}
          icon={<CheckCircle2 className="h-4 w-4" />}
          color="green"
        />
        <StatCard
          label="Processing"
          count={processingCount}
          icon={<Clock className="h-4 w-4" />}
          color="yellow"
        />
        <StatCard
          label="Failed"
          count={failedCount}
          icon={<XCircle className="h-4 w-4" />}
          color="red"
        />
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-6 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-emerald-400 bg-emerald-50"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        <div className="flex flex-col items-center">
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-sm font-medium text-gray-900">Uploading...</p>
              <p className="mt-1 text-xs text-gray-500">
                Please wait while your file is being uploaded
              </p>
            </>
          ) : (
            <>
              <div
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                  isDragging ? "bg-emerald-100" : "bg-gray-100"
                }`}
              >
                <CloudUpload
                  className={`h-6 w-6 ${
                    isDragging ? "text-emerald-600" : "text-gray-400"
                  }`}
                />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {isDragging
                  ? "Drop your PDF here"
                  : "Drag & drop PDFs here, or click to browse"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PDF files only, up to 50MB each
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                Browse Files
              </Button>
            </>
          )}
        </div>

        {/* Upload error */}
        {uploadMutation.isError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
            {uploadMutation.error?.response?.data?.message || "Upload failed"}
          </div>
        )}

        {/* Upload success */}
        {uploadMutation.isSuccess && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700">
            File uploaded! It's now being processed.
          </div>
        )}
      </div>

      {/* Search + Filter Bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          {(["ALL", "PROCESSED", "PROCESSING", "FAILED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
          Failed to load resources. Please refresh and try again.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {resources.length === 0 ? "No resources yet" : "No matching files"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {resources.length === 0
              ? "Upload your first PDF to build the knowledge base"
              : "Try adjusting your search or filter"}
          </p>
        </div>
      )}

      {/* Resource List */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((resource) => (
            <ResourceRow
              key={resource.id}
              resource={resource}
              isAdmin={isAdmin}
              isDeleting={
                deleteMutation.isPending &&
                deleteConfirm === resource.id
              }
              showDeleteConfirm={deleteConfirm === resource.id}
              onDeleteClick={() => setDeleteConfirm(resource.id)}
              onDeleteCancel={() => setDeleteConfirm(null)}
              onDeleteConfirm={() => handleDelete(resource.id)}
              formatSize={formatSize}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Stat Card ---

function StatCard({
  label,
  count,
  icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: "gray" | "green" | "yellow" | "red";
}) {
  const styles = {
    gray: "bg-white border-gray-200 text-gray-600",
    green: "bg-emerald-50 border-emerald-200 text-emerald-700",
    yellow: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  const iconStyles = {
    gray: "text-gray-400",
    green: "text-emerald-500",
    yellow: "text-amber-500",
    red: "text-red-500",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[color]}`}>
      <div className="flex items-center justify-between">
        <span className={iconStyles[color]}>{icon}</span>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <p className="mt-1 text-xs font-medium opacity-70">{label}</p>
    </div>
  );
}

// --- Status Badge ---

function StatusBadge({ status }: { status: ResourceStatus }) {
  switch (status) {
    case "PROCESSED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Processed
        </span>
      );
    case "PROCESSING":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700">
          <XCircle className="h-3 w-3" />
          Failed
        </span>
      );
  }
}

// --- Resource Row ---

function ResourceRow({
  resource,
  isAdmin,
  isDeleting,
  showDeleteConfirm,
  onDeleteClick,
  onDeleteCancel,
  onDeleteConfirm,
  formatSize,
  formatDate,
}: {
  resource: Resource;
  isAdmin: boolean;
  isDeleting: boolean;
  showDeleteConfirm: boolean;
  onDeleteClick: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
  formatSize: (bytes: number) => string;
  formatDate: (dateStr: string) => string;
}) {
  return (
    <div
      className={`group rounded-xl border bg-white p-4 transition-all hover:shadow-sm ${
        resource.status === "FAILED"
          ? "border-red-100 bg-red-50/30"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* File Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
            resource.status === "FAILED"
              ? "bg-red-100"
              : resource.status === "PROCESSING"
                ? "bg-amber-100"
                : "bg-emerald-50"
          }`}
        >
          <File
            className={`h-5 w-5 ${
              resource.status === "FAILED"
                ? "text-red-500"
                : resource.status === "PROCESSING"
                  ? "text-amber-500"
                  : "text-emerald-600"
            }`}
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-medium text-gray-900">
              {resource.filename}
            </h4>
            <StatusBadge status={resource.status} />
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-400">
            <span>{formatSize(resource.size)}</span>
            <span>•</span>
            <span>Uploaded by {resource.uploader.name}</span>
            <span>•</span>
            <span>{formatDate(resource.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {resource.status === "PROCESSED" && resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="Open PDF"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {resource.status === "FAILED" && (
            <div className="rounded-lg p-2 text-red-400" title="Processing failed">
              <AlertTriangle className="h-4 w-4" />
            </div>
          )}

          {isAdmin && !showDeleteConfirm && (
            <button
              onClick={onDeleteClick}
              className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          {/* Delete Confirmation */}
          {isAdmin && showDeleteConfirm && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Delete?</span>
              <button
                onClick={onDeleteConfirm}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Yes"
                )}
              </button>
              <button
                onClick={onDeleteCancel}
                disabled={isDeleting}
                className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}