"use client";

import {
  type MouseEvent,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { LAYERS, markdownToHtml, NOTE_LAYERS, NOTE_STATUSES } from "@/core";
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
  note: InspectorNote | null;
  wikilinkTargets: Array<{
    id: string;
    title: string;
  }>;
  outgoingLinks: Array<{
    title: string;
    noteId: string | null;
  }>;
  backlinks: Array<{
    id: string;
    title: string;
  }>;
};

const initialState: NoteActionState = {};

const statusLabels: Record<string, string> = {
  todo: "Por hacer",
  doing: "En curso",
  done: "Hecho",
  idea: "Idea",
  none: "Sin estado",
};

const layerLabels = new Map<string, string>([
  ...LAYERS.map((layer) => [layer.id, layer.name] as const),
  ["none", "Sin capa"],
]);

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function NoteInspector({
  backlinks,
  outgoingLinks,
  projectId,
  note,
  wikilinkTargets,
}: NoteInspectorProps) {
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
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

  function handlePreviewClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const link = target.closest("[data-wikilink]");

    if (!(link instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();
    const title = link.dataset.wikilink;

    if (!title) {
      return;
    }

    const existingNote = wikilinkTargets.find(
      (targetNote) => normalizeTitle(targetNote.title) === normalizeTitle(title),
    );

    if (existingNote) {
      window.location.href = `/projects/${projectId}?note=${existingNote.id}`;
      return;
    }

    setMissingWikilink(title);
  }

  if (!note) {
    return (
      <aside className="border-l border-line bg-paper overflow-y-auto">
        <div className="sticky top-0 bg-paper/90 backdrop-blur-sm border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold text-ink">Inspector</h2>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-ink-soft">
            Crea o selecciona una nota para editarla.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="border-l border-line bg-paper overflow-y-auto">
      <div className="sticky top-0 bg-paper/90 backdrop-blur-sm border-b border-line px-6 py-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Inspector</h2>
        <button
          className="h-8 rounded-btn border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
          onClick={() => deleteDialogRef.current?.showModal()}
          type="button"
        >
          Eliminar
        </button>
      </div>

      <form action={updateFormAction} className="grid gap-5 px-6 py-6">
        <input name="projectId" type="hidden" value={projectId} />
        <input name="noteId" type="hidden" value={note.id} />

        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="title">
            Título
          </label>
          <input
            className="h-10 rounded-btn border border-line bg-paper px-3 text-base text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
            defaultValue={note.title}
            id="title"
            maxLength={200}
            name="title"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="layer">
              Capa
            </label>
            <select
              className="h-10 rounded-btn border border-line bg-paper px-3 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
              defaultValue={note.layer}
              id="layer"
              name="layer"
            >
              {NOTE_LAYERS.map((layer) => (
                <option key={layer} value={layer}>
                  {layerLabels.get(layer)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="status">
              Estado
            </label>
            <select
              className="h-10 rounded-btn border border-line bg-paper px-3 text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
              defaultValue={note.status}
              id="status"
              name="status"
            >
              {NOTE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="content">
            Contenido
          </label>
          <textarea
            className="min-h-56 rounded-btn border border-line bg-[#FCFBF8] px-3 py-2 font-mono text-sm text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
            defaultValue={note.content}
            id="content"
            name="content"
            onChange={(event) => setContent(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <h3 className="text-sm font-medium text-ink">Vista previa</h3>
          <div
            className="rounded-card border border-line bg-[#FCFBF8] px-4 py-3 text-sm leading-6 text-ink [&_[data-wikilink]]:text-blue [&_[data-wikilink]]:underline [&_[data-wikilink]]:decoration-blue/30 [&_a]:font-medium [&_a]:text-blue [&_code]:rounded [&_code]:bg-card [&_code]:px-1 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-auto [&_pre]:rounded-card [&_pre]:bg-card [&_pre]:p-3 [&_strong]:font-semibold min-h-32"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            onClick={handlePreviewClick}
          />
          {missingWikilink ? (
            <form
              action={createNoteFromWikilinkAction}
              className="rounded-card border border-blue-soft bg-blue-soft px-4 py-3"
            >
              <input name="projectId" type="hidden" value={projectId} />
              <input name="title" type="hidden" value={missingWikilink} />
              <p className="text-sm text-ink">
                No existe una nota llamada{" "}
                <span className="font-medium">{missingWikilink}</span>.
              </p>
              <button
                className="mt-2 h-9 rounded-btn bg-blue px-3 text-sm font-semibold text-white transition hover:bg-blue-deep"
                type="submit"
              >
                Crear nota
              </button>
            </form>
          ) : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="tags">
            Etiquetas
          </label>
          <input
            className="h-10 rounded-btn border border-line bg-paper px-3 text-base text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
            defaultValue={note.tags.join(", ")}
            id="tags"
            name="tags"
          />
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-pill bg-blue-soft px-2.5 py-0.5 text-xs font-semibold text-blue"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <section className="rounded-card border border-line bg-paper-2 p-4 grid gap-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">
              Enlaces salientes
            </h3>
            {outgoingLinks.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">Sin enlaces.</p>
            ) : (
              <ul className="mt-2 grid gap-1">
                {outgoingLinks.map((link) => (
                  <li className="text-sm" key={link.title}>
                    {link.noteId ? (
                      <a
                        className="font-medium text-blue hover:text-blue-deep transition"
                        href={`/projects/${projectId}?note=${link.noteId}`}
                      >
                        {link.title}
                      </a>
                    ) : (
                      <span className="text-ink-faint">{link.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Backlinks</h3>
            {backlinks.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">Sin backlinks.</p>
            ) : (
              <ul className="mt-2 grid gap-1">
                {backlinks.map((link) => (
                  <li className="text-sm" key={link.id}>
                    <a
                      className="font-medium text-blue hover:text-blue-deep transition"
                      href={`/projects/${projectId}?note=${link.id}`}
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        {updateState.error ? (
          <p className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {updateState.error}
          </p>
        ) : null}
        <button
          className="h-10 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-50"
          disabled={updatePending}
          type="submit"
        >
          {updatePending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

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
              También se borrarán sus conexiones.
            </p>
          </div>
          <p className="rounded-btn border border-line bg-paper px-3 py-2 text-sm font-medium text-ink">
            {note.title}
          </p>
          {deleteState.error ? (
            <p className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteState.error}
            </p>
          ) : null}
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
              className="h-10 rounded-btn px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#B4452E' }}
              disabled={deletePending}
              type="submit"
            >
              {deletePending ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </form>
      </dialog>
    </aside>
  );
}
