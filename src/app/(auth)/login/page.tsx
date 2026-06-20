import { Logo } from "@/app/components/logo";
import { AuthForm } from "../auth-form";
import { signIn } from "@/server/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm rounded-dialog border border-line bg-card p-8 shadow-lift">
        <div className="mb-8">
          <Logo />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Iniciar sesión</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Accedé a tu espacio de trabajo.</p>
        </div>
        <AuthForm
          action={signIn}
          alternate={{ href: "/register", label: "Creá una cuenta", text: "¿Todavía no tenés cuenta?" }}
          submitLabel="Entrar"
        />
      </div>
    </main>
  );
}
