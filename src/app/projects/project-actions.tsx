"use client";

import { useActionState, useRef } from "react";
import {
  deleteProjectAction,
  renameProjectAction,
  type ProjectActionState,
} from "./actions";

type ProjectActionsProps = {
  projectId: string;
  projectName: string;
};

const initialState: ProjectActionState = {};

export function ProjectActions({
  projectId,
  projectName,
}: ProjectActionsProps) {
  const renameDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const [renameState, renameFormAction, renamePending] = useActionState(
    renameProjectAction,
    initialState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteProjectAction,
    initialState,
  );

  return (
    <div className="flex items-center gap-2">
      <button
        className="h-9 rounded-btn border border-line px-3 text-sm font-medium text-ink-soft transition hover:bg-paper hover:text-ink"
        onClick={() => renameDialogRef.current?.showModal()}
        type="button"
      >
        Renombrar
      </button>
      <button
        className="h-9 rounded-btn border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
        onClick={() => deleteDialogRef.current?.showModal()}
        type="button"
      >
        Eliminar
      </button>

      <dialog
        className="w-[min(92vw,420px)] rounded-dialog border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/20 backdrop:backdrop-blur-sm"
        ref={renameDialogRef}
      >
        <form action={renameFormAction} className="grid gap-5 p-6">
          <input name="projectId" type="hidden" value={projectId} />
          <div>
            <h2 className="text-lg font-semibold text-ink">Renombrar proyecto</h2>
            <p className="mt-1 text-sm text-ink-soft">{projectName}</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="project-rename">
              Nombre
            </label>
            <input
              className="h-10 rounded-btn border border-line bg-paper px-3 text-base text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
              defaultValue={projectName}
              id="project-rename"
              maxLength={120}
              name="name"
              required
            />
          </div>
          {renameState.error ? (
            <p className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {renameState.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              className="h-10 rounded-btn border border-line px-4 text-sm font-medium text-ink-soft transition hover:bg-paper"
              disabled={renamePending}
              formMethod="dialog"
              type="submit"
            >
              Cancelar
            </button>
            <button
              className="h-10 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-50"
              disabled={renamePending}
              type="submit"
            >
              {renamePending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </dialog>

      <dialog
        className="w-[min(92vw,420px)] rounded-dialog border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/20 backdrop:backdrop-blur-sm"
        ref={deleteDialogRef}
      >
        <form action={deleteFormAction} className="grid gap-5 p-6">
          <input name="projectId" type="hidden" value={projectId} />
          <div>
            <h2 className="text-lg font-semibold text-ink">Eliminar proyecto</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Se borrarán sus notas y conexiones. Esta acción no se puede deshacer.
            </p>
          </div>
          <p className="rounded-btn border border-line bg-paper px-3 py-2 text-sm font-medium text-ink">
            {projectName}
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
    </div>
  );
}
