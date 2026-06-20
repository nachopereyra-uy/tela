"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Logo } from "@/app/components/logo";
import { deleteProjectAction, renameProjectAction, importProjectAction, type ProjectActionState } from "@/app/projects/actions";
import type { View } from "./project-shell";

type SidebarProject = {
  id: string;
  name: string;
  color: string;
};

type SidebarProps = {
  project: SidebarProject;
  allProjects: SidebarProject[];
  noteCount: number;
  connectionCount: number;
  activeView: View;
  onViewChange: (view: View) => void;
  icons: Record<View, React.ReactNode>;
};

const VIEW_LABELS: Record<View, string> = {
  funnel: "Embudo",
  canvas: "Lienzo",
  board: "Tablero",
  documents: "Documentos",
  graph: "Grafo",
};

const VIEWS: View[] = ["funnel", "canvas", "board", "documents", "graph"];

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

const initialState: ProjectActionState = {};

export function Sidebar({
  project,
  allProjects,
  noteCount,
  connectionCount,
  activeView,
  onViewChange,
  icons,
}: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const renameDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [renameState, renameFormAction, renamePending] = useActionState(renameProjectAction, initialState);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteProjectAction, initialState);

  return (
    <aside
      className="flex flex-col border-r border-line bg-paper-2 overflow-y-auto shrink-0"
      style={{ width: 230 }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-2">
        <Logo />
      </div>

      {/* Project selector */}
      <div className="px-3 py-2 relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-card px-2 py-2 text-left transition hover:bg-line"
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-card text-sm font-bold text-white"
            style={{ background: project.color }}
          >
            {getInitial(project.name)}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
            {project.name}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0 text-ink-faint">
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-20"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-2 right-2 top-full z-30 mt-1 rounded-card border border-line bg-card shadow-lift py-1.5">
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Proyectos
              </p>
              <div className="max-h-48 overflow-y-auto">
                {allProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-paper transition"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
                      style={{ background: p.color }}
                    >
                      {getInitial(p.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                    {p.id === project.id && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0 text-blue">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>
                ))}
              </div>
              <div className="border-t border-line mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); renameDialogRef.current?.showModal(); }}
                  className="flex w-full items-center px-3 py-2 text-sm text-ink-soft hover:bg-paper hover:text-ink transition"
                >
                  Renombrar proyecto
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); deleteDialogRef.current?.showModal(); }}
                  className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  Eliminar proyecto
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {VIEWS.map((view) => {
          const active = activeView === view;
          return (
            <button
              key={view}
              type="button"
              onClick={() => onViewChange(view)}
              className={`flex w-full items-center gap-2.5 rounded-card px-3 py-2 text-sm font-medium transition mb-0.5 ${
                active
                  ? "bg-card text-ink shadow-card"
                  : "text-ink-soft hover:bg-card/60 hover:text-ink"
              }`}
            >
              <span className={active ? "text-blue" : "text-ink-faint"}>
                {icons[view]}
              </span>
              {VIEW_LABELS[view]}
            </button>
          );
        })}
      </nav>

      {/* Stats */}
      <div className="border-t border-line px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint mb-1">
          Espacio
        </p>
        <p className="text-xs text-ink-soft">
          {noteCount} notas · {connectionCount} conexiones
        </p>
      </div>

      {/* Footer: Import */}
      <div className="border-t border-line px-3 py-3">
        <form action={importProjectAction}>
          <label className="flex cursor-pointer items-center gap-2 rounded-btn px-3 py-2 text-sm text-ink-soft hover:bg-card hover:text-ink transition">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Importar proyecto
            <input
              type="file"
              name="file"
              accept="application/json"
              required
              className="sr-only"
              onChange={(e) => {
                if (e.currentTarget.files?.length) {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </label>
        </form>
        <a
          href={`/projects/${project.id}/export`}
          className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm text-ink-soft hover:bg-card hover:text-ink transition"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 9V1M4 4l3-3 3 3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Exportar proyecto
        </a>
      </div>

      {/* Rename dialog */}
      <dialog
        ref={renameDialogRef}
        className="w-[min(92vw,420px)] rounded-dialog border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/20 backdrop:backdrop-blur-sm"
      >
        <form action={renameFormAction} className="grid gap-5 p-6">
          <input type="hidden" name="projectId" value={project.id} />
          <div>
            <h2 className="text-lg font-semibold text-ink">Renombrar proyecto</h2>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="rename-name">Nombre</label>
            <input
              id="rename-name"
              name="name"
              defaultValue={project.name}
              maxLength={120}
              required
              autoFocus
              className="h-10 rounded-btn border border-line bg-paper px-3 text-base text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
            />
          </div>
          {renameState.error && (
            <p className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{renameState.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              formMethod="dialog"
              disabled={renamePending}
              className="h-10 rounded-btn border border-line px-4 text-sm font-medium text-ink-soft transition hover:bg-paper"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={renamePending}
              className="h-10 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep disabled:opacity-50"
            >
              {renamePending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </dialog>

      {/* Delete dialog */}
      <dialog
        ref={deleteDialogRef}
        className="w-[min(92vw,420px)] rounded-dialog border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/20 backdrop:backdrop-blur-sm"
      >
        <form action={deleteFormAction} className="grid gap-5 p-6">
          <input type="hidden" name="projectId" value={project.id} />
          <div>
            <h2 className="text-lg font-semibold text-ink">Eliminar proyecto</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Se borrarán todas sus notas y conexiones. Esta acción no se puede deshacer.
            </p>
          </div>
          <p className="rounded-btn border border-line bg-paper px-3 py-2 text-sm font-medium text-ink">
            {project.name}
          </p>
          {deleteState.error && (
            <p className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{deleteState.error}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              formMethod="dialog"
              disabled={deletePending}
              className="h-10 rounded-btn border border-line px-4 text-sm font-medium text-ink-soft transition hover:bg-paper"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={deletePending}
              className="h-10 rounded-btn px-4 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ backgroundColor: "#B4452E" }}
            >
              {deletePending ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </form>
      </dialog>
    </aside>
  );
}
