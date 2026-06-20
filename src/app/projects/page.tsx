import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/server/auth";
import { listProjects } from "@/server/projects";
import { importProjectAction } from "./actions";
import { NewProjectDialog } from "./new-project-dialog";
import { ProjectActions } from "./project-actions";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const projects = await listProjects(user.id);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="flex items-center justify-between border-b border-line px-6 py-4 shrink-0">
        <h1 className="text-lg font-semibold text-ink">Proyectos</h1>
        <div className="flex items-center gap-2">
          <form action={importProjectAction} className="flex items-center gap-2">
            <input
              accept="application/json"
              className="max-w-52 text-sm text-ink-soft file:mr-3 file:h-9 file:rounded-btn file:border file:border-line file:bg-card file:px-3 file:text-sm file:font-medium file:text-ink"
              name="file"
              required
              type="file"
            />
            <button
              className="h-9 rounded-btn border border-line bg-card px-3 text-sm font-medium text-ink transition hover:shadow-lift"
              type="submit"
            >
              Importar
            </button>
          </form>
          <NewProjectDialog />
          <form action={signOut}>
            <button
              className="h-9 rounded-btn border border-line bg-card px-3 text-sm font-medium text-ink-soft transition hover:bg-card hover:text-ink"
              type="submit"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {projects.length === 0 ? (
        <section className="px-6 py-16">
          <h2 className="text-xl font-semibold text-ink">No hay proyectos todavía</h2>
          <p className="mt-2 max-w-xl text-ink-soft">
            Crea el primer proyecto para empezar a ordenar notas por embudo, tablero, documento, lienzo y grafo.
          </p>
        </section>
      ) : (
        <ul className="grid gap-3 px-6 py-6">
          {projects.map((project) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-card px-4 py-3 shadow-card hover:shadow-lift transition"
              key={project.id}
            >
              <Link
                className="flex min-w-0 flex-1 items-center gap-3 rounded-btn py-1 transition"
                href={`/projects/${project.id}`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate font-medium text-ink">{project.name}</span>
              </Link>
              <ProjectActions projectId={project.id} projectName={project.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
