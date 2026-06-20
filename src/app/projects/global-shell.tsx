"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useActionState } from "react";
import { Logo } from "@/app/components/logo";
import {
  deleteProjectAction,
  importProjectAction,
  renameProjectAction,
  type ProjectActionState,
} from "./actions";
import { createNoteAction } from "./[id]/actions";
import type { View } from "./view-types";

// ─── Context ──────────────────────────────────────────────────────────────────

type GlobalContextType = {
  activeView: View;
  setActiveView: (v: View) => void;
  noteCount: number;
  setNoteCount: (n: number) => void;
  connectionCount: number;
  setConnectionCount: (n: number) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  activeView: "funnel",
  setActiveView: () => {},
  noteCount: 0,
  setNoteCount: () => {},
  connectionCount: 0,
  setConnectionCount: () => {},
});

export function useProjectContext() {
  return useContext(GlobalContext);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconFunnel({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 3h12l-4.5 5v4l-3-1.5V8L2 3z" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function IconCanvas({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1.5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1.5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1.5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <path d="M9 11.5h5M11.5 9v5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconBoard({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="3" height="12" rx="1" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <rect x="6.5" y="2" width="3" height="8" rx="1" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <rect x="11" y="2" width="3" height="10" rx="1" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
    </svg>
  );
}
function IconDocs({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <path d="M5.5 5h5M5.5 7.5h5M5.5 10h3" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconGraph({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="3" r="2" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <circle cx="3" cy="13" r="2" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <circle cx="13" cy="13" r="2" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" />
      <path d="M6.5 4.5L4.5 11.5M9.5 4.5L11.5 11.5M5 13h6" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const VIEWS: View[] = ["funnel", "canvas", "board", "documents", "graph"];
const VIEW_LABELS: Record<View, string> = {
  funnel: "Embudo",
  canvas: "Lienzo",
  board: "Tablero",
  documents: "Documentos",
  graph: "Grafo",
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type SidebarProject = { id: string; name: string; color: string };

const initialActionState: ProjectActionState = {};

function GlobalSidebar({
  projects,
  currentProjectId,
  activeView,
  onViewChange,
  noteCount,
  connectionCount,
}: {
  projects: SidebarProject[];
  currentProjectId: string | null;
  activeView: View;
  onViewChange: (v: View) => void;
  noteCount: number;
  connectionCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const renameDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const isOnProjectsList = pathname === "/projects";

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? null;

  const [renameState, renameFormAction, renamePending] = useActionState(renameProjectAction, initialActionState);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deleteProjectAction, initialActionState);

  const ViewIcon: Record<View, (p: { active: boolean }) => React.ReactNode> = {
    funnel: IconFunnel,
    canvas: IconCanvas,
    board: IconBoard,
    documents: IconDocs,
    graph: IconGraph,
  };

  return (
    <aside
      className="flex flex-col border-r border-line bg-paper-2 overflow-y-auto shrink-0"
      style={{ width: 230 }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-2">
        <Logo />
      </div>

      {/* Projects nav link */}
      <div className="px-3 py-1">
        <Link
          href="/projects"
          className={`flex items-center gap-2 rounded-btn px-3 py-1.5 text-sm font-medium transition ${
            isOnProjectsList
              ? "text-blue bg-blue-soft"
              : "text-ink-soft hover:text-ink hover:bg-card/60"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="7.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="1" y="7.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Proyectos
        </Link>
      </div>

      {/* Project selector (only when inside a project) */}
      {currentProject && (
        <div className="px-3 py-2 relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-card px-2 py-2 text-left transition hover:bg-line"
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-card text-sm font-bold text-white"
              style={{ background: currentProject.color }}
            >
              {getInitial(currentProject.name)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
              {currentProject.name}
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0 text-ink-faint">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div className="absolute left-2 right-2 top-full z-30 mt-1 rounded-card border border-line bg-card shadow-lift py-1.5">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Proyectos</p>
                <div className="max-h-44 overflow-y-auto">
                  {projects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-paper transition"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-bold text-white" style={{ background: p.color }}>
                        {getInitial(p.name)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{p.name}</span>
                      {p.id === currentProjectId && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0 text-blue">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-line mt-1 pt-1">
                  <button type="button" onClick={() => { setMenuOpen(false); renameDialogRef.current?.showModal(); }}
                    className="flex w-full items-center px-3 py-2 text-sm text-ink-soft hover:bg-paper hover:text-ink transition">
                    Renombrar proyecto
                  </button>
                  <button type="button" onClick={() => { setMenuOpen(false); deleteDialogRef.current?.showModal(); }}
                    className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                    Eliminar proyecto
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* View navigation (only when inside a project) */}
      {currentProject && (
        <nav className="flex-1 px-3 py-2">
          {VIEWS.map((view) => {
            const active = activeView === view;
            const Icon = ViewIcon[view];
            return (
              <button
                key={view}
                type="button"
                onClick={() => onViewChange(view)}
                className={`flex w-full items-center gap-2.5 rounded-card px-3 py-2 text-sm font-medium transition mb-0.5 ${
                  active ? "bg-card text-ink shadow-card" : "text-ink-soft hover:bg-card/60 hover:text-ink"
                }`}
              >
                <span className={active ? "text-blue" : "text-ink-faint"}>
                  <Icon active={active} />
                </span>
                {VIEW_LABELS[view]}
              </button>
            );
          })}
        </nav>
      )}

      {/* On projects list: just take up the space */}
      {!currentProject && <div className="flex-1" />}

      {/* Stats (only when inside a project) */}
      {currentProject && (
        <div className="border-t border-line px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-faint mb-1">Espacio</p>
          <p className="text-xs text-ink-soft">{noteCount} notas · {connectionCount} conexiones</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-line px-3 py-3 space-y-0.5">
        {/* Import */}
        <form action={importProjectAction}>
          <label className="flex cursor-pointer items-center gap-2 rounded-btn px-3 py-2 text-sm text-ink-soft hover:bg-card hover:text-ink transition">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Importar proyecto
            <input type="file" name="file" accept="application/json" required className="sr-only"
              onChange={(e) => { if (e.currentTarget.files?.length) e.currentTarget.form?.requestSubmit(); }} />
          </label>
        </form>
        {/* Export (only in project) */}
        {currentProject && (
          <a href={`/projects/${currentProject.id}/export`}
            className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm text-ink-soft hover:bg-card hover:text-ink transition">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 9V1M4 4l3-3 3 3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exportar proyecto
          </a>
        )}
      </div>

      {/* Rename dialog */}
      {currentProject && (
        <dialog ref={renameDialogRef} className="w-[min(92vw,420px)] rounded-dialog border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/20 backdrop:backdrop-blur-sm">
          <form action={renameFormAction} className="grid gap-5 p-6">
            <input type="hidden" name="projectId" value={currentProject.id} />
            <h2 className="text-lg font-semibold text-ink">Renombrar proyecto</h2>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-ink" htmlFor="gs-rename">Nombre</label>
              <input id="gs-rename" name="name" defaultValue={currentProject.name} maxLength={120} required autoFocus
                className="h-10 rounded-btn border border-line bg-paper px-3 text-base text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft" />
            </div>
            {renameState.error && <p className="text-sm text-red-600">{renameState.error}</p>}
            <div className="flex justify-end gap-2">
              <button type="submit" formMethod="dialog" disabled={renamePending}
                className="h-10 rounded-btn border border-line px-4 text-sm font-medium text-ink-soft hover:bg-paper">Cancelar</button>
              <button type="submit" disabled={renamePending}
                className="h-10 rounded-btn bg-blue px-4 text-sm font-semibold text-white hover:bg-blue-deep disabled:opacity-50">
                {renamePending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </dialog>
      )}

      {/* Delete dialog */}
      {currentProject && (
        <dialog ref={deleteDialogRef} className="w-[min(92vw,420px)] rounded-dialog border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/20 backdrop:backdrop-blur-sm">
          <form action={deleteFormAction} className="grid gap-5 p-6">
            <input type="hidden" name="projectId" value={currentProject.id} />
            <div>
              <h2 className="text-lg font-semibold text-ink">Eliminar proyecto</h2>
              <p className="mt-1 text-sm text-ink-soft">Se borrarán todas sus notas y conexiones.</p>
            </div>
            <p className="rounded-btn border border-line bg-paper px-3 py-2 text-sm font-medium text-ink">{currentProject.name}</p>
            {deleteState.error && <p className="text-sm text-red-600">{deleteState.error}</p>}
            <div className="flex justify-end gap-2">
              <button type="submit" formMethod="dialog" disabled={deletePending}
                className="h-10 rounded-btn border border-line px-4 text-sm font-medium text-ink-soft hover:bg-paper">Cancelar</button>
              <button type="submit" disabled={deletePending}
                className="h-10 rounded-btn px-4 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "#B4452E" }}>
                {deletePending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </aside>
  );
}

// ─── GlobalShell (wraps entire /projects section) ─────────────────────────────

export function GlobalShell({
  projects,
  children,
}: {
  projects: SidebarProject[];
  children: React.ReactNode;
}) {
  const params = useParams<{ id?: string }>();
  const currentProjectId = params.id ?? null;

  const [activeView, setActiveView] = useState<View>("funnel");
  const [noteCount, setNoteCount] = useState(0);
  const [connectionCount, setConnectionCount] = useState(0);

  // Restore per-project view from localStorage
  useEffect(() => {
    if (!currentProjectId) return;
    try {
      const stored = localStorage.getItem(`tela:view:${currentProjectId}`);
      if (stored && ["funnel", "canvas", "board", "documents", "graph"].includes(stored)) {
        setActiveView(stored as View);
      } else {
        setActiveView("funnel");
      }
    } catch { /* ignore */ }
  }, [currentProjectId]);

  function handleViewChange(view: View) {
    setActiveView(view);
    if (currentProjectId) {
      try { localStorage.setItem(`tela:view:${currentProjectId}`, view); } catch { /* ignore */ }
    }
  }

  return (
    <GlobalContext.Provider value={{ activeView, setActiveView: handleViewChange, noteCount, setNoteCount, connectionCount, setConnectionCount }}>
      <div className="flex h-screen overflow-hidden bg-paper">
        <GlobalSidebar
          projects={projects}
          currentProjectId={currentProjectId}
          activeView={activeView}
          onViewChange={handleViewChange}
          noteCount={noteCount}
          connectionCount={connectionCount}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </GlobalContext.Provider>
  );
}
