// src/pages/trainee/project/TraineeFeedback.tsx

import { useProject } from "@/hooks/useProject";
import { MessageSquare } from "lucide-react";

export default function TraineeFeedback() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <MessageSquare className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
          <p className="text-sm text-gray-500">
            Share your feedback for {project.name}
          </p>
        </div>
      </div>
    </div>
  );
}