"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "@/server/projects";

export type CreateProjectState = {
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
