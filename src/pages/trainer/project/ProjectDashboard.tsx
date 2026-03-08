// src/pages/trainer/project/ProjectDashboard.tsx

import { useProject } from "@/hooks/useProject";


export default function ProjectDashboard() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of {project.name}
      </p>
    </div>
  );
}