import { NOTE_STATUSES, type NoteStatus } from "@/core";

type BoardNote = {
  id: string;
  title: string;
  content: string;
  status: string;
};

type BoardViewProps = {
  notes: BoardNote[];
  projectId: string;
};

const statusLabels: Record<NoteStatus, string> = {
  todo: "Por hacer",
  doing: "En curso",
  done: "Hecho",
  idea: "Idea",
  none: "Sin estado",
};

export function BoardView({ notes, projectId }: BoardViewProps) {
  const notesByStatus = new Map<NoteStatus, BoardNote[]>();

  for (const status of NOTE_STATUSES) {
    notesByStatus.set(status, []);
  }

  for (const note of notes) {
    const statusNotes = notesByStatus.get(note.status as NoteStatus);

    if (statusNotes) {
      statusNotes.push(note);
    }
  }

  return (
    <section className="border-t border-slate-200 py-8">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">Tablero</h2>
        <p className="mt-1 text-sm text-slate-600">
          Las notas agrupadas por estado.
        </p>
      </div>
      <div className="grid gap-3 xl:grid-cols-5">
        {NOTE_STATUSES.map((status) => (
          <section
            className="rounded-lg border border-slate-200 bg-white p-4"
            key={status}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-950">
                {statusLabels[status]}
              </h3>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {notesByStatus.get(status)?.length ?? 0}
              </span>
            </div>
            <ul className="mt-4 grid gap-2">
              {(notesByStatus.get(status) ?? []).map((note) => (
                <li key={note.id}>
                  <a
                    className="block rounded-md border border-slate-200 px-3 py-2 transition hover:border-indigo-200 hover:bg-indigo-50"
                    href={`/projects/${projectId}?note=${note.id}`}
                  >
                    <span className="block text-sm font-medium text-slate-800">
                      {note.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">
                      {note.content || "Sin contenido"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
