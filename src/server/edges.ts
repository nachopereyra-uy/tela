"use server";

import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { edges, notes, projects } from "@/db/schema";

const idSchema = z.string().uuid();

async function userOwnsProject(userId: string, projectId: string) {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)))
    .limit(1);

  return Boolean(project);
}

async function notesBelongToProject(projectId: string, noteIds: string[]) {
  const rows = await db
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.projectId, projectId), inArray(notes.id, noteIds)));

  return rows.length === new Set(noteIds).size;
}

export async function listEdges(userId: string, projectId: string) {
  const ownerId = idSchema.parse(userId);
  const id = idSchema.parse(projectId);

  if (!(await userOwnsProject(ownerId, id))) {
    return [];
  }

  return db.select().from(edges).where(eq(edges.projectId, id));
}

export async function createEdge(
  userId: string,
  projectId: string,
  fromNoteId: string,
  toNoteId: string,
) {
  const ownerId = idSchema.parse(userId);
  const project = idSchema.parse(projectId);
  const from = idSchema.parse(fromNoteId);
  const to = idSchema.parse(toNoteId);

  if (!(await userOwnsProject(ownerId, project))) {
    return null;
  }

  if (!(await notesBelongToProject(project, [from, to]))) {
    return null;
  }

  const [edge] = await db
    .insert(edges)
    .values({
      projectId: project,
      fromNoteId: from,
      toNoteId: to,
    })
    .returning();

  return edge;
}

export async function deleteEdge(
  userId: string,
  projectId: string,
  edgeId: string,
) {
  const ownerId = idSchema.parse(userId);
  const project = idSchema.parse(projectId);
  const id = idSchema.parse(edgeId);

  if (!(await userOwnsProject(ownerId, project))) {
    return null;
  }

  const [edge] = await db
    .delete(edges)
    .where(and(eq(edges.id, id), eq(edges.projectId, project)))
    .returning({ id: edges.id });

  return edge ?? null;
}
