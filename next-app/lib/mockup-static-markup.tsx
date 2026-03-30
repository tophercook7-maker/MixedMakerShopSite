import "server-only";

/**
 * Server-safe static markup for CRM mockup HTML export.
 * Mirrors presentation layout from sample-draft-client (no client hooks / resilient loaders).
 */

import type { CSSProperties } from "react";
import type { SampleDraft } from "@/lib/sample-draft-types";
import {
  inferImageCategoryFromDraftPick,
  SAMPLE_CATEGORY_FALLBACK_CARD,
  SAMPLE_CATEGORY_FALLBACK_HERO,
  isNonEmptyImageUrl,
  type SampleImageCategory,
} from "@/lib/sample-fallback-images";
import { inferGallerySectionLead, inferServicesSectionLead } from "@/lib/sample-section-copy";

function withDraftDefaults(d: SampleDraft): SampleDraft {
  return {
    ...d,
    gallerySectionTitle: d.gallerySectionTitle ?? "Gallery",
    galleryImages: d.galleryImages ?? [],
    whyChooseTitle: d.whyChooseTitle ?? "Why choose us",
    whyChooseBullets: d.whyChooseBullets ?? [],
  };
}

function facebookHref(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t.replace(/^\/+/, "")}`;
}

function heroExportSrc(primary: string | null | undefined, category: SampleImageCategory): string {
  if (isNonEmptyImageUrl(primary)) return String(primary).trim();
  return SAMPLE_CATEGORY_FALLBACK_HERO[category] ?? SAMPLE_CATEGORY_FALLBACK_HERO["default-service-business"];
}

function cardExportSrc(primary: string | null | undefined, category: SampleImageCategory): string {
  if (isNonEmptyImageUrl(primary)) return String(primary).trim();
  return SAMPLE_CATEGORY_FALLBACK_CARD[category] ?? SAMPLE_CATEGORY_FALLBACK_CARD["default-service-business"];
}

export type MockupStaticMarkupProps = {
  draft: SampleDraft;
  /** Explicit category or from embedOptions.imageCategoryKey */
  imageCategoryKey: SampleImageCategory;
  cssVars: CSSProperties;
  footerMessage: string;
  aboutBeforeTrust: boolean;
  testimonialsBeforeTrustBullets: boolean;
};

export function MockupStaticMarkup({
  draft: draftIn,
  imageCategoryKey,
  cssVars,
  footerMessage,
  aboutBeforeTrust,
  testimonialsBeforeTrustBullets,
}: MockupStaticMarkupProps) {
  const draft = withDraftDefaults(draftIn);
  const telHref = `tel:${draft.phone.replace(/[^\d]/g, "")}`;
  const galleryList = draft.galleryImages ?? [];
  const whyBullets = draft.whyChooseBullets ?? [];
  const secondaryHref = "#services";
  const portfolioCopy = true;
  const singleHeroCta = true;
  const mailHref = draft.contactEmail?.trim()
    ? `mailto:${encodeURIComponent(draft.contactEmail.trim())}`
    : "";
  const fbHref = facebookHref(draft.contactFacebookUrl?.trim() || "");
  const showWhyOrTrust = whyBullets.length > 0 || (draft.trustQuotes?.length ?? 0) > 0;
  const imageCategory: SampleImageCategory = imageCategoryKey ?? inferImageCategoryFromDraftPick(draft);
  const servicesLead = inferServicesSectionLead(draft, portfolioCopy);
  const galleryLead = inferGallerySectionLead(draft, portfolioCopy);
  const servicesNavLabel = draft.servicesNavLabel ?? "Services";
  const serviceCardHref = draft.serviceCardsLinkToContact ? "#contact" : telHref;
  const serviceCardLabel = draft.serviceCardsLinkToContact
    ? (draft.serviceCardContactCtaLabel ?? "Learn more")
    : draft.heroPrimaryCta;
  const heroSrc = heroExportSrc(draft.heroImageUrl, imageCategory);

  const aboutSection = (
    <section className="section sample-section" id="about">
      <div className="container">
        <h2 className="sample-h2">{draft.aboutTitle}</h2>
        <p className="sample-sub sample-about-body">{draft.aboutText}</p>
        {draft.aboutCtaLabel ? (
          <div className="btn-row" style={{ marginTop: 22 }}>
            <a href={telHref} className="btn gold">
              {draft.aboutCtaLabel}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );

  const whyTrustSection =
    showWhyOrTrust ? (
      <section className="section sample-section sample-why-trust" id="why">
        <div className="container">
          {testimonialsBeforeTrustBullets ? (
            <>
              {(draft.trustQuotes?.length ?? 0) > 0 ? (
                <>
                  <h2 className="sample-h2">{draft.trustTitle}</h2>
                  <div className="sample-testimonial-grid">
                    {draft.trustQuotes!.map((entry) => (
                      <blockquote key={entry.by} className="sample-quote-minimal">
                        <p className="sample-quote-text">&ldquo;{entry.quote}&rdquo;</p>
                        <footer className="sample-quote-by">— {entry.by}</footer>
                      </blockquote>
                    ))}
                  </div>
                </>
              ) : null}
              {whyBullets.length > 0 ? (
                <>
                  <h2
                    className={`sample-h2${(draft.trustQuotes?.length ?? 0) > 0 ? " sample-h2-trust-follow" : ""}`}
                  >
                    {draft.whyChooseTitle}
                  </h2>
                  <div className="sample-why-grid">
                    {whyBullets.map((line, idx) => (
                      <div key={idx} className="sample-why-card">
                        <span className="sample-why-index" aria-hidden="true">
                          {idx + 1}
                        </span>
                        <p className="sample-why-text">{line}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <>
              {whyBullets.length > 0 ? (
                <>
                  <h2 className="sample-h2">{draft.whyChooseTitle}</h2>
                  <div className="sample-why-grid">
                    {whyBullets.map((line, idx) => (
                      <div key={idx} className="sample-why-card">
                        <span className="sample-why-index" aria-hidden="true">
                          {idx + 1}
                        </span>
                        <p className="sample-why-text">{line}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              {(draft.trustQuotes?.length ?? 0) > 0 ? (
                <>
                  <h2 className={`sample-h2${whyBullets.length > 0 ? " sample-h2-trust-follow" : ""}`}>
                    {draft.trustTitle}
                  </h2>
                  <div className="sample-testimonial-grid">
                    {draft.trustQuotes!.map((entry) => (
                      <blockquote key={entry.by} className="sample-quote-minimal">
                        <p className="sample-quote-text">&ldquo;{entry.quote}&rdquo;</p>
                        <footer className="sample-quote-by">— {entry.by}</footer>
                      </blockquote>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      </section>
    ) : null;

  const aboutAndTrustOrdered = aboutBeforeTrust ? (
    <>
      {aboutSection}
      {whyTrustSection}
    </>
  ) : (
    <>
      {whyTrustSection}
      {aboutSection}
    </>
  );

  return (
    <div className="sample-standalone is-presentation sample-standalone--wide" style={cssVars}>
      <nav className="sample-site-nav">
        <div className="container sample-site-nav-inner">
          <a href="#top" className="sample-site-brand">
            {draft.businessName}
          </a>
          <div className="sample-site-links">
            <a href="#services">{servicesNavLabel}</a>
            {galleryList.length ? <a href="#gallery">Gallery</a> : null}
            {showWhyOrTrust ? <a href="#why">Why choose us</a> : null}
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>
      <header className="sample-hero">
        <div className="container" id="top">
          <div className="sample-hero-grid">
            <div className="sample-hero-content">
              <p className="sample-business-name">{draft.businessName}</p>
              <p className="sample-tagline">{draft.tagline}</p>
              <h1 className="sample-h1">{draft.heroHeadline}</h1>
              <p className="sample-sub">{draft.heroSub}</p>
              {draft.localPositioning ? <p className="sample-local">{draft.localPositioning}</p> : null}
              <div className="btn-row">
                <a href={telHref} className="btn gold">
                  {draft.heroPrimaryCta}
                </a>
                {!singleHeroCta ? (
                  <a href={secondaryHref} className="btn ghost">
                    {draft.heroSecondaryCta}
                  </a>
                ) : null}
              </div>
            </div>
            <figure className="sample-hero-spotlight" aria-label={draft.heroImageAlt ?? `${draft.businessName} featured image`}>
              <img src={heroSrc} alt={draft.heroImageAlt ?? `${draft.businessName} featured image`} />
              <div className="sample-hero-image-overlay" aria-hidden="true" />
            </figure>
          </div>
        </div>
      </header>

      <section className="section sample-section" id="services">
        <div className="container">
          <h2 className="sample-h2">{draft.offeringsTitle}</h2>
          <p className="sample-sub sample-section-lead">{servicesLead}</p>
          <div className="how-it-works-grid sample-service-grid">
            {draft.offerings.map((item) => (
              <article key={item.name} className="how-it-works-card sample-service-card">
                <img
                  src={cardExportSrc(item.image, imageCategory)}
                  alt={item.imageAlt ?? `${item.name} — ${draft.businessName}`}
                  className="sample-service-card-image"
                />
                <h3 className="how-it-works-title">{item.name}</h3>
                <p className="how-it-works-copy">{item.text}</p>
                <a href={serviceCardHref} className="sample-service-card-cta">
                  {serviceCardLabel}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {galleryList.length ? (
        <section className="section sample-section sample-gallery-section" id="gallery">
          <div className="container">
            <h2 className="sample-h2">{draft.gallerySectionTitle}</h2>
            <p className="sample-sub sample-section-lead">{galleryLead}</p>
            <div className="sample-gallery-grid">
              {galleryList.map((src, idx) => (
                <img
                  key={`${src}-${idx}`}
                  src={cardExportSrc(src, imageCategory)}
                  alt={draft.galleryImageAlts?.[idx] ?? `${draft.businessName} gallery photo ${idx + 1}`}
                  className="sample-gallery-tile"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {aboutAndTrustOrdered}

      <section className="section sample-section sample-mid-cta" id="cta">
        <div className="container sample-mid-cta-inner">
          <h2 className="sample-mid-cta-title">{draft.finalTitle}</h2>
          <p className="sample-mid-cta-sub">{draft.finalSub}</p>
          <a href={telHref} className="btn gold sample-mid-cta-btn">
            {draft.finalCta}
          </a>
        </div>
      </section>

      <section className="section sample-section sample-contact-block" id="contact">
        <div className="container">
          <h2 className="sample-h2">{draft.locationTitle}</h2>
          <div className="sample-contact-grid">
            <div className="sample-contact-cell">
              <span className="sample-contact-k">Phone</span>
              <a href={telHref} className="sample-contact-v">
                {draft.phone}
              </a>
            </div>
            {mailHref ? (
              <div className="sample-contact-cell">
                <span className="sample-contact-k">Email</span>
                <a href={mailHref} className="sample-contact-v">
                  {draft.contactEmail}
                </a>
              </div>
            ) : null}
            {fbHref ? (
              <div className="sample-contact-cell">
                <span className="sample-contact-k">Facebook</span>
                <a href={fbHref} className="sample-contact-v" target="_blank" rel="noopener noreferrer">
                  Profile
                </a>
              </div>
            ) : null}
            <div className="sample-contact-cell sample-contact-cell-span">
              <span className="sample-contact-k">Location</span>
              <p className="sample-contact-v sample-contact-plain">{draft.locationName}</p>
              <p className="sample-contact-v sample-contact-plain">{draft.address}</p>
            </div>
            <div className="sample-contact-cell sample-contact-cell-span">
              <span className="sample-contact-k">Hours</span>
              <ul className="sample-hours-list">
                {draft.hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="section sample-section" style={{ paddingTop: 0 }}>
        <div className="container">
          <p
            className="small"
            style={{
              margin: 0,
              textAlign: "center",
              opacity: 0.88,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
            }}
          >
            {footerMessage.trim() ||
              "Design concept for a local business website — built to show layout, structure, and flow."}
          </p>
        </div>
      </footer>
    </div>
  );
}
