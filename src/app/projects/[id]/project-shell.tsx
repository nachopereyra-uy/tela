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
      <div className="min-h-screen bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <span className="text-sm font-medium text-slate-600">
            {project.name}
          </span>
          <button
            className="h-8 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
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
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="h-10 w-52 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o etiqueta…"
              type="search"
              value={search}
            />
            <button
              className="flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              onClick={() => setPresentMode(true)}
              type="button"
            >
              Presentar
            </button>
            <a
              className="flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              href={`/projects/${project.id}/export`}
            >
              Exportar JSON
            </a>
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
        </div>

        {notes.length === 0 ? (
          <section className="py-16">
            <h2 className="text-xl font-semibold text-slate-950">
              No hay notas todavía
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Crea una nota para editar su título, contenido, capa, estado y
              etiquetas.
            </p>
          </section>
        ) : filteredNotes.length === 0 ? (
          <section className="py-16">
            <h2 className="text-xl font-semibold text-slate-950">
              Sin resultados
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Ninguna nota coincide con &ldquo;{search}&rdquo;.
            </p>
          </section>
        ) : (
          <ul className="grid gap-3 py-8">
            {filteredNotes.map((note) => (
              <li key={note.id}>
                <Link
                  className={`block rounded-lg border bg-white px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50 ${
                    selectedNoteId === note.id
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
