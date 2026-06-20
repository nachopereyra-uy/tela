"use server";

import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { NOTE_LAYERS, NOTE_STATUSES } from "@/core";
import { db } from "@/db/client";
import { edges, notes, projects } from "@/db/schema";

const idSchema = z.string().uuid();

const noteInputSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().optional(),
  status: z.enum(NOTE_STATUSES).optional(),
  layer: z.enum(NOTE_LAYERS).optional(),
  x: z.number().int().optional(),
  y: z.number().int().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});

const noteUpdateSchema = noteInputSchema.partial();

async function userOwnsProject(userId: string, projectId: string) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)))
    .limit(1);

  return Boolean(project);
}

export async function listNotes(userId: string, projectId: string) {
  const ownerId = idSchema.parse(userId);
  const id = idSchema.parse(projectId);

  if (!(await userOwnsProject(ownerId, id))) {
    return [];
  }

  return db.select().from(notes).where(eq(notes.projectId, id));
}

export async function createNote(
  userId: string,
  projectId: string,
  input: z.input<typeof noteInputSchema> = {},
) {
  const ownerId = idSchema.parse(userId);
  const id = idSchema.parse(projectId);
  const data = noteInputSchema.parse(input);

  if (!(await userOwnsProject(ownerId, id))) {
    return null;
  }

  const [note] = await db
    .insert(notes)
    .values({
      projectId: id,
      title: data.title,
      content: data.content,
      status: data.status,
      layer: data.layer,
      x: data.x,
      y: data.y,
      tags: data.tags,
    })
    .returning();

  return note;
}

export async function updateNote(
  userId: string,
  projectId: string,
  noteId: string,
  input: z.input<typeof noteUpdateSchema>,
) {
  const ownerId = idSchema.parse(userId);
  const project = idSchema.parse(projectId);
  const id = idSchema.parse(noteId);
  const data = noteUpdateSchema.parse(input);

  if (!(await userOwnsProject(ownerId, project))) {
    return null;
  }

  const [note] = await db
    .update(notes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, id), eq(notes.projectId, project)))
    .returning();

  return note ?? null;
}

export async function deleteNote(
  userId: string,
  projectId: string,
  noteId: string,
) {
  const ownerId = idSchema.parse(userId);
  const project = idSchema.parse(projectId);
  const id = idSchema.parse(noteId);

  if (!(await userOwnsProject(ownerId, project))) {
    return null;
  }

  await db
    .delete(edges)
    .where(
      and(
        eq(edges.projectId, project),
        or(eq(edges.fromNoteId, id), eq(edges.toNoteId, id)),
      ),
    );

  const [note] = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.projectId, project)))
    .returning({ id: notes.id });

  return note ?? null;
}
