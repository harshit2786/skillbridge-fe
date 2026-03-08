// src/pages/trainer/project/ProjectSettings.tsx

import { useProject } from "@/hooks/useProject";


export default function ProjectSettings() {
  const { project, isAdmin } = useProject();

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-1 text-sm text-gray-500">
          Only admins can access settings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure {project.name}
      </p>
    </div>
  );
}