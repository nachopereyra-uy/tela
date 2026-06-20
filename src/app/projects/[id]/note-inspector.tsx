"use client";

import {
  type MouseEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { LAYERS, markdownToHtml, NOTE_LAYERS, NOTE_STATUSES } from "@/core";
import type { ShellNote } from "./project-shell";
import {
  createNoteFromWikilinkAction,
  deleteNoteAction,
  type NoteActionState,
  updateNoteAction,
} from "./actions";

export type InspectorNote = {
  id: string;
  title: string;
  content: string;
  layer: string;
  status: string;
  tags: string[];
};

type NoteInspectorProps = {
  projectId: string;
  note: ShellNote | null;
  wikilinkTargets: Array<{ id: string; title: string }>;
  outgoingLinks: Array<{ title: string; noteId: string | null }>;
  backlinks: Array<{ id: string; title: string }>;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (noteId: string, changes: Partial<ShellNote>) => void;
  onDeleted: (noteId: string) => void;
  onNoteNavigate: (noteId: string) => void;
  deleteRef: React.MutableRefObject<(() => void) | null>;
};

type Tab = "info" | "contenido" | "links";

const initialState: NoteActionState = {};

const statusLabels: Record<string, string> = {
  todo: "Por hacer",
  doing: "En curso",
  done: "Hecho",
  idea: "Idea",
  none: "Sin estado",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "var(--todo)",
  doing: "var(--doing)",
  done: "var(--done)",
  idea: "var(--idea)",
  none: "var(--ink-faint)",
};

const LAYER_COLORS: Record<string, string> = {
  marketing: "var(--l-marketing)",
  ventas: "var(--l-ventas)",
  cierre: "var(--l-cierre)",
  onboarding: "var(--l-onboarding)",
  entrega: "var(--l-entrega)",
  posventa: "var(--l-posventa)",
};

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function NoteInspector({
  backlinks,
  outgoingLinks,
  projectId,
  note,
  wikilinkTargets,
  isOpen,
  onClose,
  onUpdate,
  onDeleted,
  onNoteNavigate,
  deleteRef,
}: NoteInspectorProps) {
  const router = useRouter();
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<Tab>("info");
  const [content, setContent] = useState(note?.content ?? "");
  const [missingWikilink, setMissingWikilink] = useState<string | null>(null);
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateNoteAction,
    initialState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteNoteAction,
    initialState,
  );

  useEffect(() => {
    setContent(note?.content ?? "");
    setMissingWikilink(null);
  }, [note?.content, note?.id]);

  useEffect(() => {
    deleteRef.current = () => deleteDialogRef.current?.showModal();
    return () => { deleteRef.current = null; };
  }, [deleteRef]);

  // Refresh RSC data after successful save, then close inspector
  const prevUpdatePending = useRef(false);
  useEffect(() => {
    if (prevUpdatePending.current && !updatePending && !updateState.error) {
      router.refresh();
      onClose();
    }
    prevUpdatePending.current = updatePending;
  }, [updatePending, updateState.error, router, onClose]);

  const prevDeletePending = useRef(false);
  useEffect(() => {
    if (prevDeletePending.current && !deletePending && !deleteState.error && note) {
      onDeleted(note.id);
    }
    prevDeletePending.current = deletePending;
  }, [deletePending, deleteState.error, note, onDeleted]);

  function handlePreviewClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const link = target.closest("[data-wikilink]");
    if (!(link instanceof HTMLElement)) return;
    event.preventDefault();
    const title = link.dataset.wikilink;
    if (!title) return;
    const existingNote = wikilinkTargets.find(
      (t) => normalizeTitle(t.title) === normalizeTitle(title),
    );
    if (existingNote) {
      onNoteNavigate(existingNote.id);
      return;
    }
    setMissingWikilink(title);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "info", label: "Info" },
    { id: "contenido", label: "Contenido" },
    {
      id: "links",
      label: `Links${outgoingLinks.length + backlinks.length > 0 ? ` (${outgoingLinks.length + backlinks.length})` : ""}`,
    },
  ];

  return (
    <>
      <aside
        className={`absolute right-0 top-0 bottom-0 z-40 flex flex-col border-l border-line bg-paper overflow-hidden transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: 360, boxShadow: isOpen ? "var(--shadow-lift)" : "none" }}
        aria-label="Inspector de nota"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <h2 className="text-sm font-semibold text-ink truncate min-w-0">
            {note?.title || "Inspector"}
          </h2>
          <div className="flex shrink-0 items-center gap-1.5">
            {note && (
              <button
                className="h-7 rounded-btn border border-red-200 px-2.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                onClick={() => deleteDialogRef.current?.showModal()}
                type="button"
              >
                Eliminar
              </button>
            )}
            <button
              className="h-7 w-7 rounded-btn border border-line text-ink-faint transition hover:bg-card hover:text-ink flex items-center justify-center"
              onClick={onClose}
              type="button"
              aria-label="Cerrar inspector"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {!note ? (
          <div className="px-4 py-6">
            <p className="text-sm text-ink-soft">Seleccioná una nota para editarla.</p>
          </div>
        ) : (
          <form action={updateFormAction} className="flex flex-col flex-1 overflow-hidden">
            {/* Always-submitted: projectId, noteId */}
            <input name="projectId" type="hidden" value={projectId} />
            <input name="noteId" type="hidden" value={note.id} />

            {/* Tab bar */}
            <div className="flex shrink-0 border-b border-line">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 text-xs font-semibold transition ${
                    tab === t.id
                      ? "border-b-2 border-blue text-blue"
                      : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content — all sections always in DOM so their inputs are always submitted */}
            <div className="flex-1 overflow-hidden relative">

              {/* ── Info tab ── */}
              <div className={`absolute inset-0 overflow-y-auto ${tab === "info" ? "" : "hidden"}`}>
                <div className="grid gap-3 px-4 py-4">
                  {/* Title */}
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint" htmlFor="insp-title">
                      Título
                    </label>
                    <input
                      className="h-9 rounded-btn border border-line bg-paper px-3 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
                      defaultValue={note.title}
                      key={note.id + "-title"}
                      id="insp-title"
                      maxLength={200}
                      name="title"
                      required
                      onChange={(e) => onUpdate(note.id, { title: e.target.value })}
                    />
                  </div>

                  {/* Layer — these submit buttons must come BEFORE the layer hidden fallback */}
                  <div className="grid gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Capa</p>
                    <div className="flex flex-wrap gap-1">
                      {NOTE_LAYERS.map((layer) => {
                        const layerDef = LAYERS.find((l) => l.id === layer);
                        const label = layerDef?.name ?? "Sin capa";
                        const color = LAYER_COLORS[layer] ?? "var(--ink-faint)";
                        const active = note.layer === layer;
                        return (
                          <button
                            key={layer}
                            type="submit"
                            name="layer"
                            value={layer}
                            onClick={() => onUpdate(note.id, { layer: layer as ShellNote["layer"] })}
                            className={`flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium transition ${
                              active
                                ? "bg-blue-soft text-blue ring-1 ring-blue/30"
                                : "bg-paper-2 text-ink-soft hover:bg-card"
                            }`}
                          >
                            {layer !== "none" && (
                              <span
                                className="h-1.5 w-1.5 rounded-full shrink-0"
                                style={{ background: color }}
                                aria-hidden="true"
                              />
                            )}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status — same pattern, submit buttons before hidden fallback */}
                  <div className="grid gap-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Estado</p>
                    <div className="flex flex-wrap gap-1">
                      {NOTE_STATUSES.map((status) => {
                        const active = note.status === status;
                        const color = STATUS_COLORS[status];
                        return (
                          <button
                            key={status}
                            type="submit"
                            name="status"
                            value={status}
                            onClick={() => onUpdate(note.id, { status: status as ShellNote["status"] })}
                            className={`flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium transition ${
                              active
                                ? "bg-blue-soft text-blue ring-1 ring-blue/30"
                                : "bg-paper-2 text-ink-soft hover:bg-card"
                            }`}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ background: active ? color : "var(--ink-faint)" }}
                              aria-hidden="true"
                            />
                            {statusLabels[status]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint" htmlFor="insp-tags">
                      Etiquetas
                    </label>
                    <input
                      className="h-9 rounded-btn border border-line bg-paper px-3 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
                      defaultValue={note.tags.join(", ")}
                      key={note.id + "-tags"}
                      id="insp-tags"
                      name="tags"
                      placeholder="etiqueta1, etiqueta2"
                      onChange={(e) => {
                        const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                        onUpdate(note.id, { tags });
                      }}
                    />
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {note.tags.map((tag) => (
                          <span key={tag} className="rounded-pill bg-blue-soft px-2 py-0.5 text-xs font-semibold text-blue">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Contenido tab ── */}
              <div className={`absolute inset-0 flex flex-col ${tab === "contenido" ? "" : "hidden"}`}>
                <div className="flex flex-col" style={{ height: "55%" }}>
                  <p className="shrink-0 px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Markdown
                  </p>
                  <textarea
                    className="flex-1 resize-none bg-[#FCFBF8] px-4 py-2 font-mono text-sm text-ink outline-none border-b border-line"
                    defaultValue={note.content}
                    key={note.id + "-content"}
                    name="content"
                    placeholder="Escribe aquí… usa [[Título]] para enlazar notas"
                    onChange={(e) => {
                      setContent(e.target.value);
                      onUpdate(note.id, { content: e.target.value });
                    }}
                  />
                </div>
                <div className="flex flex-col" style={{ height: "45%" }}>
                  <p className="shrink-0 px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Vista previa
                  </p>
                  <div
                    className="flex-1 overflow-y-auto bg-[#FCFBF8] px-4 py-2 text-sm leading-6 text-ink [&_[data-wikilink]]:text-blue [&_[data-wikilink]]:underline [&_[data-wikilink]]:decoration-blue/30 [&_a]:font-medium [&_a]:text-blue [&_code]:rounded [&_code]:bg-card [&_code]:px-1 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                    onClick={handlePreviewClick}
                  />
                </div>
                {missingWikilink && (
                  <form action={createNoteFromWikilinkAction} className="shrink-0 border-t border-line bg-blue-soft px-4 py-3">
                    <input name="projectId" type="hidden" value={projectId} />
                    <input name="title" type="hidden" value={missingWikilink} />
                    <p className="text-sm text-ink">
                      No existe <span className="font-medium">{missingWikilink}</span>.
                    </p>
                    <button
                      className="mt-2 h-8 rounded-btn bg-blue px-3 text-sm font-semibold text-white transition hover:bg-blue-deep"
                      type="submit"
                    >
                      Crear nota
                    </button>
                  </form>
                )}
              </div>

              {/* ── Links tab ── */}
              <div className={`absolute inset-0 overflow-y-auto ${tab === "links" ? "" : "hidden"}`}>
                <div className="grid gap-4 px-4 py-4">
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
                      Enlaza a ({outgoingLinks.length})
                    </h3>
                    {outgoingLinks.length === 0 ? (
                      <p className="text-xs text-ink-faint">Sin enlaces salientes.</p>
                    ) : (
                      <ul className="grid gap-1">
                        {outgoingLinks.map((link) => (
                          <li className="text-sm" key={link.title}>
                            {link.noteId ? (
                              <button
                                type="button"
                                className="font-medium text-blue hover:text-blue-deep transition text-left"
                                onClick={() => onNoteNavigate(link.noteId!)}
                              >
                                {link.title}
                              </button>
                            ) : (
                              <span className="text-ink-faint">{link.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-2">
                      Le enlazan ({backlinks.length})
                    </h3>
                    {backlinks.length === 0 ? (
                      <p className="text-xs text-ink-faint">Sin backlinks.</p>
                    ) : (
                      <ul className="grid gap-1">
                        {backlinks.map((link) => (
                          <li className="text-sm" key={link.id}>
                            <button
                              type="button"
                              className="font-medium text-blue hover:text-blue-deep transition text-left"
                              onClick={() => onNoteNavigate(link.id)}
                            >
                              {link.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fallback hidden inputs for layer/status (come AFTER the submit buttons above) */}
            <input name="layer" type="hidden" value={note.layer} />
            <input name="status" type="hidden" value={note.status} />

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              {updateState.error && (
                <p className="text-xs text-red-600 min-w-0 truncate">{updateState.error}</p>
              )}
              <button
                className="ml-auto h-8 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep disabled:opacity-50 shrink-0"
                disabled={updatePending}
                type="submit"
              >
                {updatePending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </aside>

      {/* Delete confirmation dialog */}
      {note && (
        <dialog
          className="w-[min(92vw,420px)] rounded-dialog border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/20 backdrop:backdrop-blur-sm"
          ref={deleteDialogRef}
        >
          <form action={deleteFormAction} className="grid gap-5 p-6">
            <input name="projectId" type="hidden" value={projectId} />
            <input name="noteId" type="hidden" value={note.id} />
            <div>
              <h2 className="text-lg font-semibold text-ink">Eliminar nota</h2>
              <p className="mt-1 text-sm text-ink-soft">
                También se borrarán sus conexiones. Esta acción no se puede deshacer.
              </p>
            </div>
            <p className="rounded-btn border border-line bg-paper px-3 py-2 text-sm font-medium text-ink">
              {note.title}
            </p>
            {deleteState.error && (
              <p className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteState.error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="h-10 rounded-btn border border-line px-4 text-sm font-medium text-ink-soft transition hover:bg-paper"
                disabled={deletePending}
                formMethod="dialog"
                type="submit"
              >
                Cancelar
              </button>
              <button
                className="h-10 rounded-btn px-4 text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ backgroundColor: "#B4452E" }}
                disabled={deletePending}
                type="submit"
              >
                {deletePending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </form>
        </dialog>
      )}
    </>
  );
}
