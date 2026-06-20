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
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-11 rounded-btn border border-line bg-paper px-3 text-base text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-ink" htmlFor="password">
          Contraseña
        </label>
        <input
          autoComplete="current-password"
          className="h-11 rounded-btn border border-line bg-paper px-3 text-base text-ink outline-none transition focus:border-blue focus:ring-2 focus:ring-blue-soft"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>
      {state.error ? (
        <p className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        className="h-11 rounded-btn bg-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-deep disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={pending}
        type="submit"
      >
        {pending ? "Procesando..." : submitLabel}
      </button>
      <p className="text-sm text-ink-soft">
        {alternate.text}{" "}
        <Link className="font-medium text-blue hover:text-blue-deep transition" href={alternate.href}>
          {alternate.label}
        </Link>
      </p>
    </form>
  );
}
