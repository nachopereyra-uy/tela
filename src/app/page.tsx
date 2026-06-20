import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
        Tela
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
        Lienzo, tablero y notas en una sola tela.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
        Base inicial del MVP con Next.js, Supabase, Drizzle y Vitest.
      </p>
      <p className="mt-8 text-sm text-slate-600">
        Sesion de Supabase: {user ? user.email : "sin usuario autenticado"}
      </p>
    </main>
  );
}
