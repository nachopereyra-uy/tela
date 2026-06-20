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
        className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        Nuevo proyecto
      </button>
      <dialog
        className="w-[min(92vw,420px)] rounded-lg border border-slate-200 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-slate-950/30"
        ref={dialogRef}
      >
        <form className="grid gap-5 p-5" action={formAction}>
          <div>
            <h2 className="text-lg font-semibold">Crear proyecto</h2>
            <p className="mt-1 text-sm text-slate-600">
              El proyecto se crea vacio y queda listo para cargar notas.
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="project-name">
              Nombre
            </label>
            <input
              autoFocus
              className="h-10 rounded-md border border-slate-300 px-3 text-base outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              id="project-name"
              maxLength={120}
              name="name"
              required
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="project-color">
              Color
            </label>
            <input
              className="h-10 w-16 rounded-md border border-slate-300 bg-white p-1"
              defaultValue="#6366f1"
              id="project-color"
              name="color"
              type="color"
            />
          </div>
          {state.error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              className="h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              disabled={pending}
              formMethod="dialog"
              type="submit"
            >
              Cancelar
            </button>
            <button
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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
