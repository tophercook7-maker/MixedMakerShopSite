"use client";

import Link from "next/link";
import { useState } from "react";
import { ResilientCardImage } from "@/components/sample/resilient-sample-images";
import { PORTFOLIO_SAMPLES } from "@/lib/portfolio-samples";
import { imageCategoryFromPortfolioRouteSlug } from "@/lib/sample-fallback-images";
import {
  WEBSITE_SAMPLES,
  SAMPLE_CATEGORIES,
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
            Polished portfolio examples for common local trades (always available), plus interactive concepts — coffee,
            restaurants, churches, and more. Yours can follow any of these or go fully custom.
          </p>

          <div style={{ marginBottom: 36 }}>
            <h2 className="section-heading" style={{ margin: "0 0 8px", fontSize: "1.35rem" }}>
              Evergreen portfolio samples
            </h2>
            <p className="small" style={{ margin: "0 0 18px", opacity: 0.9, maxWidth: 720 }}>
              Ready-to-send homepage demos for pressure washing, detailing, landscaping, plumbing/HVAC, and restaurant /
              food truck. These are permanent public pages — separate from CRM-generated previews for individual leads.
            </p>
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
                      Open preview
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <h2 className="section-heading" style={{ margin: "0 0 16px", fontSize: "1.25rem" }}>
            More sample concepts
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
            <div className="container" style={{ padding: 0, maxWidth: "var(--max)" }}>
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

          <div className="btn-row" style={{ marginTop: 28 }}>
            <Link href="/#free-mockup-request" className="btn gold">
              Get My Free Mockup
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SampleCard({ sample }: { sample: WebsiteSample }) {
  const href = sample.externalHref ?? `/website-samples/${sample.slug}`;
  return (
    <Link
      href={href}
      className="card sample-card"
      style={{ textDecoration: "none" }}
    >
      <p className="small" style={{ margin: "0 0 4px", opacity: 0.85 }}>
        {SAMPLE_CATEGORIES.find((c) => c.id === sample.category)?.label ?? "Sample"}
      </p>
      <h3 style={{ margin: "0 0 6px" }}>{sample.name}</h3>
      <span className="small" style={{ display: "block" }}>
        {sample.desc}
      </span>
    </Link>
  );
}
