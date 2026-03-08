// src/pages/trainer/project/ProjectKnowledgeBase.tsx

import { useProject } from "@/hooks/useProject";


export default function ProjectKnowledgeBase() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
      <p className="mt-1 text-sm text-gray-500">
        Resources for {project.name}
      </p>
    </div>
  );
}