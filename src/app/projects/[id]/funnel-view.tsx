"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { LAYERS, type NoteLayer } from "@/core";
import { createNoteInLayerAction, moveNoteLayerAction } from "./actions";

type FunnelNote = {
  id: string;
  title: string;
  layer: string;
};

type FunnelViewProps = {
  notes: FunnelNote[];
  presentMode?: boolean;
  projectId: string;
  onNoteSelect?: (id: string) => void;
};

const LAYER_COLORS: Record<string, string> = {
  marketing: 'var(--l-marketing)',
  ventas: 'var(--l-ventas)',
  cierre: 'var(--l-cierre)',
  onboarding: 'var(--l-onboarding)',
  entrega: 'var(--l-entrega)',
  posventa: 'var(--l-posventa)',
};

const LAYER_GRADIENT = `linear-gradient(to bottom, var(--l-marketing), var(--l-ventas), var(--l-cierre), var(--l-onboarding), var(--l-entrega), var(--l-posventa))`;

export function FunnelView({ notes, presentMode, projectId, onNoteSelect }: FunnelViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [, startTransition] = useTransition();

  // Sync when parent re-renders after router.refresh()
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);
  const notesByLayer = useMemo(() => {
    const grouped = new Map<NoteLayer, FunnelNote[]>();

    for (const layer of LAYERS) {
      grouped.set(layer.id, []);
    }

    for (const note of localNotes) {
      if (note.layer === "none") {
        continue;
      }

      const layerNotes = grouped.get(note.layer as NoteLayer);

      if (layerNotes) {
        layerNotes.push(note);
      }
    }

    return grouped;
  }, [localNotes]);

  function handleDragEnd(event: DragEndEvent) {
    const noteId = String(event.active.id);
    const layer = event.over?.id;

    if (typeof layer !== "string") {
      return;
    }

    const currentNote = localNotes.find((note) => note.id === noteId);

    if (!currentNote || currentNote.layer === layer) {
      return;
    }

    setLocalNotes((current) =>
      current.map((note) => (note.id === noteId ? { ...note, layer } : note)),
    );

    startTransition(async () => {
      try {
        await moveNoteLayerAction({ projectId, noteId, layer });
      } catch {
        setLocalNotes(notes);
      }
    });
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="h-full overflow-y-auto px-6 py-6">
        <div className="flex gap-3">
          {/* Vertical spine */}
          <div className="flex flex-col items-center" style={{ width: 40 }}>
            <div
              className="w-1 flex-1 rounded-full"
              style={{ background: LAYER_GRADIENT, minHeight: 200 }}
            />
          </div>
          {/* Layer bands */}
          <div className="flex-1 grid gap-3">
            {LAYERS.map((layer) => (
              <FunnelLayer
                key={layer.id}
                layer={layer}
                notes={notesByLayer.get(layer.id) ?? []}
                presentMode={presentMode}
                projectId={projectId}
                onNoteSelect={onNoteSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
}

type FunnelLayerProps = {
  layer: (typeof LAYERS)[number];
  notes: FunnelNote[];
  presentMode?: boolean;
  projectId: string;
  onNoteSelect?: (id: string) => void;
};

function FunnelLayer({ layer, notes, presentMode, projectId, onNoteSelect }: FunnelLayerProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: layer.id,
  });
  const layerColor = LAYER_COLORS[layer.id] ?? 'var(--ink-faint)';

  return (
    <section
      className="rounded-card border bg-card p-4 shadow-card transition"
      style={{ borderColor: isOver ? layerColor : 'var(--line)' }}
      ref={setNodeRef}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            border: `2px solid ${layerColor}`,
            color: layerColor,
            background: 'var(--paper)',
          }}
        >
          {layer.number}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-[3px] w-5 rounded-full shrink-0"
              style={{ background: layerColor }}
            />
            <h3 className="font-semibold text-ink">{layer.name}</h3>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-pill"
              style={{
                background: 'var(--paper-2)',
                color: 'var(--ink-soft)',
              }}
            >
              {notes.length}
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-ink-soft">
            {layer.question}
          </p>
        </div>
      </div>
      {!presentMode && (
        <form action={createNoteInLayerAction} className="mt-4">
          <input name="projectId" type="hidden" value={projectId} />
          <input name="layer" type="hidden" value={layer.id} />
          <button
            className="h-9 rounded-btn border border-line bg-paper px-3 text-sm font-medium text-ink-soft transition hover:bg-card hover:text-ink"
            type="submit"
          >
            + Nota
          </button>
        </form>
      )}
      <ul className="mt-4 grid min-h-14 gap-2">
        {notes.map((note) => (
          <DraggableFunnelNote key={note.id} note={note} projectId={projectId} layerColor={layerColor} onNoteSelect={onNoteSelect} />
        ))}
      </ul>
    </section>
  );
}

function DraggableFunnelNote({
  note,
  projectId,
  layerColor,
  onNoteSelect,
}: {
  note: FunnelNote;
  projectId: string;
  layerColor: string;
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
      <div
        className="rounded-btn border border-line bg-card px-3 py-2 shadow-card"
        style={{ borderLeftWidth: 3, borderLeftColor: layerColor }}
      >
        <div className="flex items-center gap-2">
          <button
            className="h-7 w-7 cursor-grab rounded-btn border border-line text-ink-faint active:cursor-grabbing"
            type="button"
            {...listeners}
            {...attributes}
          >
            ::
          </button>
          <a
            className="min-w-0 flex-1 truncate text-sm font-medium text-ink transition hover:text-blue"
            href={`/projects/${projectId}?note=${note.id}`}
            onClick={(e) => { e.preventDefault(); onNoteSelect?.(note.id); }}
          >
            {note.title}
          </a>
        </div>
      </div>
    </li>
  );
}
