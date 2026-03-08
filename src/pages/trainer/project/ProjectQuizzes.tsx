// src/pages/trainer/project/ProjectQuizzes.tsx

import { useProject } from "@/hooks/useProject";


export default function ProjectQuizzes() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage quizzes in {project.name}
      </p>
    </div>
  );
}