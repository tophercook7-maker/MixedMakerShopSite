/** Minimal draft fields for niche section intros (avoids circular imports with sample-draft-client). */
export type SectionCopyDraftPick = {
  servicesSectionLead?: string;
  gallerySectionLead?: string;
  contactBandTitle?: string;
  contactBandSub?: string;
  offeringsTitle: string;
  tagline: string;
  businessName: string;
  heroHeadline: string;
};

function haystack(draft: SectionCopyDraftPick): string {
  return `${draft.offeringsTitle} ${draft.tagline} ${draft.businessName} ${draft.heroHeadline}`.toLowerCase();
}

export function inferContactBandTitle(draft: SectionCopyDraftPick, portfolioCopy: boolean): string {
  if (draft.contactBandTitle) return draft.contactBandTitle;
  if (portfolioCopy) return "Get in touch";
  const hay = `${draft.tagline} ${draft.businessName} ${draft.offeringsTitle}`.toLowerCase();
  if (
    hay.includes("pressure") ||
    hay.includes("power wash") ||
    hay.includes("soft wash") ||
    (hay.includes("wash") && hay.includes("exterior"))
  ) {
    return "Get a free estimate";
  }
  if (hay.includes("church") || hay.includes("worship") || hay.includes("fellowship")) {
    return "Questions before your first visit?";
  }
  if (hay.includes("plumb")) return "Need help today?";
  if (hay.includes("coffee") || hay.includes("latte")) return "Visit or order ahead";
  if (hay.includes("restaurant") || hay.includes("southern") || hay.includes("diner")) return "Reserve or order";
  if (hay.includes("lawn") || hay.includes("mow")) return "Request service";
  return "Get in touch";
}

export function inferContactBandSub(draft: SectionCopyDraftPick, portfolioCopy: boolean): string {
  if (draft.contactBandSub) return draft.contactBandSub;
  if (portfolioCopy) {
    return "Reach out by phone or email — we are happy to answer questions.";
  }
  const hay = `${draft.tagline} ${draft.businessName} ${draft.offeringsTitle}`.toLowerCase();
  if (
    hay.includes("pressure") ||
    hay.includes("power wash") ||
    hay.includes("soft wash") ||
    (hay.includes("wash") && hay.includes("exterior"))
  ) {
    return "Send photos of the areas to wash — we will confirm scope and reply with pricing and the next open dates.";
  }
  if (hay.includes("church") || hay.includes("worship") || hay.includes("fellowship")) {
    return "Call the office for directions, kids check-in, or accessibility questions — we are glad to help you feel at home.";
  }
  if (hay.includes("plumb")) {
    return "Emergency line or office — tell us what is going on and we will give you a straight answer and next steps.";
  }
  if (hay.includes("coffee") || hay.includes("latte")) {
    return "Call ahead for large orders or ask about hours — we love seeing regulars and first-timers alike.";
  }
  if (hay.includes("restaurant") || hay.includes("southern") || hay.includes("diner")) {
    return "Book a table, ask about tonight's specials, or arrange takeout — we will confirm what works for your group.";
  }
  if (hay.includes("lawn") || hay.includes("mow")) {
    return "Text or call with your address and what you need — we will follow up with timing and a clear quote.";
  }
  return "Reach out by phone — on a live site this strip often includes email and a short form too.";
}

/** Niche-aware intro lines under section headings when draft does not override. */
export function inferServicesSectionLead(draft: SectionCopyDraftPick, portfolioCopy: boolean): string {
  if (draft.servicesSectionLead != null && draft.servicesSectionLead !== "") {
    return draft.servicesSectionLead;
  }
  if (portfolioCopy) {
    return "Straightforward options so customers know what you offer and how to get started.";
  }
  const hay = haystack(draft);
  if (
    hay.includes("pressure") ||
    hay.includes("power wash") ||
    hay.includes("soft wash") ||
    (hay.includes("siding") && hay.includes("wash")) ||
    (hay.includes("wash") && (hay.includes("driveway") || hay.includes("concrete") || hay.includes("deck")))
  ) {
    return "Flatwork, siding, and outdoor surfaces — each job gets the right pressure and detergents so stains lift without damage.";
  }
  if (
    hay.includes("church") ||
    hay.includes("worship") ||
    hay.includes("ministr") ||
    hay.includes("fellowship") ||
    hay.includes("gospel")
  ) {
    return "A quick overview of weekly worship, kids and students, and how we grow together during the week.";
  }
  if (hay.includes("plumb") || hay.includes("drain") || hay.includes("sewer") || hay.includes("water heater")) {
    return "Straightforward services so homeowners know exactly when to call — emergencies, drains, and water heaters.";
  }
  if (
    hay.includes("coffee") ||
    hay.includes("latte") ||
    hay.includes("espresso") ||
    (hay.includes("cafe") && hay.includes("pastry"))
  ) {
    return "Fan favorites and everyday orders — easy to scan on a phone before you visit or order ahead.";
  }
  if (
    hay.includes("restaurant") ||
    hay.includes("southern") ||
    hay.includes("dinner") ||
    hay.includes("kitchen") ||
    hay.includes("menu")
  ) {
    return "Popular picks and meal-time sections so guests can decide fast and book or call with confidence.";
  }
  if (hay.includes("lawn") || hay.includes("mow") || hay.includes("yard") || hay.includes("turf")) {
    return "Core services spelled out clearly — so neighbors know what you handle and how to get on the schedule.";
  }
  return "Clear offerings help visitors see what you do and take the next step without guessing.";
}

export function inferGallerySectionLead(draft: SectionCopyDraftPick, portfolioCopy: boolean): string {
  if (draft.gallerySectionLead != null && draft.gallerySectionLead !== "") {
    return draft.gallerySectionLead;
  }
  if (portfolioCopy) {
    return "A look at the quality and atmosphere customers can expect.";
  }
  const hay = haystack(draft);
  if (
    hay.includes("pressure") ||
    hay.includes("power wash") ||
    hay.includes("soft wash") ||
    (hay.includes("wash") && hay.includes("exterior"))
  ) {
    return "Finished driveways, bright siding, and clean decks — real jobs that show what a professional wash can do.";
  }
  if (
    hay.includes("church") ||
    hay.includes("worship") ||
    hay.includes("ministr") ||
    hay.includes("fellowship")
  ) {
    return "Real moments from worship, gatherings, and life together — the kind of warmth guests can expect.";
  }
  if (hay.includes("plumb")) {
    return "On-the-job shots that show the kind of work we do in real Hot Springs homes.";
  }
  if (hay.includes("coffee") || hay.includes("latte")) {
    return "A peek inside the bar, the pastry case, and the vibe — your photos would replace these on a live site.";
  }
  if (hay.includes("restaurant") || hay.includes("southern") || hay.includes("diner")) {
    return "Plates, the dining room, and the feel of the place — food photography sells the visit.";
  }
  if (hay.includes("lawn") || hay.includes("mow")) {
    return "Clean edges, healthy turf, and seasonal cleanups — proof of work neighbors notice.";
  }
  return "Photos from real jobs and gatherings build trust before the first visit or call.";
}
