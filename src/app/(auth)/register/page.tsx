import { Logo } from "@/app/components/logo";
import { AuthForm } from "../auth-form";
import { signUp } from "@/server/auth";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm rounded-dialog border border-line bg-card p-8 shadow-lift">
        <div className="mb-8">
          <Logo />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Crear cuenta</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Registrate para empezar.</p>
        </div>
        <AuthForm
          action={signUp}
          alternate={{ href: "/login", label: "Iniciá sesión", text: "¿Ya tenés cuenta?" }}
          submitLabel="Registrarme"
        />
      </div>
    </main>
  );
}
