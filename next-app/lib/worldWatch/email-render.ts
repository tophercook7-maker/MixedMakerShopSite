export type WeeklyEmailDraft = {
  subject: string;
  previewText: string;
  opening: string;
  biblicalBlock: { title: string; body: string; sourceLine: string };
  globalBlocks: { title: string; summary: string }[];
  prophecyBlock: { title: string; body: string } | null;
  closing: string;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nlToBr(s: string): string {
  return esc(s).replace(/\n/g, "<br/>");
}

export function renderWeeklyEmailHtml(draft: WeeklyEmailDraft, opts: { siteBase: string }): string {
  const { siteBase } = opts;
  const ww = `${siteBase}/world-watch`;
  const acct = `${siteBase}/account`;

  const globalHtml = draft.globalBlocks
    .map(
      (g) => `
<tr><td style="padding:12px 0;border-top:1px solid #1e293b;">
  <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#e2e8f0;">${esc(g.title)}</p>
  <p style="margin:0;font-size:14px;line-height:1.55;color:#94a3b8;">${nlToBr(g.summary)}</p>
</td></tr>`
    )
    .join("");

  const prophecyHtml = draft.prophecyBlock
    ? `
<tr><td style="padding:16px 0;border-top:1px solid #1e293b;">
  <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">Prophecy watch</p>
  <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#e2e8f0;">${esc(draft.prophecyBlock.title)}</p>
  <p style="margin:0;font-size:14px;line-height:1.55;color:#94a3b8;">${nlToBr(draft.prophecyBlock.body)}</p>
</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0b1016;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${esc(draft.previewText)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b1016;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" style="max-width:560px;border-collapse:collapse;">
<tr><td style="padding:0 0 20px 0;text-align:center;">
  <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#5f8f86;">Deep Well Audio</p>
  <h1 style="margin:10px 0 0 0;font-size:22px;font-weight:500;color:#f1f5f9;">Deep Well Weekly</h1>
</td></tr>
<tr><td style="padding:20px 22px;border:1px solid #1e293b;border-radius:14px;background:#0f141a;">
  <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#cbd5e1;">${nlToBr(draft.opening)}</p>
  <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">Biblical insight</p>
  <h2 style="margin:0 0 10px 0;font-size:17px;font-weight:600;color:#f1f5f9;">${esc(draft.biblicalBlock.title)}</h2>
  <p style="margin:0 0 14px 0;font-size:14px;line-height:1.55;color:#94a3b8;">${nlToBr(draft.biblicalBlock.body)}</p>
  <p style="margin:0 0 20px 0;font-size:12px;color:#64748b;">${esc(draft.biblicalBlock.sourceLine)}</p>
  <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">Global awareness</p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${globalHtml}</table>
  ${prophecyHtml}
  <p style="margin:20px 0 0 0;padding-top:16px;border-top:1px solid #1e293b;font-size:14px;line-height:1.55;color:#94a3b8;">${nlToBr(draft.closing)}</p>
</td></tr>
<tr><td style="padding:22px 8px 0 8px;text-align:center;">
  <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">
    <a href="${ww}" style="color:#7dd3c0;text-decoration:none;">World Watch</a>
    &nbsp;·&nbsp;
    <a href="${acct}" style="color:#7dd3c0;text-decoration:none;">Account</a>
  </p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function renderWeeklyEmailText(draft: WeeklyEmailDraft, opts: { siteBase: string }): string {
  const { siteBase } = opts;
  const lines = [
    "Deep Well Weekly",
    "",
    draft.opening,
    "",
    "BIBLICAL INSIGHT",
    draft.biblicalBlock.title,
    draft.biblicalBlock.body,
    `— ${draft.biblicalBlock.sourceLine}`,
    "",
    "GLOBAL AWARENESS",
    ...draft.globalBlocks.flatMap((g) => [`• ${g.title}`, g.summary, ""]),
  ];
  if (draft.prophecyBlock) {
    lines.push("PROPHECY WATCH", draft.prophecyBlock.title, draft.prophecyBlock.body, "");
  }
  lines.push(draft.closing, "", `World Watch: ${siteBase}/world-watch`, `Account: ${siteBase}/account`);
  return lines.filter((l) => l !== undefined).join("\n");
}
