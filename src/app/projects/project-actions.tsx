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
        className="h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        onClick={() => renameDialogRef.current?.showModal()}
        type="button"
      >
        Renombrar
      </button>
      <button
        className="h-9 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
        onClick={() => deleteDialogRef.current?.showModal()}
        type="button"
      >
        Eliminar
      </button>

      <dialog
        className="w-[min(92vw,420px)] rounded-lg border border-slate-200 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/30"
        ref={renameDialogRef}
      >
        <form action={renameFormAction} className="grid gap-5 p-5">
          <input name="projectId" type="hidden" value={projectId} />
          <div>
            <h2 className="text-lg font-semibold">Renombrar proyecto</h2>
            <p className="mt-1 text-sm text-slate-600">{projectName}</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="project-rename">
              Nombre
            </label>
            <input
              className="h-10 rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              defaultValue={projectName}
              id="project-rename"
              maxLength={120}
              name="name"
              required
            />
          </div>
          {renameState.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {renameState.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              disabled={renamePending}
              formMethod="dialog"
              type="submit"
            >
              Cancelar
            </button>
            <button
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={renamePending}
              type="submit"
            >
              {renamePending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </dialog>

      <dialog
        className="w-[min(92vw,420px)] rounded-lg border border-slate-200 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/30"
        ref={deleteDialogRef}
      >
        <form action={deleteFormAction} className="grid gap-5 p-5">
          <input name="projectId" type="hidden" value={projectId} />
          <div>
            <h2 className="text-lg font-semibold">Eliminar proyecto</h2>
            <p className="mt-1 text-sm text-slate-600">
              Se borraran sus notas y conexiones. Esta accion no se puede
              deshacer.
            </p>
          </div>
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
            {projectName}
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
    </div>
  );
}
