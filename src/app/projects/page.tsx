import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/server/auth";
import { listProjects } from "@/server/projects";
import { NewProjectDialog } from "./new-project-dialog";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const projects = await listProjects(user.id);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
            Tela
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Proyectos
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <NewProjectDialog />
          <form action={signOut}>
            <button
              className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              type="submit"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </header>

      {projects.length === 0 ? (
        <section className="py-16">
          <h2 className="text-xl font-semibold text-slate-950">
            No hay proyectos todavia
          </h2>
          <p className="mt-2 max-w-xl text-slate-600">
            Crea el primer proyecto para empezar a ordenar notas por embudo,
            tablero, documento, lienzo y grafo.
          </p>
        </section>
      ) : (
        <ul className="grid gap-3 py-8">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50"
                href={`/projects/${project.id}`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="font-medium text-slate-950">
                    {project.name}
                  </span>
                </span>
                <span className="text-sm text-slate-500">Abrir</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
