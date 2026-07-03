import fs from "node:fs";
import path from "node:path";

/**
 * Server-only loader/renderer for markdown blog posts published by BlogForge.
 * Deliberately dependency-free: BlogForge emits a constrained markdown subset
 * (headings, paragraphs, lists, bold/em, links, blockquotes, hr), so a small
 * deterministic converter beats pulling in a full parser.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export type MarkdownPost = {
  frontmatter: Record<string, string>;
  html: string;
};

export function markdownPostExists(slug: string): boolean {
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  return fs.existsSync(path.join(CONTENT_DIR, `${slug}.md`));
}

export function loadMarkdownPost(slug: string): MarkdownPost | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { frontmatter, body } = parseFrontmatter(raw);
  return { frontmatter, html: mdToHtml(body) };
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  const frontmatter: Record<string, string> = {};
  if (!raw.startsWith("---")) return { frontmatter, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { frontmatter, body: raw };
  const block = raw.slice(3, end).trim();
  for (const line of block.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) frontmatter[key] = value;
  }
  const body = raw.slice(end + 4).replace(/^\n+/, "");
  return { frontmatter, body };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inline markdown → HTML (input must already be HTML-escaped). */
function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
}

function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      closeList();
      // Page title is the layout's h1; demote any md h1 to h2.
      const level = Math.max(heading[1].length, 2);
      out.push(`<h${level}>${inline(escapeHtml(heading[2]))}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      closeList();
      out.push("<hr />");
      continue;
    }

    const ulItem = trimmed.match(/^[-*]\s+(.*)$/);
    const olItem = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ulItem || olItem) {
      flushParagraph();
      const kind = ulItem ? "ul" : "ol";
      if (list !== kind) {
        closeList();
        out.push(`<${kind}>`);
        list = kind;
      }
      out.push(`<li>${inline(escapeHtml((ulItem ?? olItem)![1]))}</li>`);
      continue;
    }

    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      closeList();
      out.push(`<blockquote><p>${inline(escapeHtml(quote[1]))}</p></blockquote>`);
      continue;
    }

    closeList();
    paragraph.push(inlineSafe(trimmed));
  }

  flushParagraph();
  closeList();
  return out.join("\n");
}

function inlineSafe(text: string): string {
  return escapeHtml(text);
}
