import { AuthForm } from "../auth-form";
import { signIn } from "@/server/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
        Tela
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        Iniciar sesion
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Accede a tu espacio de trabajo.
      </p>
      <AuthForm
        action={signIn}
        alternate={{
          href: "/register",
          label: "Crea una cuenta",
          text: "Todavia no tienes cuenta?",
        }}
        submitLabel="Entrar"
      />
    </main>
  );
}
