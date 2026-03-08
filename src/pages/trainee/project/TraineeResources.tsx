// src/pages/trainee/project/TraineeResources.tsx

import { useProject } from "@/hooks/useProject";
import { FolderOpen } from "lucide-react";

export default function TraineeResources() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <FolderOpen className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500">
            Learning materials for {project.name}
          </p>
        </div>
      </div>
    </div>
  );
}