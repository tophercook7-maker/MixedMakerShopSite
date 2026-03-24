"use client";

import Link from "next/link";
import { useState } from "react";
import { ResilientCardImage } from "@/components/sample/resilient-sample-images";
import { PORTFOLIO_SAMPLES } from "@/lib/portfolio-samples";
import { imageCategoryFromPortfolioRouteSlug } from "@/lib/sample-fallback-images";
import {
  WEBSITE_SAMPLES,
  SAMPLE_CATEGORIES,
  hubImageCategoryForWebsiteSample,
  type WebsiteSample,
  type SampleCategory,
} from "@/lib/website-samples";

export default function WebsiteSamplesPage() {
  const [categoryFilter, setCategoryFilter] = useState<SampleCategory | "">("");

  const filtered =
    categoryFilter === ""
      ? WEBSITE_SAMPLES
      : WEBSITE_SAMPLES.filter((s) => s.category === categoryFilter);

  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Website Samples</h1>
          <p className="subhead" style={{ margin: "0 0 20px" }}>
            Real examples of simple sites for local businesses — trades, food, coffee, churches, and more. Pick up ideas
            for your own, or we can build something fully custom.
          </p>

          <div style={{ marginBottom: 36 }}>
            <h2 className="section-heading" style={{ margin: "0 0 8px", fontSize: "1.35rem" }}>
              Proven website examples for local businesses
            </h2>
            <p className="small copy-readable" style={{ margin: "0 0 10px", opacity: 0.9, lineHeight: 1.55 }}>
              These are real examples of simple, high-converting websites built for local businesses.
            </p>
            <p className="small copy-readable" style={{ margin: "0 0 10px", opacity: 0.9, lineHeight: 1.55 }}>
              Each one is designed to help bring in more calls, messages, and customers — without overcomplicating
              things.
            </p>
            <p className="small copy-readable" style={{ margin: "0 0 22px", opacity: 0.9, lineHeight: 1.55 }}>
              Your business can follow a proven layout like these, or we can build something fully custom.
            </p>

            <div
              className="card"
              style={{
                marginBottom: 24,
                padding: "18px 20px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
              }}
            >
              <p className="small" style={{ margin: "0 0 14px", lineHeight: 1.55, maxWidth: 640 }}>
                If you want something like this for your business, I can put together a quick example for you.
              </p>
              <Link href="/free-mockup" className="btn gold" style={{ marginBottom: 10 }}>
                Get My Free Website Preview
              </Link>
              <p className="small copy-readable" style={{ margin: 0, opacity: 0.75, fontStyle: "italic" }}>
                Built for real local businesses — not templates, not fluff.
              </p>
            </div>

            <div className="grid-2">
              {PORTFOLIO_SAMPLES.map((p) => (
                <article
                  key={p.routeSlug}
                  className="card sample-card"
                  style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  <ResilientCardImage
                    primarySrc={p.cardImageUrl}
                    category={imageCategoryFromPortfolioRouteSlug(p.routeSlug)}
                    alt={`${p.title} sample preview thumbnail`}
                    className="sample-hub-card-thumb"
                    placeholderClassName="sample-hub-card-thumb-fallback"
                    devContext={{ hubCardTitle: p.title, routeSlug: p.routeSlug }}
                  />
                  <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <p className="small" style={{ margin: "0 0 6px", opacity: 0.85 }}>
                      {p.category}
                    </p>
                    <h3 style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>{p.title}</h3>
                    <p className="small" style={{ margin: "0 0 14px", flex: 1, lineHeight: 1.45 }}>
                      {p.description}
                    </p>
                    <Link className="btn gold" href={`/samples/${p.routeSlug}`} style={{ alignSelf: "flex-start" }}>
                      View example
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <h2 className="section-heading" style={{ margin: "0 0 16px", fontSize: "1.25rem" }}>
            More examples by industry
          </h2>

          {/* Filter bar - optional, does not hide samples by default */}
          <div
            className="credibility-strip"
            style={{
              padding: "12px 0 20px",
              borderBottom: "1px solid var(--border)",
              marginBottom: 24,
            }}
          >
            <div className="container" style={{ padding: 0 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <span className="small" style={{ fontWeight: 900, marginRight: 8 }}>
                  Filter:
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("")}
                  className={`pill ${categoryFilter === "" ? "gold" : ""}`}
                >
                  All
                </button>
                {SAMPLE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryFilter(c.id)}
                    className={`pill ${categoryFilter === c.id ? "gold" : ""}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {categoryFilter === "" ? (
            SAMPLE_CATEGORIES.map((cat) => {
              const inCat = WEBSITE_SAMPLES.filter((s) => s.category === cat.id);
              if (inCat.length === 0) return null;
              return (
                <div key={cat.id} style={{ marginBottom: 36 }}>
                  <h2 className="section-heading" style={{ marginBottom: 16, fontSize: "1.25rem" }}>
                    {cat.label}
                  </h2>
                  <div className="grid-2">
                    {inCat.map((s) => (
                      <SampleCard key={s.slug} sample={s} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid-2">
              {filtered.map((s) => (
                <SampleCard key={s.slug} sample={s} />
              ))}
            </div>
          )}

          <div
            className="card"
            style={{
              marginTop: 36,
              padding: "22px 22px 24px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="section-heading" style={{ margin: "0 0 12px", fontSize: "1.2rem" }}>
              Want something like this for your business?
            </h2>
            <p className="small" style={{ margin: "0 0 10px", lineHeight: 1.55, maxWidth: 640 }}>
              I can put together a quick example showing what your website could look like and how it could help bring
              in more customers.
            </p>
            <p className="small" style={{ margin: "0 0 18px", lineHeight: 1.55, maxWidth: 640 }}>
              No pressure — just something to help you see what&apos;s possible.
            </p>
            <Link href="/free-mockup" className="btn gold" style={{ marginBottom: 10 }}>
              Get My Free Website Preview
            </Link>
            <p className="small" style={{ margin: 0, opacity: 0.75, fontStyle: "italic", maxWidth: 560 }}>
              Built for real local businesses — not templates, not fluff.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SampleCard({ sample }: { sample: WebsiteSample }) {
  const href = sample.externalHref ?? `/website-samples/${sample.slug}`;
  const category = hubImageCategoryForWebsiteSample(sample);
  return (
    <article
      className="card sample-card"
      style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flex: 1 }}>
        {sample.imageUrl ? (
          <ResilientCardImage
            primarySrc={sample.imageUrl}
            category={category}
            alt={`${sample.name} sample preview`}
            className="sample-hub-card-thumb"
            placeholderClassName="sample-hub-card-thumb-fallback"
            devContext={{ hubCardTitle: sample.name, routeSlug: sample.slug }}
          />
        ) : null}
        <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
          <p className="small" style={{ margin: "0 0 6px", opacity: 0.85 }}>
            {SAMPLE_CATEGORIES.find((c) => c.id === sample.category)?.label ?? "Sample"}
          </p>
          <h3 style={{ margin: "0 0 8px", fontSize: "1.12rem" }}>{sample.name}</h3>
          <p className="small" style={{ margin: 0, flex: 1, lineHeight: 1.45 }}>
            {sample.desc}
          </p>
          <span className="btn gold" style={{ marginTop: 14, alignSelf: "flex-start", display: "inline-block" }}>
            View example
          </span>
        </div>
      </Link>
    </article>
  );
}
