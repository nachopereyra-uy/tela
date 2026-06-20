import { describe, expect, it } from "vitest";
import { markdownToHtml } from "./markdown";

describe("markdownToHtml", () => {
  it("renders h1 and h2 headings", () => {
    expect(markdownToHtml("# Titulo\n## Seccion")).toBe(
      "<h1>Titulo</h1>\n<h2>Seccion</h2>",
    );
  });

  it("renders bold text and paragraphs", () => {
    expect(markdownToHtml("Esto es **importante**.")).toBe(
      "<p>Esto es <strong>importante</strong>.</p>",
    );
  });

  it("renders unordered lists", () => {
    expect(markdownToHtml("- Uno\n- **Dos**")).toBe(
      "<ul><li>Uno</li><li><strong>Dos</strong></li></ul>",
    );
  });

  it("renders inline and fenced code", () => {
    expect(markdownToHtml("Usar `npm run test`.\n\n```\n<a>\n```")).toBe(
      "<p>Usar <code>npm run test</code>.</p>\n<pre><code>&lt;a&gt;</code></pre>",
    );
  });

  it("renders wikilinks", () => {
    expect(markdownToHtml("Ver [[  Proceso Comercial  ]].")).toBe(
      '<p>Ver <a href="#" data-wikilink="Proceso Comercial">Proceso Comercial</a>.</p>',
    );
  });

  it("escapes html input", () => {
    expect(markdownToHtml("<script>alert(1)</script>")).toBe(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
    );
  });

  it("does not inject html through wikilinks", () => {
    expect(markdownToHtml("[[<img src=x onerror=alert(1)>]]")).toBe(
      '<p><a href="#" data-wikilink="&lt;img src=x onerror=alert(1)&gt;">&lt;img src=x onerror=alert(1)&gt;</a></p>',
    );
  });
});
