"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { NOTE_LAYERS, NOTE_STATUSES } from "@/core";
import { createClient } from "@/lib/supabase/server";
import { createEdge, deleteEdge } from "@/server/edges";
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

const moveNoteLayerSchema = z.object({
  projectId: z.string().uuid(),
  noteId: z.string().uuid(),
  layer: z.enum(NOTE_LAYERS),
});

const moveNoteStatusSchema = z.object({
  projectId: z.string().uuid(),
  noteId: z.string().uuid(),
  status: z.enum(NOTE_STATUSES),
});

const moveNotePositionSchema = z.object({
  projectId: z.string().uuid(),
  noteId: z.string().uuid(),
  x: z.number().int(),
  y: z.number().int(),
});

const createCanvasEdgeSchema = z.object({
  projectId: z.string().uuid(),
  fromNoteId: z.string().uuid(),
  toNoteId: z.string().uuid(),
});

const deleteCanvasEdgeSchema = z.object({
  projectId: z.string().uuid(),
  edgeId: z.string().uuid(),
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

export async function createNoteInLayerAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const layer = z.enum(NOTE_LAYERS).parse(formData.get("layer"));
  const note = await createNote(userId, projectId, {
    title: "Sin titulo",
    layer,
  });

  if (!note) {
    redirect(`/projects/${projectId}`);
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}?note=${note.id}`);
}

export async function createNoteFromWikilinkAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const title = z
    .string()
    .trim()
    .min(1)
    .max(200)
    .parse(formData.get("title"));
  const note = await createNote(userId, projectId, {
    title,
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

export async function moveNoteLayerAction(input: {
  projectId: string;
  noteId: string;
  layer: string;
}) {
  const userId = await getCurrentUserId();
  const parsed = moveNoteLayerSchema.parse(input);
  const note = await updateNote(userId, parsed.projectId, parsed.noteId, {
    layer: parsed.layer,
  });

  if (!note) {
    throw new Error("No pudimos mover la nota.");
  }

  revalidatePath(`/projects/${parsed.projectId}`);
}

export async function moveNoteStatusAction(input: {
  projectId: string;
  noteId: string;
  status: string;
}) {
  const userId = await getCurrentUserId();
  const parsed = moveNoteStatusSchema.parse(input);
  const note = await updateNote(userId, parsed.projectId, parsed.noteId, {
    status: parsed.status,
  });

  if (!note) {
    throw new Error("No pudimos mover la nota.");
  }

  revalidatePath(`/projects/${parsed.projectId}`);
}

export async function moveNotePositionAction(input: {
  projectId: string;
  noteId: string;
  x: number;
  y: number;
}) {
  const userId = await getCurrentUserId();
  const parsed = moveNotePositionSchema.parse(input);
  const note = await updateNote(userId, parsed.projectId, parsed.noteId, {
    x: parsed.x,
    y: parsed.y,
  });

  if (!note) {
    throw new Error("No pudimos mover la nota.");
  }

  revalidatePath(`/projects/${parsed.projectId}`);
}

export async function createCanvasEdgeAction(input: {
  projectId: string;
  fromNoteId: string;
  toNoteId: string;
}) {
  const userId = await getCurrentUserId();
  const parsed = createCanvasEdgeSchema.parse(input);
  const edge = await createEdge(
    userId,
    parsed.projectId,
    parsed.fromNoteId,
    parsed.toNoteId,
  );

  if (!edge) {
    throw new Error("No pudimos crear la conexion.");
  }

  revalidatePath(`/projects/${parsed.projectId}`);
  return {
    id: edge.id,
    fromNoteId: edge.fromNoteId,
    toNoteId: edge.toNoteId,
  };
}

export async function deleteCanvasEdgeAction(input: {
  projectId: string;
  edgeId: string;
}) {
  const userId = await getCurrentUserId();
  const parsed = deleteCanvasEdgeSchema.parse(input);
  const edge = await deleteEdge(userId, parsed.projectId, parsed.edgeId);

  if (!edge) {
    throw new Error("No pudimos borrar la conexion.");
  }

  revalidatePath(`/projects/${parsed.projectId}`);
}
