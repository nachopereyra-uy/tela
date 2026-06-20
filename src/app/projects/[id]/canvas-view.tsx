"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Node,
} from "@xyflow/react";
import { moveNotePositionAction } from "./actions";

type CanvasNote = {
  id: string;
  title: string;
  x: number;
  y: number;
};

type CanvasViewProps = {
  notes: CanvasNote[];
  projectId: string;
};

export function CanvasView({ notes, projectId }: CanvasViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [, startTransition] = useTransition();
  const nodes: Node[] = useMemo(
    () =>
      localNotes.map((note, index) => ({
        id: note.id,
        data: { label: note.title },
        position: {
          x: note.x || (index % 4) * 220,
          y: note.y || Math.floor(index / 4) * 140,
        },
      })),
    [localNotes],
  );

  const handleNodeDragStop = (_event: unknown, node: Node) => {
    const x = Math.round(node.position.x);
    const y = Math.round(node.position.y);

    setLocalNotes((current) =>
      current.map((note) => (note.id === node.id ? { ...note, x, y } : note)),
    );

    startTransition(async () => {
      try {
        await moveNotePositionAction({
          projectId,
          noteId: node.id,
          x,
          y,
        });
      } catch {
        setLocalNotes(notes);
      }
    });
  };

  return (
    <section className="border-t border-slate-200 py-8">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">Lienzo</h2>
        <p className="mt-1 text-sm text-slate-600">
          Nodos posicionables con pan y zoom.
        </p>
      </div>
      <div className="h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-white">
        <ReactFlow
          fitView
          nodes={nodes}
          onNodeDragStop={handleNodeDragStop}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </section>
  );
}
