"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { NOTE_STATUSES, type NoteStatus } from "@/core";
import { createNoteInStatusAction, moveNoteStatusAction } from "./actions";

type BoardNote = {
  id: string;
  title: string;
  content: string;
  status: string;
};

type BoardViewProps = {
  notes: BoardNote[];
  projectId: string;
  onNoteSelect?: (id: string) => void;
};

const statusLabels: Record<NoteStatus, string> = {
  todo: "Por hacer",
  doing: "En curso",
  done: "Hecho",
  idea: "Idea",
  none: "Sin estado",
};

const STATUS_COLORS: Record<string, string> = {
  todo: 'var(--todo)',
  doing: 'var(--doing)',
  done: 'var(--done)',
  idea: 'var(--idea)',
  none: 'var(--ink-faint)',
};

export function BoardView({ notes, projectId, onNoteSelect }: BoardViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [, startTransition] = useTransition();
  const notesByStatus = useMemo(() => {
    const grouped = new Map<NoteStatus, BoardNote[]>();

    for (const status of NOTE_STATUSES) {
      grouped.set(status, []);
    }

    for (const note of localNotes) {
      const statusNotes = grouped.get(note.status as NoteStatus);

      if (statusNotes) {
        statusNotes.push(note);
      }
    }

    return grouped;
  }, [localNotes]);

  function handleDragEnd(event: DragEndEvent) {
    const noteId = String(event.active.id);
    const status = event.over?.id;

    if (typeof status !== "string") {
      return;
    }

    const currentNote = localNotes.find((note) => note.id === noteId);

    if (!currentNote || currentNote.status === status) {
      return;
    }

    setLocalNotes((current) =>
      current.map((note) => (note.id === noteId ? { ...note, status } : note)),
    );

    startTransition(async () => {
      try {
        await moveNoteStatusAction({ projectId, noteId, status });
      } catch {
        setLocalNotes(notes);
      }
    });
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-full overflow-y-auto px-4 py-4">
        <div className="grid gap-3 xl:grid-cols-5">
          {NOTE_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              notes={notesByStatus.get(status) ?? []}
              projectId={projectId}
              status={status}
              onNoteSelect={onNoteSelect}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}

type BoardColumnProps = {
  notes: BoardNote[];
  projectId: string;
  status: NoteStatus;
  onNoteSelect?: (id: string) => void;
};

function BoardColumn({ notes, projectId, status, onNoteSelect }: BoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });
  const color = STATUS_COLORS[status] ?? 'var(--ink-faint)';

  return (
    <section
      className="rounded-card border border-line bg-paper-2 p-3 min-h-[200px] transition"
      style={{ borderColor: isOver ? color : undefined }}
      ref={setNodeRef}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span style={{ color, fontSize: 16, lineHeight: 1 }}>●</span>
          <h3 className="text-sm font-semibold text-ink">{statusLabels[status]}</h3>
        </div>
        <span
          className="rounded-pill px-2 py-0.5 text-xs font-medium"
          style={{ background: 'var(--line)', color: 'var(--ink-soft)' }}
        >
          {notes.length}
        </span>
      </div>
      <ul className="grid gap-2">
        {notes.map((note) => (
          <DraggableBoardNote key={note.id} note={note} projectId={projectId} onNoteSelect={onNoteSelect} />
        ))}
      </ul>
      <form action={createNoteInStatusAction} className="mt-2">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="status" value={status} />
        <button
          type="submit"
          className="w-full h-8 rounded-btn border border-line bg-paper px-3 text-sm text-ink-soft hover:bg-card hover:text-ink transition"
        >
          + Añadir nota
        </button>
      </form>
    </section>
  );
}

function DraggableBoardNote({
  note,
  projectId,
  onNoteSelect,
}: {
  note: BoardNote;
  projectId: string;
  onNoteSelect?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: note.id,
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <li
      className={isDragging ? "relative z-10 opacity-80" : undefined}
      ref={setNodeRef}
      style={style}
    >
      <div className="rounded-btn border border-line bg-card px-3 py-2 shadow-card hover:shadow-lift transition">
        <div className="flex items-start gap-2">
          <button
            className="mt-0.5 h-7 w-7 shrink-0 cursor-grab rounded-btn border border-line text-ink-faint active:cursor-grabbing"
            type="button"
            {...listeners}
            {...attributes}
          >
            ::
          </button>
          <a
            className="min-w-0 flex-1 transition hover:text-blue"
            href={`/projects/${projectId}?note=${note.id}`}
            onClick={(e) => { e.preventDefault(); onNoteSelect?.(note.id); }}
          >
            <span className="block truncate text-sm font-medium text-ink">
              {note.title}
            </span>
            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-ink-soft">
              {note.content || "Sin contenido"}
            </span>
          </a>
        </div>
      </div>
    </li>
  );
}
