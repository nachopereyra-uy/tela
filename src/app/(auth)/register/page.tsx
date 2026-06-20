import { AuthForm } from "../auth-form";
import { signUp } from "@/server/auth";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
        Tela
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        Crear cuenta
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Registra tu usuario para empezar.
      </p>
      <AuthForm
        action={signUp}
        alternate={{
          href: "/login",
          label: "Inicia sesion",
          text: "Ya tienes cuenta?",
        }}
        submitLabel="Registrarme"
      />
    </main>
  );
}
