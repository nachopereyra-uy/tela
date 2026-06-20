"use client";

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Edge as FlowEdge,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";

type GraphNote = {
  id: string;
  title: string;
  status: string;
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
  projectId: string;
  wikilinkEdges: WikilinkGraphEdge[];
  onNoteSelect?: (id: string) => void;
};

const STATUS_COLORS: Record<string, string> = {
  todo: 'var(--todo)',
  doing: 'var(--doing)',
  done: 'var(--done)',
  idea: 'var(--idea)',
  none: 'var(--ink-faint)',
};

export function GraphView({
  explicitEdges,
  notes,
  projectId,
  wikilinkEdges,
  onNoteSelect,
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
        style: {
          background: STATUS_COLORS[note.status] ?? 'var(--ink-faint)',
          color: 'white',
          border: 'none',
          borderRadius: 9,
          fontSize: 12,
          fontWeight: 500,
          padding: '6px 12px',
          boxShadow: 'var(--shadow)',
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
        className: 'wikilink',
        animated: false,
      })),
    ],
    [explicitEdges, wikilinkEdges],
  );

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    if (onNoteSelect) {
      onNoteSelect(node.id);
    } else {
      window.location.href = `/projects/${projectId}?note=${node.id}`;
    }
  };

  return (
    <div className="h-full">
      <div className="h-full overflow-hidden">
        <ReactFlow
          edges={edges}
          fitView
          nodes={nodes}
          nodesDraggable={false}
          onNodeClick={handleNodeClick}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.1} color="var(--line-strong)" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
