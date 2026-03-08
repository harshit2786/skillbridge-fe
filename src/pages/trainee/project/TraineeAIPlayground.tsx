// src/pages/trainee/project/TraineeAIPlayground.tsx

import { useProject } from "@/hooks/useProject";
import { Sparkles } from "lucide-react";

export default function TraineeAIPlayground() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Playground</h1>
          <p className="text-sm text-gray-500">
            Interact with AI tools for {project.name}
          </p>
        </div>
      </div>
    </div>
  );
}