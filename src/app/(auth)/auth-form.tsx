"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/server/auth";

type AuthFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  alternate: {
    label: string;
    href: string;
    text: string;
  };
};

const initialState: AuthFormState = {};

export function AuthForm({ action, submitLabel, alternate }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-slate-800" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-11 rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="grid gap-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="password"
        >
          Contrasena
        </label>
        <input
          autoComplete="current-password"
          className="h-11 rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        className="h-11 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={pending}
        type="submit"
      >
        {pending ? "Procesando..." : submitLabel}
      </button>
      <p className="text-sm text-slate-600">
        {alternate.text}{" "}
        <Link className="font-medium text-indigo-700" href={alternate.href}>
          {alternate.label}
        </Link>
      </p>
    </form>
  );
}
