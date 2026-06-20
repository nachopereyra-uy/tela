"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createProject,
  deleteProject,
  renameProject,
} from "@/server/projects";

export type CreateProjectState = {
  error?: string;
};

export type ProjectActionState = {
  error?: string;
};

export async function createProjectAction(
  _state: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name");
  const color = formData.get("color");

  let projectId: string;

  try {
    const project = await createProject(user.id, {
      name: typeof name === "string" ? name : "",
      color: typeof color === "string" ? color : undefined,
    });

    if (!project) {
      return { error: "No pudimos crear el proyecto." };
    }

    projectId = project.id;
  } catch {
    return { error: "Revisa el nombre y el color del proyecto." };
  }

  redirect(`/projects/${projectId}`);
}

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user.id;
}

export async function renameProjectAction(
  _state: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const userId = await getCurrentUserId();
  const projectId = formData.get("projectId");
  const name = formData.get("name");

  if (typeof projectId !== "string" || typeof name !== "string") {
    return { error: "Revisa los datos del proyecto." };
  }

  try {
    const project = await renameProject(userId, projectId, { name });

    if (!project) {
      return { error: "No encontramos ese proyecto." };
    }
  } catch {
    return { error: "No pudimos renombrar el proyecto." };
  }

  redirect("/projects");
}

export async function deleteProjectAction(
  _state: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const userId = await getCurrentUserId();
  const projectId = formData.get("projectId");

  if (typeof projectId !== "string") {
    return { error: "Revisa los datos del proyecto." };
  }

  try {
    const project = await deleteProject(userId, projectId);

    if (!project) {
      return { error: "No encontramos ese proyecto." };
    }
  } catch {
    return { error: "No pudimos eliminar el proyecto." };
  }

  redirect("/projects");
}
