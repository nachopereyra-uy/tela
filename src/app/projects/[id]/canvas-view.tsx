"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Connection,
  type Edge as FlowEdge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  createCanvasEdgeAction,
  deleteCanvasEdgeAction,
  moveNotePositionAction,
} from "./actions";
import type { ShellEdge } from "./project-shell";

type CanvasNote = {
  id: string;
  title: string;
  x: number;
  y: number;
  status: string;
  layer: string;
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
  onNoteSelect?: (id: string) => void;
  onEdgeCreate?: (edge: ShellEdge) => void;
  onEdgeDelete?: (edgeId: string) => void;
};

const STATUS_COLORS: Record<string, string> = {
  todo: 'var(--todo)',
  doing: 'var(--doing)',
  done: 'var(--done)',
  idea: 'var(--idea)',
  none: 'var(--ink-faint)',
};

const LAYER_COLORS: Record<string, string> = {
  marketing: 'var(--l-marketing)',
  ventas: 'var(--l-ventas)',
  cierre: 'var(--l-cierre)',
  onboarding: 'var(--l-onboarding)',
  entrega: 'var(--l-entrega)',
  posventa: 'var(--l-posventa)',
};

const LAYER_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  ventas: 'Ventas',
  cierre: 'Cierre',
  onboarding: 'Onboarding',
  entrega: 'Entrega',
  posventa: 'Posventa',
};

type NoteNodeData = {
  label: string;
  status: string;
  layer: string;
};

function NoteNode({ data, selected }: NodeProps & { data: NoteNodeData }) {
  return (
    <div style={{
      width: 218,
      background: 'var(--card)',
      borderRadius: 12,
      border: `1px solid ${selected ? 'var(--blue)' : 'var(--line)'}`,
      boxShadow: selected
        ? '0 0 0 3px var(--blue-soft), var(--shadow)'
        : 'var(--shadow)',
      overflow: 'hidden',
      transition: 'box-shadow 0.12s, border-color 0.12s',
    }}>
      {/* status strip */}
      <div style={{ height: 4, background: STATUS_COLORS[data.status] ?? 'var(--ink-faint)' }} />
      <div style={{ padding: '8px 12px 10px' }}>
        {/* layer pill */}
        {data.layer !== 'none' && LAYER_LABELS[data.layer] && (
          <div style={{ marginBottom: 5 }}>
            <span style={{
              fontSize: 9.5,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: LAYER_COLORS[data.layer] ?? 'var(--ink-faint)',
              background: 'var(--paper-2)',
              borderRadius: 20,
              padding: '2px 7px',
            }}>
              {LAYER_LABELS[data.layer]}
            </span>
          </div>
        )}
        {/* title */}
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35, margin: 0 }}>
          {data.label}
        </p>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export function CanvasView({ edges, notes, presentMode, projectId, onNoteSelect, onEdgeCreate, onEdgeDelete }: CanvasViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [localEdges, setLocalEdges] = useState<FlowEdge[]>(
    edges.map((edge) => ({
      id: edge.id,
      source: edge.fromNoteId,
      target: edge.toNoteId,
    })),
  );
  const [, startTransition] = useTransition();

  const nodeTypes = useMemo(() => ({ note: NoteNode }), []);

  const nodes: Node[] = useMemo(
    () =>
      localNotes.map((note, index) => ({
        id: note.id,
        type: 'note',
        data: { label: note.title, status: note.status, layer: note.layer },
        position: {
          x: note.x || (index % 4) * 240,
          y: note.y || Math.floor(index / 4) * 160,
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

      onEdgeCreate?.({
        id: edge.id,
        fromNoteId: edge.fromNoteId,
        toNoteId: edge.toNoteId,
        label: null,
      });
    });
  }

  function handleEdgesDelete(deletedEdges: FlowEdge[]) {
    setLocalEdges((current) =>
      current.filter(
        (edge) => !deletedEdges.some((deletedEdge) => deletedEdge.id === edge.id),
      ),
    );

    for (const edge of deletedEdges) {
      onEdgeDelete?.(edge.id);
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
    <div className="h-full">
      <div className="h-full overflow-hidden">
        <ReactFlow
          edges={localEdges}
          fitView
          nodeTypes={nodeTypes}
          nodes={nodes}
          onConnect={handleConnect}
          onEdgesDelete={handleEdgesDelete}
          onNodeDragStop={handleNodeDragStop}
          onNodeClick={onNoteSelect ? (_event, node) => onNoteSelect(node.id) : undefined}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.1} color="var(--line-strong)" />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>
    </div>
  );
}
