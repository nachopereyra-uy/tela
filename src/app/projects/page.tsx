import { signOut } from "@/server/auth";

export default function ProjectsPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
        Tela
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        Proyectos
      </h1>
      <p className="mt-3 text-slate-600">
        La gestion de proyectos se implementa en la siguiente etapa.
      </p>
      <form action={signOut} className="mt-8">
        <button
          className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          type="submit"
        >
          Cerrar sesion
        </button>
      </form>
    </main>
  );
}
