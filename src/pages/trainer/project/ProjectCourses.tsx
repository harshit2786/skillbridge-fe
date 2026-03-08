// src/pages/trainer/project/ProjectCourses.tsx

import { useProject } from "@/hooks/useProject";


export default function ProjectCourses() {
  const { project } = useProject();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage courses in {project.name}
      </p>
    </div>
  );
}