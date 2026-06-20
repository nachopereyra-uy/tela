"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { NOTE_LAYERS, NOTE_STATUSES } from "@/core";
import { createClient } from "@/lib/supabase/server";
import { createNote, deleteNote, updateNote } from "@/server/notes";

export type NoteActionState = {
  error?: string;
};

const noteFormSchema = z.object({
  projectId: z.string().uuid(),
  noteId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  layer: z.enum(NOTE_LAYERS),
  status: z.enum(NOTE_STATUSES),
  content: z.string(),
  tags: z.string(),
});

const noteDeleteSchema = z.object({
  projectId: z.string().uuid(),
  noteId: z.string().uuid(),
});

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user.id;
}

function parseTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function createNoteAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const note = await createNote(userId, projectId, {
    title: "Sin titulo",
  });

  if (!note) {
    redirect(`/projects/${projectId}`);
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?note=${note.id}`);
}

export async function updateNoteAction(
  _state: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const userId = await getCurrentUserId();
  const parsed = noteFormSchema.safeParse({
    projectId: formData.get("projectId"),
    noteId: formData.get("noteId"),
    title: formData.get("title"),
    layer: formData.get("layer"),
    status: formData.get("status"),
    content: formData.get("content"),
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    return { error: "Revisa los datos de la nota." };
  }

  const note = await updateNote(
    userId,
    parsed.data.projectId,
    parsed.data.noteId,
    {
      title: parsed.data.title,
      layer: parsed.data.layer,
      status: parsed.data.status,
      content: parsed.data.content,
      tags: parseTags(parsed.data.tags),
    },
  );

  if (!note) {
    return { error: "No pudimos guardar la nota." };
  }

  revalidatePath(`/projects/${parsed.data.projectId}`);
  return {};
}

export async function deleteNoteAction(
  _state: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  const userId = await getCurrentUserId();
  const parsed = noteDeleteSchema.safeParse({
    projectId: formData.get("projectId"),
    noteId: formData.get("noteId"),
  });

  if (!parsed.success) {
    return { error: "Revisa los datos de la nota." };
  }

  const note = await deleteNote(userId, parsed.data.projectId, parsed.data.noteId);

  if (!note) {
    return { error: "No pudimos eliminar la nota." };
  }

  revalidatePath(`/projects/${parsed.data.projectId}`);
  redirect(`/projects/${parsed.data.projectId}`);
}
