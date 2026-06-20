import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listProjects } from "@/server/projects";
import { GlobalShell } from "./global-shell";

export default async function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const projects = await listProjects(user.id);

  return (
    <GlobalShell
      projects={projects.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color ?? "#3457D5",
      }))}
    >
      {children}
    </GlobalShell>
  );
}
