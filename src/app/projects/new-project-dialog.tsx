"use client";

import { useActionState, useRef } from "react";
import {
  type CreateProjectState,
  createProjectAction,
} from "./actions";

const initialState: CreateProjectState = {};

export function NewProjectDialog() {
  const [state, formAction, pending] = useActionState(
    createProjectAction,
    initialState,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="h-9 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        Nuevo proyecto
      </button>
      <dialog
        className="w-[min(92vw,420px)] rounded-dialog border border-line bg-card p-0 text-ink shadow-lift backdrop:bg-ink/20 backdrop:backdrop-blur-sm"
        ref={dialogRef}
      >
        <form className="grid gap-5 p-6" action={formAction}>
          <div>
            <h2 className="text-lg font-semibold text-ink">Crear proyecto</h2>
            <p className="mt-1 text-sm text-ink-soft">
              El proyecto se crea vacío y queda listo para cargar notas.
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="project-name">
              Nombre
            </label>
            <input
              autoFocus
              className="h-10 rounded-btn border border-line bg-paper px-3 text-base text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
              id="project-name"
              maxLength={120}
              name="name"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="project-color">
              Color
            </label>
            <input
              className="h-10 w-16 rounded-btn border border-line bg-card p-1"
              defaultValue="#3457D5"
              id="project-color"
              name="color"
              type="color"
            />
          </div>
          {state.error ? (
            <p className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              className="h-10 rounded-btn border border-line px-4 text-sm font-medium text-ink-soft transition hover:bg-paper"
              disabled={pending}
              formMethod="dialog"
              type="submit"
            >
              Cancelar
            </button>
            <button
              className="h-10 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pending}
              type="submit"
            >
              {pending ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
