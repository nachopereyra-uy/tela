"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createNoteAction } from "./actions";
import { BoardView } from "./board-view";
import { CanvasView } from "./canvas-view";
import { FunnelView } from "./funnel-view";
import { GraphView } from "./graph-view";
import { NoteInspector, type InspectorNote } from "./note-inspector";

export type ShellNote = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: string;
  layer: string;
  x: number;
  y: number;
  tags: string[];
};

export type ShellEdge = {
  id: string;
  fromNoteId: string;
  toNoteId: string;
  label: string | null;
};

type WikilinkEdge = {
  fromNoteId: string;
  toNoteId: string;
  title: string;
};

type ProjectShellProps = {
  project: { id: string; name: string };
  notes: ShellNote[];
  explicitEdges: ShellEdge[];
  selectedNoteId: string | null;
  inspectorNote: InspectorNote | null;
  outgoingLinks: { title: string; noteId: string | null }[];
  backlinks: { id: string; title: string }[];
  wikilinkEdges: WikilinkEdge[];
};

export function ProjectShell({
  project,
  notes,
  explicitEdges,
  selectedNoteId,
  inspectorNote,
  outgoingLinks,
  backlinks,
  wikilinkEdges,
}: ProjectShellProps) {
  const [search, setSearch] = useState("");
  const [presentMode, setPresentMode] = useState(false);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [notes, search]);

  const wikilinkTargets = notes.map((n) => ({ id: n.id, title: n.title }));

  if (presentMode) {
    return (
      <div className="min-h-screen bg-paper-2">
        <div className="flex items-center justify-between border-b border-line bg-paper-2 px-6 py-3">
          <span className="text-sm font-semibold text-ink">
            {project.name}
          </span>
          <button
            className="h-8 rounded-btn border border-line px-4 text-sm font-medium text-ink-soft transition hover:bg-card hover:text-ink"
            onClick={() => setPresentMode(false)}
            type="button"
          >
            Salir
          </button>
        </div>
        <div className="px-6 py-6">
          <FunnelView
            notes={filteredNotes}
            presentMode
            projectId={project.id}
          />
          <BoardView
            notes={filteredNotes}
            presentMode
            projectId={project.id}
          />
          <CanvasView
            edges={explicitEdges}
            notes={notes}
            presentMode
            projectId={project.id}
          />
          <GraphView
            explicitEdges={explicitEdges}
            notes={notes}
            presentMode
            projectId={project.id}
            wikilinkEdges={wikilinkEdges}
          />
        </div>
      </div>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-[minmax(0,1fr)_400px] bg-paper">
      <section className="flex flex-col">
        {/* Topbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-paper/80 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              className="shrink-0 text-sm text-ink-soft transition hover:text-ink"
              href="/projects"
            >
              ← Proyectos
            </Link>
            <span className="text-ink-faint">/</span>
            <span className="truncate font-semibold text-ink">{project.name}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input
              className="h-9 w-44 rounded-btn border border-line bg-paper px-3 text-sm placeholder:text-ink-faint focus:border-blue focus:bg-card focus:ring-2 focus:ring-blue-soft outline-none transition"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              type="search"
              value={search}
            />
            <button
              className="h-9 rounded-btn border border-line-strong px-3 text-sm font-medium text-ink-soft transition hover:bg-card hover:text-ink"
              onClick={() => setPresentMode(true)}
              type="button"
            >
              Presentar
            </button>
            <a
              className="flex h-9 items-center rounded-btn border border-line-strong px-3 text-sm font-medium text-ink-soft transition hover:bg-card hover:text-ink"
              href={`/projects/${project.id}/export`}
            >
              Exportar JSON
            </a>
            <form action={createNoteAction}>
              <input name="projectId" type="hidden" value={project.id} />
              <button
                className="h-9 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep"
                type="submit"
              >
                Nueva nota
              </button>
            </form>
          </div>
        </div>

        {/* Note list + views */}
        <div className="px-6 py-6">
          {notes.length === 0 ? (
            <section className="py-12">
              <h2 className="text-xl font-semibold text-ink">
                No hay notas todavía
              </h2>
              <p className="mt-2 max-w-xl text-ink-soft">
                Crea una nota para editar su título, contenido, capa, estado y
                etiquetas.
              </p>
            </section>
          ) : filteredNotes.length === 0 ? (
            <section className="py-12">
              <h2 className="text-xl font-semibold text-ink">
                Sin resultados
              </h2>
              <p className="mt-2 max-w-xl text-ink-soft">
                Ninguna nota coincide con &ldquo;{search}&rdquo;.
              </p>
            </section>
          ) : (
            <ul className="grid gap-2">
              {filteredNotes.map((note) => (
                <li key={note.id}>
                  <Link
                    className={`block rounded-card border bg-card px-4 py-3 shadow-card transition hover:shadow-lift ${
                      selectedNoteId === note.id
                        ? "border-blue ring-2 ring-blue-soft"
                        : "border-line"
                    }`}
                    href={`/projects/${project.id}?note=${note.id}`}
                  >
                    <h2 className="font-medium text-ink">{note.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                      {note.content || "Sin contenido"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <FunnelView notes={filteredNotes} projectId={project.id} />
          <BoardView notes={filteredNotes} projectId={project.id} />
          <CanvasView
            edges={explicitEdges}
            notes={notes}
            projectId={project.id}
          />
          <GraphView
            explicitEdges={explicitEdges}
            notes={notes}
            projectId={project.id}
            wikilinkEdges={wikilinkEdges}
          />
        </div>
      </section>
      <NoteInspector
        backlinks={backlinks}
        note={inspectorNote}
        outgoingLinks={outgoingLinks}
        projectId={project.id}
        wikilinkTargets={wikilinkTargets}
      />
    </main>
  );
}
