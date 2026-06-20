"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  backlinks,
  findByTitle,
  outgoingLinks,
  type NoteLayer,
  type NoteStatus,
  type Note,
} from "@/core";
import { BoardView } from "./board-view";
import { CanvasView } from "./canvas-view";
import { FunnelView } from "./funnel-view";
import { DocumentsView } from "./documents-view";
import { NoteInspector } from "./note-inspector";
import { useProjectContext } from "../global-shell";

export type ShellNote = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: NoteStatus;
  layer: NoteLayer;
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

export type ShellProject = {
  id: string;
  name: string;
  color: string;
};

export type { View } from "../view-types";
import type { View } from "../view-types";

const VALID_VIEWS: View[] = ["funnel", "canvas", "board", "documents"];

type ProjectShellProps = {
  project: ShellProject;
  notes: ShellNote[];
  explicitEdges: ShellEdge[];
  initialNoteId: string | null;
};

function toCoreNote(note: ShellNote): Note {
  return {
    ...note,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const VIEW_LABELS: Record<View, string> = {
  funnel: "Embudo",
  canvas: "Lienzo",
  board: "Tablero",
  documents: "Documentos",
};

function IconFunnel({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 3h12l-4.5 5v4l-3-1.5V8L2 3z" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
function IconCanvas({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1.5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" fill="none" />
      <rect x="9" y="2" width="5" height="5" rx="1.5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" fill="none" />
      <rect x="2" y="9" width="5" height="5" rx="1.5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" fill="none" />
      <path d="M9 11.5h5M11.5 9v5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconBoard({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="3" height="12" rx="1" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" fill="none" />
      <rect x="6.5" y="2" width="3" height="8" rx="1" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" fill="none" />
      <rect x="11" y="2" width="3" height="10" rx="1" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" fill="none" />
    </svg>
  );
}
function IconDocs({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" fill="none" />
      <path d="M5.5 5h5M5.5 7.5h5M5.5 10h3" stroke={active ? "var(--blue)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ProjectShell({
  project,
  notes: initialNotes,
  explicitEdges: initialEdges,
  initialNoteId,
}: ProjectShellProps) {
  const { activeView, setActiveView, setNoteCount, setConnectionCount } = useProjectContext();
  const router = useRouter();

  const [localNotes, setLocalNotes] = useState<ShellNote[]>(initialNotes);
  const [localEdges, setLocalEdges] = useState<ShellEdge[]>(initialEdges);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialNoteId);
  const [inspectorOpen, setInspectorOpen] = useState(!!initialNoteId);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const deleteNoteRef = useRef<(() => void) | null>(null);

  // Sync from server on RSC re-render (after revalidatePath)
  useEffect(() => {
    setLocalNotes(initialNotes);
  }, [initialNotes]);
  useEffect(() => {
    setLocalEdges(initialEdges);
  }, [initialEdges]);

  // Report counts to global sidebar
  useEffect(() => {
    setNoteCount(localNotes.length);
  }, [localNotes.length, setNoteCount]);
  useEffect(() => {
    setConnectionCount(localEdges.length);
  }, [localEdges.length, setConnectionCount]);

  // Load active view from localStorage (initial mount only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`tela:view:${project.id}`);
      if (stored && VALID_VIEWS.includes(stored as View)) {
        setActiveView(stored as View);
      }
    } catch {
      // localStorage unavailable (SSR guard)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  function handleNoteSelect(noteId: string) {
    setSelectedNoteId(noteId);
    setInspectorOpen(true);
  }

  function handleInspectorClose() {
    setInspectorOpen(false);
  }

  function handleNoteUpdate(noteId: string, changes: Partial<ShellNote>) {
    setLocalNotes((current) =>
      current.map((n) => (n.id === noteId ? { ...n, ...changes } : n)),
    );
  }

  function handleNoteDeleted(noteId: string) {
    setLocalNotes((current) => current.filter((n) => n.id !== noteId));
    setLocalEdges((current) =>
      current.filter(
        (e) => e.fromNoteId !== noteId && e.toNoteId !== noteId,
      ),
    );
    setSelectedNoteId(null);
    setInspectorOpen(false);
    router.refresh();
  }

  function handleEdgeCreate(edge: ShellEdge) {
    setLocalEdges((current) => [...current, edge]);
  }

  function handleEdgeDelete(edgeId: string) {
    setLocalEdges((current) => current.filter((e) => e.id !== edgeId));
  }

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return localNotes;
    const q = search.toLowerCase();
    return localNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [localNotes, search]);

  const coreNotes = useMemo(() => localNotes.map(toCoreNote), [localNotes]);
  const selectedNote = useMemo(
    () => localNotes.find((n) => n.id === selectedNoteId) ?? null,
    [localNotes, selectedNoteId],
  );
  const selectedCoreNote = useMemo(
    () => (selectedNote ? toCoreNote(selectedNote) : null),
    [selectedNote],
  );
  const computedOutgoingLinks = useMemo(
    () =>
      selectedCoreNote
        ? outgoingLinks(selectedCoreNote.content).map((title) => ({
            title,
            noteId: findByTitle(coreNotes, title)?.id ?? null,
          }))
        : [],
    [selectedCoreNote, coreNotes],
  );
  const computedBacklinks = useMemo(
    () =>
      selectedCoreNote
        ? backlinks(selectedCoreNote, coreNotes).map((n) => ({
            id: n.id,
            title: n.title,
          }))
        : [],
    [selectedCoreNote, coreNotes],
  );
  const wikilinkTargets = useMemo(
    () => localNotes.map((n) => ({ id: n.id, title: n.title })),
    [localNotes],
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        handleInspectorClose();
        return;
      }
      if (e.key === "Delete") {
        const target = e.target as Element;
        if (target.matches("input, textarea, select, [contenteditable]")) return;
        if (selectedNoteId && inspectorOpen) {
          deleteNoteRef.current?.();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNoteId, inspectorOpen]);

  const VIEW_ICONS: Record<View, React.ReactNode> = {
    funnel: <IconFunnel active />,
    canvas: <IconCanvas active />,
    board: <IconBoard active />,
    documents: <IconDocs active />,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <header
        className="flex h-[54px] shrink-0 items-center gap-3 border-b border-line px-4"
        style={{ background: "rgba(250,248,243,0.85)", backdropFilter: "blur(6px)" }}
      >
        <div className="flex items-center gap-2 min-w-0 mr-2">
          <span className="text-blue">{VIEW_ICONS[activeView]}</span>
          <span className="text-sm font-semibold text-ink">{VIEW_LABELS[activeView]}</span>
        </div>
        <input
          ref={searchRef}
          type="search"
          placeholder="Buscar notas…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-48 rounded-btn border border-line bg-paper px-3 text-sm placeholder:text-ink-faint focus:border-blue focus:bg-card focus:outline-none focus:ring-2 focus:ring-blue-soft transition"
        />
      </header>

      {/* Stage */}
      <div className="relative flex-1 overflow-hidden">
        {activeView === "funnel" && (
          <FunnelView
            notes={filteredNotes}
            projectId={project.id}
            onNoteSelect={handleNoteSelect}
          />
        )}
        {activeView === "canvas" && (
          <CanvasView
            notes={localNotes}
            edges={localEdges}
            projectId={project.id}
            onNoteSelect={handleNoteSelect}
            onEdgeCreate={handleEdgeCreate}
            onEdgeDelete={handleEdgeDelete}
          />
        )}
        {activeView === "board" && (
          <BoardView
            notes={filteredNotes}
            projectId={project.id}
            onNoteSelect={handleNoteSelect}
          />
        )}
        {activeView === "documents" && (
          <DocumentsView
            notes={filteredNotes}
            projectId={project.id}
            selectedNoteId={selectedNoteId}
            onNoteSelect={(id) => {
              setSelectedNoteId(id);
              setInspectorOpen(false);
            }}
            onNoteUpdate={handleNoteUpdate}
            wikilinkTargets={wikilinkTargets}
          />
        )}
        {/* Inspector overlay (slide from right) */}
        <NoteInspector
          note={selectedNote}
          outgoingLinks={computedOutgoingLinks}
          backlinks={computedBacklinks}
          wikilinkTargets={wikilinkTargets}
          projectId={project.id}
          isOpen={inspectorOpen && activeView !== "documents"}
          onClose={handleInspectorClose}
          onUpdate={handleNoteUpdate}
          onDeleted={handleNoteDeleted}
          onNoteNavigate={handleNoteSelect}
          deleteRef={deleteNoteRef}
        />
      </div>
    </div>
  );
}
