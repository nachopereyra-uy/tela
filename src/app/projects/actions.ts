"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  NOTE_LAYERS,
  NOTE_STATUSES,
  type NoteLayer,
  type NoteStatus,
} from "@/core";
import { createClient } from "@/lib/supabase/server";
import { createEdge } from "@/server/edges";
import { createNote } from "@/server/notes";
import {
  createProject,
  deleteProject,
  renameProject,
} from "@/server/projects";

export type CreateProjectState = {
  error?: string;
};

export type ProjectActionState = {
  error?: string;
};

export type ImportProjectState = {
  error?: string;
};

const validNoteLayers = new Set<string>(NOTE_LAYERS);
const validNoteStatuses = new Set<string>(NOTE_STATUSES);

const importedNoteSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    content: z.string().optional(),
    status: z.string().optional(),
    layer: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough();

const importedEdgeSchema = z
  .object({
    id: z.string().optional(),
    fromNoteId: z.string().optional(),
    from_note_id: z.string().optional(),
    from: z.string().optional(),
    source: z.string().optional(),
    toNoteId: z.string().optional(),
    to_note_id: z.string().optional(),
    to: z.string().optional(),
    target: z.string().optional(),
  })
  .passthrough();

const importSchema = z
  .object({
    project: z
      .object({
        name: z.string().optional(),
        color: z.string().optional(),
      })
      .passthrough()
      .optional(),
    name: z.string().optional(),
    notes: z.array(importedNoteSchema).optional(),
    edges: z.array(importedEdgeSchema).optional(),
  })
  .passthrough();

export async function createProjectAction(
  _state: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name");
  const color = formData.get("color");

  let projectId: string;

  try {
    const project = await createProject(user.id, {
      name: typeof name === "string" ? name : "",
      color: typeof color === "string" ? color : undefined,
    });

    if (!project) {
      return { error: "No pudimos crear el proyecto." };
    }

    projectId = project.id;
  } catch {
    return { error: "Revisa el nombre y el color del proyecto." };
  }

  redirect(`/projects/${projectId}`);
}

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

export async function renameProjectAction(
  _state: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const userId = await getCurrentUserId();
  const projectId = formData.get("projectId");
  const name = formData.get("name");

  if (typeof projectId !== "string" || typeof name !== "string") {
    return { error: "Revisa los datos del proyecto." };
  }

  try {
    const project = await renameProject(userId, projectId, { name });

    if (!project) {
      return { error: "No encontramos ese proyecto." };
    }
  } catch {
    return { error: "No pudimos renombrar el proyecto." };
  }

  redirect("/projects");
}

export async function deleteProjectAction(
  _state: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const userId = await getCurrentUserId();
  const projectId = formData.get("projectId");

  if (typeof projectId !== "string") {
    return { error: "Revisa los datos del proyecto." };
  }

  try {
    const project = await deleteProject(userId, projectId);

    if (!project) {
      return { error: "No encontramos ese proyecto." };
    }
  } catch {
    return { error: "No pudimos eliminar el proyecto." };
  }

  redirect("/projects");
}

function fallbackTitle(index: number) {
  return `Nota ${index + 1}`;
}

function importedStatus(status: string | undefined): NoteStatus | undefined {
  return validNoteStatuses.has(status ?? "") ? (status as NoteStatus) : undefined;
}

function importedLayer(layer: string | undefined): NoteLayer | undefined {
  return validNoteLayers.has(layer ?? "") ? (layer as NoteLayer) : undefined;
}

function edgeEndpoint(edge: z.infer<typeof importedEdgeSchema>, side: "from" | "to") {
  if (side === "from") {
    return edge.fromNoteId ?? edge.from_note_id ?? edge.from ?? edge.source;
  }

  return edge.toNoteId ?? edge.to_note_id ?? edge.to ?? edge.target;
}

export async function importProjectAction(
  formData: FormData,
): Promise<void> {
  const userId = await getCurrentUserId();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect("/projects");
  }

  let parsed: z.infer<typeof importSchema>;

  try {
    parsed = importSchema.parse(JSON.parse(await file.text()));
  } catch {
    redirect("/projects");
  }

  const projectName =
    parsed.project?.name?.trim() || parsed.name?.trim() || "Proyecto importado";
  const projectColor =
    parsed.project?.color && /^#[0-9a-fA-F]{6}$/.test(parsed.project.color)
      ? parsed.project.color
      : undefined;
  const project = await createProject(userId, {
    name: projectName,
    color: projectColor,
  });

  if (!project) {
    redirect("/projects");
  }

  const idMap = new Map<string, string>();
  const importedNotes = parsed.notes ?? [];

  for (const [index, importedNote] of importedNotes.entries()) {
    const note = await createNote(userId, project.id, {
      title: importedNote.title?.trim() || fallbackTitle(index),
      content: importedNote.content ?? "",
      status: importedStatus(importedNote.status),
      layer: importedLayer(importedNote.layer),
      x: Number.isInteger(importedNote.x) ? importedNote.x : index * 40,
      y: Number.isInteger(importedNote.y) ? importedNote.y : index * 40,
      tags: importedNote.tags ?? [],
    });

    if (note && importedNote.id) {
      idMap.set(importedNote.id, note.id);
    }
  }

  for (const importedEdge of parsed.edges ?? []) {
    const from = edgeEndpoint(importedEdge, "from");
    const to = edgeEndpoint(importedEdge, "to");

    if (!from || !to) {
      continue;
    }

    const mappedFrom = idMap.get(from);
    const mappedTo = idMap.get(to);

    if (mappedFrom && mappedTo) {
      await createEdge(userId, project.id, mappedFrom, mappedTo);
    }
  }

  redirect(`/projects/${project.id}`);
}
