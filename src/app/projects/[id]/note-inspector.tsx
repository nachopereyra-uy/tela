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
      <aside className="border-l border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-950">Inspector</h2>
        <p className="mt-2 text-sm text-slate-600">
          Crea o selecciona una nota para editarla.
        </p>
      </aside>
    );
  }

  return (
    <aside className="border-l border-slate-200 bg-white p-6">
      <form action={updateFormAction} className="grid gap-5">
        <input name="projectId" type="hidden" value={projectId} />
        <input name="noteId" type="hidden" value={note.id} />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Inspector</h2>
            <p className="mt-1 text-sm text-slate-600">Editar nota</p>
          </div>
          <button
            className="h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
            onClick={() => deleteDialogRef.current?.showModal()}
            type="button"
          >
            Eliminar
          </button>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="title">
            Titulo
          </label>
          <input
            className="h-10 rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            defaultValue={note.title}
            id="title"
            maxLength={200}
            name="title"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-800" htmlFor="layer">
              Capa
            </label>
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="status"
            >
              Estado
            </label>
            <select
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
          <label className="text-sm font-medium text-slate-800" htmlFor="content">
            Contenido
          </label>
          <textarea
            className="min-h-56 rounded-md border border-slate-300 px-3 py-2 text-base outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            defaultValue={note.content}
            id="content"
            name="content"
            onChange={(event) => setContent(event.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <h3 className="text-sm font-medium text-slate-800">Vista previa</h3>
          <div
            className="min-h-32 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-800 [&_a]:font-medium [&_a]:text-indigo-700 [&_code]:rounded [&_code]:bg-white [&_code]:px-1 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-white [&_pre]:p-3 [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            onClick={handlePreviewClick}
          />
          {missingWikilink ? (
            <form
              action={createNoteFromWikilinkAction}
              className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2"
            >
              <input name="projectId" type="hidden" value={projectId} />
              <input name="title" type="hidden" value={missingWikilink} />
              <p className="text-sm text-slate-700">
                No existe una nota llamada{" "}
                <span className="font-medium">{missingWikilink}</span>.
              </p>
              <button
                className="mt-2 h-9 rounded-md bg-indigo-700 px-3 text-sm font-semibold text-white transition hover:bg-indigo-800"
                type="submit"
              >
                Crear nota
              </button>
            </form>
          ) : null}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="tags">
            Etiquetas
          </label>
          <input
            className="h-10 rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            defaultValue={note.tags.join(", ")}
            id="tags"
            name="tags"
          />
        </div>
        {updateState.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {updateState.error}
          </p>
        ) : null}
        <button
          className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={updatePending}
          type="submit"
        >
          {updatePending ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <dialog
        className="w-[min(92vw,420px)] rounded-lg border border-slate-200 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/30"
        ref={deleteDialogRef}
      >
        <form action={deleteFormAction} className="grid gap-5 p-5">
          <input name="projectId" type="hidden" value={projectId} />
          <input name="noteId" type="hidden" value={note.id} />
          <div>
            <h2 className="text-lg font-semibold">Eliminar nota</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tambien se borraran sus conexiones.
            </p>
          </div>
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
            {note.title}
          </p>
          {deleteState.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {deleteState.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              disabled={deletePending}
              formMethod="dialog"
              type="submit"
            >
              Cancelar
            </button>
            <button
              className="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
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
