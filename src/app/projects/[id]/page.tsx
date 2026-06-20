import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProject } from "@/server/projects";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const project = await getProject(user.id, id);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
        Proyecto
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {project.name}
      </h1>
      <p className="mt-3 text-slate-600">
        Este proyecto esta vacio. Las vistas de trabajo se implementan en las
        siguientes tareas.
      </p>
    </main>
  );
}
