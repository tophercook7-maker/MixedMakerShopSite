/**
 * Generates branded MMS resource PDFs into public/downloads/ (no npm deps).
 * Run from next-app: node scripts/generate-resource-pdfs.cjs
 */
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "public", "downloads");

function escapePdf(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/** Latin-ish text only — avoids WinAnsi issues with curly quotes etc. */
function ascii(str) {
  return String(str)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, "--")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ");
}

function wrapWords(text, maxChars) {
  const words = ascii(text).split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= maxChars) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w.length > maxChars ? w.slice(0, maxChars) : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function layoutParagraph(text, maxChars = 92) {
  const paras = ascii(text).split(/\n+/);
  const out = [];
  for (const p of paras) {
    if (!p.trim()) continue;
    out.push(...wrapWords(p.trim(), maxChars));
  }
  return out;
}

function buildPageStream(items, pageWidth, pageHeight, margin, footerLines) {
  const lh = (sz) => Math.round(sz * 1.35);
  let y = pageHeight - margin;
  const chunks = [];
  const x = margin;

  function ensureSpace(need) {
    const floor = margin + 56;
    if (y - need < floor) return false;
    return true;
  }

  for (const item of items) {
    const fontKey = item.bold ? "/F2" : "/F1";
    const size = item.size ?? 11;
    const lines = item.text ? layoutParagraph(item.text, 92) : [""];

    for (const line of lines) {
      const step = lh(size);
      if (!ensureSpace(step)) return { stream: chunks.join("\n"), truncated: true };
      chunks.push(`BT`);
      chunks.push(`${fontKey} ${size} Tf`);
      chunks.push(`${x} ${y} Td`);
      chunks.push(`(${escapePdf(line)}) Tj`);
      chunks.push(`ET`);
      y -= step;
    }
    if (item.afterGap) y -= item.afterGap;
  }

  let fy = margin + 22;
  for (const fl of footerLines) {
    chunks.push(`BT`);
    chunks.push(`/F1 9 Tf`);
    chunks.push(`${x} ${fy} Td`);
    chunks.push(`(${escapePdf(fl)}) Tj`);
    chunks.push(`ET`);
    fy -= 11;
  }

  return { stream: chunks.join("\n"), truncated: false };
}

function brandHeader(docTitle) {
  return [
    { size: 18, bold: true, text: "Mixed Maker Shop", afterGap: 4 },
    { size: 11, text: "mixedmakershop.com", afterGap: 2 },
    { size: 11, text: "Topher@mixedmakershop.com", afterGap: 8 },
    {
      size: 10,
      text: "One umbrella. Multiple branches. Everything points back to Mixed Maker Shop.",
      afterGap: 14,
    },
    { size: 15, bold: true, text: docTitle, afterGap: 12 },
  ];
}

function blank(label) {
  return `${label}\n_______________________________________________________________________________`;
}

