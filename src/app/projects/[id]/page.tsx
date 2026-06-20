import { notFound, redirect } from "next/navigation";
import {
  backlinks,
  findByTitle,
  outgoingLinks,
  type Note,
  type NoteLayer,
  type NoteStatus,
  wikilinkEdges,
} from "@/core";
import { createClient } from "@/lib/supabase/server";
import { listEdges } from "@/server/edges";
import { listNotes } from "@/server/notes";
import { getProject } from "@/server/projects";
import { type InspectorNote } from "./note-inspector";
import { ProjectShell, type ShellEdge, type ShellNote } from "./project-shell";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    note?: string;
  }>;
};

function toInspectorNote(note: Awaited<ReturnType<typeof listNotes>>[number]) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    layer: note.layer,
    status: note.status,
    tags: note.tags,
  } satisfies InspectorNote;
}

function toCoreNote(note: Awaited<ReturnType<typeof listNotes>>[number]): Note {
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
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

function toShellNote(note: Awaited<ReturnType<typeof listNotes>>[number]): ShellNote {
  return {
    id: note.id,
    projectId: note.projectId,
    title: note.title,
    content: note.content,
    status: note.status,
    layer: note.layer,
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

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { id } = await params;
  const { note: selectedNoteId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const project = await getProject(user.id, id);

  if (!project) {
    notFound();
  }

  const notes = await listNotes(user.id, id);
  const explicitEdges = await listEdges(user.id, id);
  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null;
  const coreNotes = notes.map(toCoreNote);
  const selectedCoreNote = selectedNote ? toCoreNote(selectedNote) : null;
  const selectedOutgoingLinks = selectedCoreNote
    ? outgoingLinks(selectedCoreNote.content).map((title) => ({
        title,
        noteId: findByTitle(coreNotes, title)?.id ?? null,
      }))
    : [];
  const selectedBacklinks = selectedCoreNote
    ? backlinks(selectedCoreNote, coreNotes).map((note) => ({
        id: note.id,
        title: note.title,
      }))
    : [];
  const derivedWikilinkEdges = wikilinkEdges(coreNotes);

  return (
    <ProjectShell
      backlinks={selectedBacklinks}
      explicitEdges={explicitEdges.map(toShellEdge)}
      inspectorNote={selectedNote ? toInspectorNote(selectedNote) : null}
      notes={notes.map(toShellNote)}
      outgoingLinks={selectedOutgoingLinks}
      project={{ id: project.id, name: project.name }}
      selectedNoteId={selectedNote?.id ?? null}
      wikilinkEdges={derivedWikilinkEdges}
    />
  );
}
