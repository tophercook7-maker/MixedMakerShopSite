import Image from "next/image";
import { MapPin, Phone, TrendingUp } from "lucide-react";
import { PORTFOLIO_SAMPLES } from "@/lib/portfolio-samples";

/**
 * Hero right column: premium “real site” preview + outcome chips (not generic browser chrome).
 * Uses an existing portfolio hero image so the scene feels photographic and credible.
 */
export function HomeSalesVisual() {
  const sample =
    PORTFOLIO_SAMPLES.find((s) => s.routeSlug === "landscaping") ?? PORTFOLIO_SAMPLES[0];

  return (
    <div className="home-hero-offer" aria-hidden="true">
      <div className="home-hero-offer__ambient" />
      <div className="home-hero-offer__blobs" aria-hidden>
        <span className="home-hero-offer__blob home-hero-offer__blob--mint" />
        <span className="home-hero-offer__blob home-hero-offer__blob--gold" />
      </div>

      <div className="home-hero-offer__frame">
        <div className="home-hero-offer__stage">
          <div className="home-hero-offer__orbit">
            <div className="home-hero-offer__float-wrap">
              <article className="home-hero-offer__preview">
                <div className="home-hero-offer__preview-media">
                  <Image
                    src={sample.cardImageUrl}
                    alt=""
                    fill
                    className="home-hero-offer__preview-img object-cover"
                    sizes="(max-width: 1024px) 100vw, 400px"
                    priority
                  />
                  <div className="home-hero-offer__preview-media-shade" />
                  <p className="home-hero-offer__preview-tag">Licensed &amp; insured · Local service</p>
                </div>
                <div className="home-hero-offer__preview-body">
                  <h3 className="home-hero-offer__preview-brand">Heritage Lawn &amp; Landscape</h3>
                  <p className="home-hero-offer__preview-headline">
                    A property that looks maintained — week after week
                  </p>
                  <p className="home-hero-offer__preview-sub">
                    Residential &amp; commercial care · Clear pricing · Serving Hot Springs &amp; nearby towns
                  </p>
                  <div className="home-hero-offer__preview-ctas">
                    <span className="home-hero-offer__preview-cta home-hero-offer__preview-cta--primary">
                      Get a fast quote
                    </span>
                    <span className="home-hero-offer__preview-cta home-hero-offer__preview-cta--ghost">
                      View services
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div className="home-hero-offer__chip home-hero-offer__chip--calls">
            <span className="home-hero-offer__chip-icon" aria-hidden>
              <Phone className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="home-hero-offer__chip-text">
              <span className="home-hero-offer__chip-title">More calls</span>
              <span className="home-hero-offer__chip-meta">Clear CTAs &amp; trust</span>
            </span>
          </div>

          <div className="home-hero-offer__chip home-hero-offer__chip--seo">
            <span className="home-hero-offer__chip-icon" aria-hidden>
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="home-hero-offer__chip-text">
              <span className="home-hero-offer__chip-title">Local SEO</span>
              <span className="home-hero-offer__chip-meta">Found in search</span>
            </span>
          </div>

          <div className="home-hero-offer__chip home-hero-offer__chip--maps">
            <span className="home-hero-offer__chip-icon home-hero-offer__chip-icon--gold" aria-hidden>
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="home-hero-offer__chip-text">
              <span className="home-hero-offer__chip-title">Google visibility</span>
              <span className="home-hero-offer__chip-meta">Maps-ready profile</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
