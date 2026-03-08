// src/pages/trainer/project/ProjectWebinars.tsx

import { useProject } from "@/hooks/useProject";


export default function ProjectWebinars() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Webinars</h1>
      <p className="mt-1 text-sm text-gray-500">
        Live sessions for {project.name}
      </p>
    </div>
  );
}
