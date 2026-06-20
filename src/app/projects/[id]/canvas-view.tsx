"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type Edge as FlowEdge,
  type Node,
} from "@xyflow/react";
import {
  createCanvasEdgeAction,
  deleteCanvasEdgeAction,
  moveNotePositionAction,
} from "./actions";

type CanvasNote = {
  id: string;
  title: string;
  x: number;
  y: number;
};

type CanvasViewProps = {
  edges: Array<{
    id: string;
    fromNoteId: string;
    toNoteId: string;
  }>;
  notes: CanvasNote[];
  presentMode?: boolean;
  projectId: string;
};

export function CanvasView({ edges, notes, presentMode, projectId }: CanvasViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [localEdges, setLocalEdges] = useState<FlowEdge[]>(
    edges.map((edge) => ({
      id: edge.id,
      source: edge.fromNoteId,
      target: edge.toNoteId,
    })),
  );
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

  function handleConnect(connection: Connection) {
    if (!connection.source || !connection.target) {
      return;
    }

    startTransition(async () => {
      const edge = await createCanvasEdgeAction({
        projectId,
        fromNoteId: connection.source!,
        toNoteId: connection.target!,
      });

      setLocalEdges((current) => [
        ...current,
        {
          id: edge.id,
          source: edge.fromNoteId,
          target: edge.toNoteId,
        },
      ]);
    });
  }

  function handleEdgesDelete(deletedEdges: FlowEdge[]) {
    setLocalEdges((current) =>
      current.filter(
        (edge) => !deletedEdges.some((deletedEdge) => deletedEdge.id === edge.id),
      ),
    );

    for (const edge of deletedEdges) {
      startTransition(async () => {
        try {
          await deleteCanvasEdgeAction({ projectId, edgeId: edge.id });
        } catch {
          setLocalEdges((current) => [...current, edge]);
        }
      });
    }
  }

  return (
    <section className="border-t border-slate-200 py-8">
      {!presentMode && (
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-950">Lienzo</h2>
          <p className="mt-1 text-sm text-slate-600">
            Nodos posicionables con pan y zoom.
          </p>
        </div>
      )}
      <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${presentMode ? "h-[80vh]" : "h-[520px]"}`}>
        <ReactFlow
          edges={localEdges}
          fitView
          nodes={nodes}
          onConnect={handleConnect}
          onEdgesDelete={handleEdgesDelete}
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
