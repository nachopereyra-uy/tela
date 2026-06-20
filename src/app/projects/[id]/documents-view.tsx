"use client";

import { type MouseEvent, useActionState, useCallback, useEffect, useRef, useState } from "react";
import { backlinks, findByTitle, markdownToHtml, outgoingLinks, type NoteLayer, type NoteStatus } from "@/core";
import type { ShellNote } from "./project-shell";
import {
  createNoteAction,
  createNoteFromWikilinkAction,
  type NoteActionState,
  updateNoteAction,
} from "./actions";

type DocsNote = ShellNote;

type DocumentsViewProps = {
  notes: DocsNote[];
  projectId: string;
  selectedNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onNoteUpdate: (noteId: string, changes: Partial<ShellNote>) => void;
  wikilinkTargets: Array<{ id: string; title: string }>;
};

const STATUS_COLORS: Record<string, string> = {
  todo: "var(--todo)",
  doing: "var(--doing)",
  done: "var(--done)",
  idea: "var(--idea)",
  none: "var(--ink-faint)",
};

const initialUpdateState: NoteActionState = {};

function normalizeTitle(t: string) {
  return t.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function toCoreNote(note: DocsNote) {
  return {
    ...note,
    status: note.status as NoteStatus,
    layer: note.layer as NoteLayer,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── Toolbar button ─────────────────────────────────────────────────────────────

function FmtBtn({
  label,
  title,
  onInsert,
}: {
  label: string;
  title: string;
  onInsert: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onInsert}
      className="flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs font-semibold text-ink-soft hover:bg-card hover:text-ink transition"
    >
      {label}
    </button>
  );
}

export function DocumentsView({
  notes,
  projectId,
  selectedNoteId,
  onNoteSelect,
  onNoteUpdate,
  wikilinkTargets,
}: DocumentsViewProps) {
  const [listSearch, setListSearch] = useState("");
  const [missingWikilink, setMissingWikilink] = useState<string | null>(null);
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateNoteAction,
    initialUpdateState,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;
  const [content, setContent] = useState(selectedNote?.content ?? "");

  useEffect(() => {
    setContent(selectedNote?.content ?? "");
    setMissingWikilink(null);
  }, [selectedNote?.id, selectedNote?.content]);

  // Compute links client-side
  const coreNotes = notes.map(toCoreNote);
  const selectedCore = selectedNote ? toCoreNote(selectedNote) : null;
  const computedOutgoing = selectedCore
    ? outgoingLinks(selectedCore.content).map((title) => ({
        title,
        noteId: findByTitle(coreNotes, title)?.id ?? null,
      }))
    : [];
  const computedBacklinks = selectedCore
    ? backlinks(selectedCore, coreNotes).map((n) => ({ id: n.id, title: n.title }))
    : [];

  const filteredNotes = listSearch.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(listSearch.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(listSearch.toLowerCase())),
      )
    : notes;

  // ── Format insertion ──────────────────────────────────────────────────────────

  const insertFormat = useCallback(
    (before: string, after: string) => {
      const ta = textareaRef.current;
      if (!ta || !selectedNote) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = ta.value.slice(start, end);
      const replacement = before + selected + after;
      const newValue = ta.value.slice(0, start) + replacement + ta.value.slice(end);
      ta.value = newValue;
      // Restore cursor after inserted text
      const newCursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(newCursor - after.length, newCursor - after.length);
      ta.focus();
      setContent(newValue);
      onNoteUpdate(selectedNote.id, { content: newValue });
    },
    [selectedNote, onNoteUpdate],
  );

  // ── Wikilink click in preview ─────────────────────────────────────────────────

  function handlePreviewClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const link = target.closest("[data-wikilink]");
    if (!(link instanceof HTMLElement)) return;
    event.preventDefault();
    const title = link.dataset.wikilink;
    if (!title) return;
    const existing = wikilinkTargets.find(
      (t) => normalizeTitle(t.title) === normalizeTitle(title),
    );
    if (existing) {
      onNoteSelect(existing.id);
      return;
    }
    setMissingWikilink(title);
  }

  // ── Export current note as .md ────────────────────────────────────────────────

  function handleExportMd() {
    if (!selectedNote) return;
    const blob = new Blob([`# ${selectedNote.title}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedNote.title.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "nota"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel: note list */}
      <div className="flex w-56 shrink-0 flex-col border-r border-line bg-paper-2 overflow-hidden">
        <div className="px-3 pt-3 pb-2">
          <input
            type="search"
            placeholder="Buscar…"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            className="h-8 w-full rounded-btn border border-line bg-paper px-2.5 text-sm placeholder:text-ink-faint focus:border-blue focus:bg-card focus:outline-none focus:ring-1 focus:ring-blue-soft transition"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {filteredNotes.length === 0 ? (
            <p className="px-2 py-3 text-xs text-ink-faint">Sin resultados.</p>
          ) : (
            <ul className="grid gap-0.5">
              {filteredNotes.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => onNoteSelect(note.id)}
                    className={`flex w-full items-center gap-2 rounded-btn px-2.5 py-2 text-left text-sm transition ${
                      note.id === selectedNoteId
                        ? "bg-card text-ink shadow-card"
                        : "text-ink-soft hover:bg-card/60 hover:text-ink"
                    }`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: STATUS_COLORS[note.status] ?? "var(--ink-faint)" }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">{note.title || "Sin título"}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-line px-2 pb-3 pt-2">
          <form action={createNoteAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <button
              type="submit"
              className="w-full h-8 rounded-btn border border-line bg-paper text-sm text-ink-soft hover:bg-card hover:text-ink transition"
            >
              + Nueva nota
            </button>
          </form>
        </div>
      </div>

      {/* Right panel: editor */}
      {selectedNote ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <form action={updateFormAction} className="flex flex-1 flex-col overflow-hidden">
            <input name="projectId" type="hidden" value={projectId} />
            <input name="noteId" type="hidden" value={selectedNote.id} />
            <input name="layer" type="hidden" value={selectedNote.layer} />
            <input name="status" type="hidden" value={selectedNote.status} />
            <input name="tags" type="hidden" value={selectedNote.tags.join(", ")} />

            {/* Title */}
            <div className="border-b border-line px-6 py-3">
              <input
                key={selectedNote.id + "-title"}
                name="title"
                defaultValue={selectedNote.title}
                placeholder="Título"
                required
                maxLength={200}
                className="w-full bg-transparent text-2xl font-bold text-ink outline-none placeholder:text-ink-faint"
                onChange={(e) => onNoteUpdate(selectedNote.id, { title: e.target.value })}
              />
              {selectedNote.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {selectedNote.tags.map((tag) => (
                    <span key={tag} className="rounded-pill bg-blue-soft px-2 py-0.5 text-xs font-semibold text-blue">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Editor + Preview split */}
            <div className="flex flex-1 overflow-hidden">
              {/* Textarea with toolbar */}
              <div className="flex flex-1 flex-col border-r border-line overflow-hidden">
                {/* Formatting toolbar */}
                <div className="shrink-0 flex items-center gap-0.5 border-b border-line px-2 py-1 bg-paper-2">
                  <FmtBtn label="B" title="Negrita (Ctrl+B)" onInsert={() => insertFormat("**", "**")} />
                  <FmtBtn label="I" title="Cursiva (Ctrl+I)" onInsert={() => insertFormat("_", "_")} />
                  <div className="h-4 w-px bg-line mx-0.5" />
                  <FmtBtn label="H1" title="Encabezado 1" onInsert={() => insertFormat("# ", "")} />
                  <FmtBtn label="H2" title="Encabezado 2" onInsert={() => insertFormat("## ", "")} />
                  <FmtBtn label="H3" title="Encabezado 3" onInsert={() => insertFormat("### ", "")} />
                  <div className="h-4 w-px bg-line mx-0.5" />
                  <FmtBtn label="—" title="Lista con viñetas" onInsert={() => insertFormat("- ", "")} />
                  <FmtBtn label="1." title="Lista numerada" onInsert={() => insertFormat("1. ", "")} />
                  <div className="h-4 w-px bg-line mx-0.5" />
                  <FmtBtn label="`·`" title="Código en línea" onInsert={() => insertFormat("`", "`")} />
                  <FmtBtn label="```" title="Bloque de código" onInsert={() => insertFormat("```\n", "\n```")} />
                  <div className="h-4 w-px bg-line mx-0.5" />
                  <FmtBtn label="[[·]]" title="Enlace a nota" onInsert={() => insertFormat("[[", "]]")} />
                </div>
                <p className="shrink-0 px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Markdown
                </p>
                <textarea
                  ref={textareaRef}
                  key={selectedNote.id + "-content"}
                  name="content"
                  defaultValue={selectedNote.content}
                  placeholder="Escribe aquí… usa [[Título]] para enlazar notas"
                  className="flex-1 resize-none bg-[#FCFBF8] px-4 py-2 font-mono text-sm text-ink outline-none"
                  onChange={(e) => {
                    setContent(e.target.value);
                    onNoteUpdate(selectedNote.id, { content: e.target.value });
                  }}
                />
              </div>

              {/* Preview */}
              <div className="flex w-[45%] shrink-0 flex-col overflow-hidden">
                <p className="shrink-0 px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Vista previa
                </p>
                <div
                  className="flex-1 overflow-y-auto bg-[#FCFBF8] px-4 py-2 text-sm leading-6 text-ink [&_[data-wikilink]]:text-blue [&_[data-wikilink]]:underline [&_[data-wikilink]]:decoration-blue/30 [&_a]:font-medium [&_a]:text-blue [&_code]:rounded [&_code]:bg-card [&_code]:px-1 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                  onClick={handlePreviewClick}
                />
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
            </div>

            {/* Footer: save + links + export */}
            <div className="shrink-0 border-t border-line px-4 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs text-ink-faint min-w-0 overflow-hidden">
                {computedOutgoing.length > 0 && (
                  <span className="shrink-0">
                    Enlaza:{" "}
                    {computedOutgoing.map((l, i) => (
                      <span key={l.title}>
                        {i > 0 && ", "}
                        {l.noteId ? (
                          <button
                            type="button"
                            className="text-blue hover:text-blue-deep transition"
                            onClick={() => onNoteSelect(l.noteId!)}
                          >
                            {l.title}
                          </button>
                        ) : (
                          <span className="text-ink-faint">{l.title}</span>
                        )}
                      </span>
                    ))}
                  </span>
                )}
                {computedBacklinks.length > 0 && (
                  <span className="shrink-0">
                    ←{" "}
                    {computedBacklinks.map((l, i) => (
                      <span key={l.id}>
                        {i > 0 && ", "}
                        <button
                          type="button"
                          className="text-blue hover:text-blue-deep transition"
                          onClick={() => onNoteSelect(l.id)}
                        >
                          {l.title}
                        </button>
                      </span>
                    ))}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {updateState.error && (
                  <p className="text-xs text-red-600">{updateState.error}</p>
                )}
                <button
                  type="button"
                  onClick={handleExportMd}
                  className="h-8 rounded-btn border border-line px-3 text-xs font-medium text-ink-soft hover:bg-card hover:text-ink transition"
                  title="Descargar como Markdown"
                >
                  ↓ .md
                </button>
                <button
                  type="submit"
                  disabled={updatePending}
                  className="h-8 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep disabled:opacity-50"
                >
                  {updatePending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-ink-soft">Ningún documento abierto</p>
            <p className="mt-1 text-sm text-ink-faint">Seleccioná una nota de la lista</p>
          </div>
        </div>
      )}
    </div>
  );
}
