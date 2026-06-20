import type { NoteLayer } from "./layers";

export const NOTE_STATUSES = [
  "todo",
  "doing",
  "done",
  "idea",
  "none",
] as const;

export type NoteStatus = (typeof NOTE_STATUSES)[number];

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  color: string;
  createdAt: Date | null;
  archivedAt: Date | null;
};

export type Note = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: NoteStatus;
  layer: NoteLayer;
  x: number;
  y: number;
  tags: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type Edge = {
  id: string;
  projectId: string;
  fromNoteId: string;
  toNoteId: string;
  label: string | null;
};
