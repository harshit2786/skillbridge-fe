// src/pages/trainee/project/TraineeWebinars.tsx

import { useProject } from "@/hooks/useProject";
import { Video } from "lucide-react";

export default function TraineeWebinars() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
          <Video className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webinars</h1>
          <p className="text-sm text-gray-500">
            Live sessions for {project.name}
          </p>
        </div>
      </div>
    </div>
  );
}