const RESOURCES = [
  {
    filename: "website-starter-checklist.pdf",
    title: "Website Starter Checklist",
    body: [
      ...brandHeader("Website Starter Checklist"),
      {
        size: 11,
        text: "Use this before you pick a theme or write final copy. Check boxes on screen or on paper.",
        afterGap: 10,
      },
      { size: 12, bold: true, text: "Clarify your goal", afterGap: 4 },
      {
        size: 11,
        text: blank(
          "What should the site help you do (calls, estimates, bookings, leads)? Pick one primary outcome.",
        ),
        afterGap: 10,
      },
      { size: 12, bold: true, text: "Pick your main CTA", afterGap: 4 },
      {
        size: 11,
        text: blank(
          "What is the one action you want most visitors to take? (Call, text, form, book, quote)",
        ),
        afterGap: 10,
      },
      { size: 12, bold: true, text: "Gather logo, images, services", afterGap: 4 },
      {
        size: 11,
        text: blank(
          "Logo file, 5-12 real photos, short list of services with plain-language names.",
        ),
        afterGap: 10,
      },
      { size: 12, bold: true, text: "List your pages", afterGap: 4 },
      {
        size: 11,
        text: blank(
          "Home + what else? (About, Services, Service areas, Reviews, Contact, FAQ). Keep v1 small.",
        ),
        afterGap: 10,
      },
      { size: 12, bold: true, text: "Prepare domain and hosting access", afterGap: 4 },
      {
        size: 11,
        text: blank(
          "Who owns the domain? Where should DNS point? Do you have hosting login or want guidance?",
        ),
        afterGap: 10,
      },
      { size: 12, bold: true, text: "Write basic business info", afterGap: 4 },
      {
        size: 11,
        text: blank(
          "Hours, service area, phone, email, address if relevant. Short story: who you help.",
        ),
        afterGap: 10,
      },
      { size: 12, bold: true, text: "Check mobile friendliness", afterGap: 4 },
      {
        size: 11,
        text: blank(
          "Read key pages on your phone. Tap targets big? Phone easy to find? Forms short?",
        ),
        afterGap: 10,
      },
      { size: 12, bold: true, text: "Plan follow-up", afterGap: 4 },
      {
        size: 11,
        text: blank(
          "Who replies to leads? How fast? What happens after someone submits a form?",
        ),
        afterGap: 8,
      },
      {
        size: 10,
        text: "Mixed Maker Shop builds practical sites and tools for small businesses. Questions? Email Topher@mixedmakershop.com",
      },
    ],
  },
  {
    filename: "local-business-website-audit-sheet.pdf",
    title: "Local Business Website Audit Sheet",
    body: [
      ...brandHeader("Local Business Website Audit Sheet"),
      {
        size: 11,
        text: "Quick pass on your current site (or placeholder page). Use Yes / Needs work / N/A.",
        afterGap: 10,
      },
      ...[
        "Is the homepage clear about what you offer in the first screen?",
        "Is phone or text contact easy to find without scrolling?",
        "Does it load and read well on a phone?",
        "Are services obvious with plain-language names?",
        "Is location or service area clear?",
        "Are reviews or proof visible near decisions?",
        "Are CTAs obvious (what to tap next)?",
      ].flatMap((q) => [
        { size: 11, bold: true, text: q, afterGap: 2 },
        {
          size: 11,
          text: "Notes: ________________________________________________________________",
          afterGap: 8,
        },
      ]),
      { size: 12, bold: true, text: "Quick score area", afterGap: 4 },
      {
        size: 11,
        text: "Overall clarity (1-5): _____     Mobile UX (1-5): _____     Trust/proof (1-5): _____",
        afterGap: 4,
      },
      {
        size: 11,
        text: "Top 3 fixes to do first:\n1. _______________________________________________________________\n2. _______________________________________________________________\n3. _______________________________________________________________",
        afterGap: 8,
      },
      {
        size: 10,
        text: "Need help prioritizing? mixedmakershop.com  |  Topher@mixedmakershop.com",
      },
    ],
  },
  {
    filename: "3d-print-request-prep-sheet.pdf",
    title: "3D Print Request Prep Sheet",
    body: [
      ...brandHeader("3D Print Request Prep Sheet"),
      {
        size: 11,
        text: "Fill what you can — clearer inputs mean fewer back-and-forth messages.",
        afterGap: 10,
      },
      ...[
        ["What do you need printed?", "Part name / purpose:"],
        ["Size and dimensions", "Target size or critical measurements:"],
        ["Photos and references", "Links or attach notes:"],
        ["Material and color preferences", "PLA/PETG/etc., color:"],
        ["How the part will be used", "Indoor/outdoor, load, heat, chemicals:"],
        ["Strength and detail needs", "Functional vs. cosmetic, tolerance notes:"],
        ["Quantity", "How many copies:"],
        ["Deadline", "Need-by date:"],
        ["Notes", "Anything else the print desk should know:"],
      ].flatMap(([h, hint]) => [
        { size: 12, bold: true, text: h, afterGap: 2 },
        { size: 11, text: blank(hint), afterGap: 10 },
      ]),
      {
        size: 10,
        text: "Mixed Maker Shop — 3D printing and prototypes. Topher@mixedmakershop.com",
      },
    ],
  },
  {
    filename: "ai-workflow-starter-pack.pdf",
    title: "AI Workflow Starter Pack",
    body: [
      ...brandHeader("AI Workflow Starter Pack"),
      {
        size: 11,
        text: "Sketch a helper workflow before you buy tools. Humans stay in charge — AI drafts or sorts, you approve.",
        afterGap: 10,
      },
      ...[
        "What repetitive task do you want help with?",
        "What information goes in?",
        "What should come out?",
        "Who uses it day to day?",
        "How often does it run?",
        "Risks and guardrails (what must NEVER auto-send?)",
      ].flatMap((q) => [
        { size: 12, bold: true, text: q, afterGap: 2 },
        { size: 11, text: blank("Your notes:"), afterGap: 10 },
      ]),
      { size: 12, bold: true, text: "Examples to steal from", afterGap: 4 },
      {
        size: 11,
        text: "- Missed-call follow-up draft (you send the final text)\n- Review request helper (timing + polite script)\n- Quote request organizer (what info before you price)\n- Content idea generator (headlines/outlines you edit)",
        afterGap: 10,
      },
      {
        size: 10,
        text: "Practical automation at Mixed Maker Shop. Topher@mixedmakershop.com",
      },
    ],
  },
  {
    filename: "project-idea-capture-sheet.pdf",
    title: "Project Idea Capture Sheet",
    body: [
      ...brandHeader("Project Idea Capture Sheet"),
      {
        size: 11,
        text: "Capture the idea once — before quotes, builders, or late-night scope creep.",
        afterGap: 10,
      },
      ...[
        "Idea name",
        "Problem it solves",
        "Who it helps (be specific)",
        "What the first version should do",
        "What already exists (tools, sites, spreadsheets)",
        "Fastest responsible next step",
        "Money path (how this earns or saves)",
        "Notes",
      ].map((h) => [
        { size: 12, bold: true, text: h, afterGap: 2 },
        { size: 11, text: blank("Write here:"), afterGap: 10 },
      ]).flat(),
      {
        size: 10,
        text: "Websites, tools, prints — one studio. mixedmakershop.com  |  Topher@mixedmakershop.com",
      },
    ],
  },
];

