"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { projects } from "@/db/schema";

const projectIdSchema = z.string().uuid();

const projectInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

const renameProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export async function listProjects(userId: string) {
  const ownerId = projectIdSchema.parse(userId);

  return db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, ownerId))
    .orderBy(projects.createdAt);
}

export async function createProject(
  userId: string,
  input: z.input<typeof projectInputSchema>,
) {
  const ownerId = projectIdSchema.parse(userId);
  const data = projectInputSchema.parse(input);

  const [project] = await db
    .insert(projects)
    .values({
      ownerId,
      name: data.name,
      color: data.color,
    })
    .returning();

  return project;
}

export async function renameProject(
  userId: string,
  projectId: string,
  input: z.input<typeof renameProjectSchema>,
) {
  const ownerId = projectIdSchema.parse(userId);
  const id = projectIdSchema.parse(projectId);
  const data = renameProjectSchema.parse(input);

  const [project] = await db
    .update(projects)
    .set({ name: data.name })
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
    .returning();

  return project ?? null;
}

export async function deleteProject(userId: string, projectId: string) {
  const ownerId = projectIdSchema.parse(userId);
  const id = projectIdSchema.parse(projectId);

  const [project] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
    .returning({ id: projects.id });

  return project ?? null;
}
