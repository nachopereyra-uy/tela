import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listNotes } from "@/server/notes";
import { getProject } from "@/server/projects";
import { createNoteAction } from "./actions";
import { BoardView } from "./board-view";
import { FunnelView } from "./funnel-view";
import { NoteInspector, type InspectorNote } from "./note-inspector";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    note?: string;
  }>;
};

function toInspectorNote(note: Awaited<ReturnType<typeof listNotes>>[number]) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    layer: note.layer,
    status: note.status,
    tags: note.tags,
  } satisfies InspectorNote;
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { id } = await params;
  const { note: selectedNoteId } = await searchParams;
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

  const notes = await listNotes(user.id, id);
  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null;

  return (
    <main className="grid min-h-screen grid-cols-[minmax(0,1fr)_420px] bg-slate-50">
      <section className="px-6 py-10">
        <Link className="text-sm font-medium text-indigo-700" href="/projects">
          Proyectos
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
              Proyecto
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {project.name}
            </h1>
          </div>
          <form action={createNoteAction}>
            <input name="projectId" type="hidden" value={project.id} />
            <button
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              type="submit"
            >
              Nueva nota
            </button>
          </form>
        </div>

        {notes.length === 0 ? (
          <section className="py-16">
            <h2 className="text-xl font-semibold text-slate-950">
              No hay notas todavia
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Crea una nota para editar su titulo, contenido, capa, estado y
              etiquetas.
            </p>
          </section>
        ) : (
          <ul className="grid gap-3 py-8">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  className={`block rounded-lg border bg-white px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50 ${
                    selectedNote?.id === note.id
                      ? "border-indigo-300"
                      : "border-slate-200"
                  }`}
                  href={`/projects/${project.id}?note=${note.id}`}
                >
                  <h2 className="font-medium text-slate-950">{note.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {note.content || "Sin contenido"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <FunnelView notes={notes} projectId={project.id} />
        <BoardView notes={notes} projectId={project.id} />
      </section>
      <NoteInspector
        note={selectedNote ? toInspectorNote(selectedNote) : null}
        projectId={project.id}
      />
    </main>
  );
}