function buildPdfFromStreams(pageStreams) {
  const pageWidth = 612;
  const pageHeight = 792;

  const objects = [];
  let nextId = 1;

  function pushObj(body) {
    const id = nextId++;
    objects[id] = body;
    return id;
  }

  const fontNormalId = pushObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  const fontBoldId = pushObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

  const contentIds = [];
  const pageIds = [];

  for (const stream of pageStreams) {
    const bufLen = Buffer.byteLength(stream, "binary");
    const contentId = pushObj(`<< /Length ${bufLen} >>\nstream\n${stream}\nendstream`);
    contentIds.push(contentId);
    const pageResources = `<< /Font << /F1 ${fontNormalId} 0 R /F2 ${fontBoldId} 0 R >> >>`;
    const pageId = pushObj(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources ${pageResources} >>`,
    );
    pageIds.push(pageId);
  }

  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  objects[2] = `<< /Type /Pages /Kids [ ${kids} ] /Count ${pageIds.length} >>`;
  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [];

  for (let id = 1; id < nextId; id++) {
    if (!objects[id]) continue;
    offsets[id] = Buffer.byteLength(pdf, "binary");
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "binary");
  let xref = `xref\n0 ${nextId}\n0000000000 65535 f \n`;
  for (let id = 1; id < nextId; id++) {
    if (!objects[id]) {
      xref += "0000000000 65535 f \n";
      continue;
    }
    const off = String(offsets[id]).padStart(10, "0");
    xref += `${off} 00000 n \n`;
  }
  pdf += xref;
  pdf += `trailer\n<< /Size ${nextId} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return pdf;
}

function buildPageStreamFinal(items, pageHeight, margin, includeFooter) {
  const footerLines = includeFooter
    ? [
        "mixedmakershop.com  |  Topher@mixedmakershop.com",
        "One umbrella. Multiple branches. Everything points back to Mixed Maker Shop.",
      ]
    : [];
  return buildPageStream(items, 612, pageHeight, margin, footerLines);
}

function greedyPages(allItems) {
  const margin = 54;
  const pageHeight = 792;
  const streams = [];
  let i = 0;
  while (i < allItems.length) {
    let lo = i + 1;
    let hi = allItems.length;
    let best = i + 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const slice = allItems.slice(i, mid);
      const res = buildPageStreamFinal(slice, pageHeight, margin, true);
      if (!res.truncated) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    const slice = allItems.slice(i, best);
    const res = buildPageStreamFinal(slice, pageHeight, margin, true);
    streams.push(res.stream);
    i = best;
  }
  return streams;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const doc of RESOURCES) {
  const streams = greedyPages(doc.body);
  const pdf = buildPdfFromStreams(streams);
  const outPath = path.join(OUT_DIR, doc.filename);
  fs.writeFileSync(outPath, pdf, "binary");
  console.log("Wrote", outPath, `(${streams.length} page(s))`);
}
