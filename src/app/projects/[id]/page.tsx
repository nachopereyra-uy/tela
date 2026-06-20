import { notFound, redirect } from "next/navigation";
import { type NoteLayer, type NoteStatus } from "@/core";
import { createClient } from "@/lib/supabase/server";
import { listEdges } from "@/server/edges";
import { listNotes } from "@/server/notes";
import { getProject, listProjects } from "@/server/projects";
import { ProjectShell, type ShellEdge, type ShellNote, type ShellProject } from "./project-shell";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ note?: string }>;
};

function toShellNote(note: Awaited<ReturnType<typeof listNotes>>[number]): ShellNote {
  return {
    id: note.id,
    projectId: note.projectId,
    title: note.title,
    content: note.content,
    status: note.status as NoteStatus,
    layer: note.layer as NoteLayer,
    x: note.x,
    y: note.y,
    tags: note.tags,
  };
}

function toShellEdge(edge: Awaited<ReturnType<typeof listEdges>>[number]): ShellEdge {
  return {
    id: edge.id,
    fromNoteId: edge.fromNoteId,
    toNoteId: edge.toNoteId,
    label: edge.label,
  };
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { id } = await params;
  const { note: initialNoteId } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await getProject(user.id, id);
  if (!project) notFound();

  const [allProjectsRaw, notes, explicitEdges] = await Promise.all([
    listProjects(user.id),
    listNotes(user.id, id),
    listEdges(user.id, id),
  ]);

  const allProjects: ShellProject[] = allProjectsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color ?? "#3457D5",
  }));

  return (
    <ProjectShell
      project={{ id: project.id, name: project.name, color: project.color ?? "#3457D5" }}
      allProjects={allProjects}
      notes={notes.map(toShellNote)}
      explicitEdges={explicitEdges.map(toShellEdge)}
      initialNoteId={initialNoteId ?? null}
    />
  );
}
