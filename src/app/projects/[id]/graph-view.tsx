"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  type Edge as FlowEdge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";

type GraphNote = {
  id: string;
  title: string;
};

type ExplicitGraphEdge = {
  id: string;
  fromNoteId: string;
  toNoteId: string;
};

type WikilinkGraphEdge = {
  fromNoteId: string;
  toNoteId: string;
  title: string;
};

type GraphViewProps = {
  explicitEdges: ExplicitGraphEdge[];
  notes: GraphNote[];
  presentMode?: boolean;
  projectId: string;
  wikilinkEdges: WikilinkGraphEdge[];
};

export function GraphView({
  explicitEdges,
  notes,
  presentMode,
  projectId,
  wikilinkEdges,
}: GraphViewProps) {
  const nodes: Node[] = useMemo(() => {
    const radius = Math.max(180, notes.length * 34);

    return notes.map((note, index) => {
      const angle = (index / Math.max(notes.length, 1)) * Math.PI * 2;

      return {
        id: note.id,
        data: { label: note.title },
        position: {
          x: Math.round(Math.cos(angle) * radius + radius),
          y: Math.round(Math.sin(angle) * radius + radius),
        },
      };
    });
  }, [notes]);

  const edges: FlowEdge[] = useMemo(
    () => [
      ...explicitEdges.map((edge) => ({
        id: `edge:${edge.id}`,
        source: edge.fromNoteId,
        target: edge.toNoteId,
        label: "conexion",
      })),
      ...wikilinkEdges.map((edge, index) => ({
        id: `wikilink:${edge.fromNoteId}:${edge.toNoteId}:${index}`,
        source: edge.fromNoteId,
        target: edge.toNoteId,
        label: edge.title,
        animated: true,
        style: { strokeDasharray: "4 4" },
      })),
    ],
    [explicitEdges, wikilinkEdges],
  );

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    window.location.href = `/projects/${projectId}?note=${node.id}`;
  };

  return (
    <section className="border-t border-slate-200 py-8">
      {!presentMode && (
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-950">Grafo</h2>
          <p className="mt-1 text-sm text-slate-600">
            Conexiones explícitas y enlaces de documentos.
          </p>
        </div>
      )}
      <div className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${presentMode ? "h-[80vh]" : "h-[520px]"}`}>
        <ReactFlow
          edges={edges}
          fitView
          nodes={nodes}
          nodesDraggable={false}
          onNodeClick={handleNodeClick}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </section>
  );
}
