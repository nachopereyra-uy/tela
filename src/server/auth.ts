"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
};

const credentialsSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido."),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres."),
});

function parseCredentials(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.",
    };
  }

  return { data: parsed.data };
}

export async function signIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = parseCredentials(formData);

  if ("error" in credentials) {
    return { error: credentials.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);

  if (error) {
    return { error: "No pudimos iniciar sesion con esos datos." };
  }

  redirect("/projects");
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const credentials = parseCredentials(formData);

  if ("error" in credentials) {
    return { error: credentials.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(credentials.data);

  if (error) {
    return { error: "No pudimos crear la cuenta con esos datos." };
  }

  redirect("/projects");
}
