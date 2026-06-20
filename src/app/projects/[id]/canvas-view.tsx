"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  SelectionMode,
  useReactFlow,
  useViewport,
  type Connection,
  type Edge as FlowEdge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import {
  createCanvasEdgeAction,
  createNoteOnCanvasAction,
  deleteCanvasEdgeAction,
  moveNotePositionAction,
} from "./actions";
import type { ShellEdge, ShellNote } from "./project-shell";

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
  projectId: string;
  onNoteSelect?: (id: string) => void;
  onEdgeCreate?: (edge: ShellEdge) => void;
  onEdgeDelete?: (edgeId: string) => void;
};

type CanvasMode = "select" | "pan";

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
      <div style={{ height: 4, background: STATUS_COLORS[data.status] ?? 'var(--ink-faint)' }} />
      <div style={{ padding: '8px 12px 10px' }}>
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
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35, margin: 0 }}>
          {data.label}
        </p>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

// ── Toolbar rendered inside ReactFlow context ──────────────────────────────────

function CanvasToolbar({
  mode,
  onModeChange,
}: {
  mode: CanvasMode;
  onModeChange: (m: CanvasMode) => void;
}) {
  const { zoom } = useViewport();
  const { fitView } = useReactFlow();

  return (
    <Panel position="top-left">
      <div
        className="flex items-center gap-0.5 rounded-card border border-line bg-card/95 p-1 shadow-card backdrop-blur-sm"
        style={{ gap: 2 }}
      >
        {/* Select mode */}
        <button
          type="button"
          title="Seleccionar (V)"
          onClick={() => onModeChange("select")}
          className={`flex h-7 w-7 items-center justify-center rounded transition ${
            mode === "select" ? "bg-blue text-white" : "text-ink-soft hover:bg-paper-2 hover:text-ink"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l4 10 1.5-4 4-1.5L2 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill={mode === "select" ? "white" : "none"} />
          </svg>
        </button>

        {/* Pan mode */}
        <button
          type="button"
          title="Panorámica (H)"
          onClick={() => onModeChange("pan")}
          className={`flex h-7 w-7 items-center justify-center rounded transition ${
            mode === "pan" ? "bg-blue text-white" : "text-ink-soft hover:bg-paper-2 hover:text-ink"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v2M3.5 2.5l1.4 1.4M2 6H1m1.5 3.5 1.4-1.4M7 11v2m3.5-1.5-1.4-1.4M12 6h1m-2.5-3.5L9.1 3.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M5 6c0-1.1.9-2 2-2s2 .9 2 2v3.5c0 .3-.2.5-.5.5h-3c-.3 0-.5-.2-.5-.5V6z" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>

        <div className="h-5 w-px bg-line mx-0.5" />

        {/* Zoom % */}
        <span className="min-w-[3rem] text-center font-mono text-xs text-ink-soft tabular-nums">
          {Math.round(zoom * 100)}%
        </span>

        {/* Fit view */}
        <button
          type="button"
          title="Ajustar vista"
          onClick={() => fitView({ duration: 200 })}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-soft hover:bg-paper-2 hover:text-ink transition"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 4V1h3M10 1h3v3M13 10v3h-3M4 13H1v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </Panel>
  );
}

// ── Hint rendered inside ReactFlow context ─────────────────────────────────────

function CanvasHint() {
  return (
    <Panel position="bottom-center">
      <p className="text-[11px] text-ink-faint bg-card/80 rounded-pill px-3 py-1 backdrop-blur-sm border border-line shadow-card">
        Doble clic para crear · Arrastrá para conectar
      </p>
    </Panel>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CanvasView({ edges, notes, projectId, onNoteSelect, onEdgeCreate, onEdgeDelete }: CanvasViewProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [localEdges, setLocalEdges] = useState<FlowEdge[]>(
    edges.map((edge) => ({
      id: edge.id,
      source: edge.fromNoteId,
      target: edge.toNoteId,
    })),
  );
  const [mode, setMode] = useState<CanvasMode>("select");
  const [, startTransition] = useTransition();
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

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
        await moveNotePositionAction({ projectId, noteId: node.id, x, y });
      } catch {
        setLocalNotes(notes);
      }
    });
  };

  function handleConnect(connection: Connection) {
    if (!connection.source || !connection.target) return;

    startTransition(async () => {
      const edge = await createCanvasEdgeAction({
        projectId,
        fromNoteId: connection.source!,
        toNoteId: connection.target!,
      });

      setLocalEdges((current) => [
        ...current,
        { id: edge.id, source: edge.fromNoteId, target: edge.toNoteId },
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
      current.filter((edge) => !deletedEdges.some((d) => d.id === edge.id)),
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

  function handleDoubleClick(event: React.MouseEvent) {
    const target = event.target as Element;
    // Only create on pane double-click (not on nodes or edges)
    if (target.closest('.react-flow__node') || target.closest('.react-flow__edge')) return;
    const rf = rfInstanceRef.current;
    if (!rf) return;
    const pos = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const x = Math.round(pos.x);
    const y = Math.round(pos.y);

    startTransition(async () => {
      try {
        const note = await createNoteOnCanvasAction({ projectId, x, y });
        const newNote: CanvasNote = {
          id: note.id,
          title: note.title,
          x: note.x ?? x,
          y: note.y ?? y,
          status: note.status,
          layer: note.layer,
        };
        setLocalNotes((current) => [...current, newNote]);
        onNoteSelect?.(note.id);
      } catch {
        // silent: note appears on next RSC refresh
      }
    });
  }

  return (
    <div className="h-full" onDoubleClick={handleDoubleClick}>
      <div className="h-full overflow-hidden">
        <ReactFlow
          edges={localEdges}
          fitView
          nodeTypes={nodeTypes}
          nodes={nodes}
          onConnect={handleConnect}
          onEdgesDelete={handleEdgesDelete}
          onInit={(instance) => { rfInstanceRef.current = instance; }}
          onNodeDragStop={handleNodeDragStop}
          onNodeClick={onNoteSelect ? (_event, node) => onNoteSelect(node.id) : undefined}
          panOnDrag={mode === "pan" ? true : [1, 2]}
          selectionOnDrag={mode === "select"}
          selectionMode={SelectionMode.Partial}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.1} color="var(--line-strong)" />
          <Controls />
          <MiniMap pannable zoomable />
          <CanvasToolbar mode={mode} onModeChange={setMode} />
          <CanvasHint />
        </ReactFlow>
      </div>
    </div>
  );
}
