import { describe, expect, it } from "vitest";
import {
  backlinks,
  findByTitle,
  outgoingLinks,
  wikilinkEdges,
} from "./notes";
import type { Note } from "./types";

function note(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    projectId: "project-1",
    title: "Default",
    content: "",
    status: "todo",
    layer: "none",
    x: 0,
    y: 0,
    tags: [],
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe("outgoingLinks", () => {
  it("extracts unique wikilinks in order", () => {
    expect(
      outgoingLinks("Ver [[Oferta]] y [[  CRM  ]] y otra vez [[oferta]]."),
    ).toEqual(["Oferta", "CRM"]);
  });

  it("ignores empty and multiline links", () => {
    expect(outgoingLinks("[[]] [[\nRoto]] [[Valido]]")).toEqual(["Valido"]);
  });
});

describe("findByTitle", () => {
  it("finds a note by normalized title", () => {
    const notes = [note({ title: "Proceso Comercial" })];

    expect(findByTitle(notes, " proceso   comercial ")?.id).toBe("note-1");
  });

  it("returns null when title is not found", () => {
    expect(findByTitle([note({ title: "A" })], "B")).toBeNull();
  });
});

describe("backlinks", () => {
  it("returns notes that link to the target title", () => {
    const target = note({ id: "target", title: "Entrega" });
    const source = note({
      id: "source",
      title: "Ventas",
      content: "Coordinar con [[entrega]].",
    });
    const unrelated = note({
      id: "unrelated",
      title: "Marketing",
      content: "[[Ventas]]",
    });

    expect(backlinks(target, [target, source, unrelated])).toEqual([source]);
  });
});

describe("wikilinkEdges", () => {
  it("creates edges for wikilinks that point to existing notes", () => {
    const source = note({
      id: "source",
      title: "Ventas",
      content: "[[Cierre]] y [[No existe]]",
    });
    const target = note({ id: "target", title: "Cierre" });

    expect(wikilinkEdges([source, target])).toEqual([
      {
        fromNoteId: "source",
        toNoteId: "target",
        title: "Cierre",
      },
    ]);
  });
});
