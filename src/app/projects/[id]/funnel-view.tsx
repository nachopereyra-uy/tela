"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { LAYERS, type NoteLayer } from "@/core";
import { moveNoteLayerAction } from "./actions";

type FunnelNote = {
  id: string;
  title: string;
  layer: string;
};

type FunnelViewProps = {
  notes: FunnelNote[];
  projectId: string;
};

export function FunnelView({ notes, projectId }: FunnelViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [, startTransition] = useTransition();
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
      <section className="border-t border-slate-200 py-8">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-950">Embudo</h2>
          <p className="mt-1 text-sm text-slate-600">
            Las seis capas del negocio con sus notas asignadas.
          </p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {LAYERS.map((layer) => (
            <FunnelLayer
              key={layer.id}
              layer={layer}
              notes={notesByLayer.get(layer.id) ?? []}
              projectId={projectId}
            />
          ))}
        </div>
      </section>
    </DndContext>
  );
}

type FunnelLayerProps = {
  layer: (typeof LAYERS)[number];
  notes: FunnelNote[];
  projectId: string;
};

function FunnelLayer({ layer, notes, projectId }: FunnelLayerProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: layer.id,
  });

  return (
    <section
      className={`rounded-lg border bg-white p-4 transition ${
        isOver ? "border-indigo-400" : "border-slate-200"
      }`}
      ref={setNodeRef}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-sm font-semibold text-indigo-700">
          {layer.number}
        </span>
        <div>
          <h3 className="font-semibold text-slate-950">{layer.name}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {layer.question}
          </p>
        </div>
      </div>
      <ul className="mt-4 grid min-h-14 gap-2">
        {notes.map((note) => (
          <DraggableFunnelNote key={note.id} note={note} projectId={projectId} />
        ))}
      </ul>
    </section>
  );
}

function DraggableFunnelNote({
  note,
  projectId,
}: {
  note: FunnelNote;
  projectId: string;
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
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            className="h-7 w-7 cursor-grab rounded-md border border-slate-200 text-slate-500 active:cursor-grabbing"
            type="button"
            {...listeners}
            {...attributes}
          >
            ::
          </button>
          <a
            className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 transition hover:text-indigo-700"
            href={`/projects/${projectId}?note=${note.id}`}
          >
            {note.title}
          </a>
        </div>
      </div>
    </li>
  );
}
