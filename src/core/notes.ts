import type { Note } from "./types";

export type WikilinkEdge = {
  fromNoteId: string;
  toNoteId: string;
  title: string;
};

const WIKILINK_PATTERN = /\[\[([^\]\n]+)\]\]/g;

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function outgoingLinks(content: string) {
  const links: string[] = [];
  const seen = new Set<string>();

  for (const match of content.matchAll(WIKILINK_PATTERN)) {
    const title = match[1]?.trim().replace(/\s+/g, " ");

    if (!title) {
      continue;
    }

    const normalized = normalizeTitle(title);

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    links.push(title);
  }

  return links;
}

export function findByTitle(notes: readonly Note[], title: string) {
  const normalizedTitle = normalizeTitle(title);

  return (
    notes.find((note) => normalizeTitle(note.title) === normalizedTitle) ?? null
  );
}

export function backlinks(target: Note, notes: readonly Note[]) {
  const targetTitle = normalizeTitle(target.title);

  return notes.filter((note) => {
    if (note.id === target.id) {
      return false;
    }

    return outgoingLinks(note.content).some(
      (linkTitle) => normalizeTitle(linkTitle) === targetTitle,
    );
  });
}

export function wikilinkEdges(notes: readonly Note[]): WikilinkEdge[] {
  return notes.flatMap((note) =>
    outgoingLinks(note.content).flatMap((title) => {
      const target = findByTitle(notes, title);

      if (!target) {
        return [];
      }

      return [
        {
          fromNoteId: note.id,
          toNoteId: target.id,
          title,
        },
      ];
    }),
  );
}
