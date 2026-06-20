function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInline(markdown: string) {
  const parts = markdown.split(/(`[^`\n]*`)/g);

  return parts
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }

      return escapeHtml(part)
        .replace(/\[\[([^\]\n]+)\]\]/g, (_match, rawTitle: string) => {
          const title = rawTitle.trim().replace(/\s+/g, " ");

          if (!title) {
            return "";
          }

          return `<a href="#" data-wikilink="${title.replaceAll("`", "&#96;")}">${title}</a>`;
        })
        .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    })
    .join("");
}

function renderParagraph(lines: string[]) {
  return `<p>${renderInline(lines.join(" "))}</p>`;
}

function renderList(lines: string[]) {
  const items = lines
    .map((line) => line.replace(/^-\s+/, ""))
    .map((item) => `<li>${renderInline(item)}</li>`)
    .join("");

  return `<ul>${items}</ul>`;
}

export function markdownToHtml(markdown: string) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }

    html.push(renderParagraph(paragraph));
    paragraph = [];
  }

  function flushList() {
    if (list.length === 0) {
      return;
    }

    html.push(renderList(list));
    list = [];
  }

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (code) {
        html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      html.push(`<h1>${renderInline(line.slice(2).trim())}</h1>`);
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      html.push(`<h2>${renderInline(line.slice(3).trim())}</h2>`);
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  if (code) {
    html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  }

  flushParagraph();
  flushList();

  return html.join("\n");
}
