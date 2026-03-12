"use client";

import Link from "next/link";
import { useState } from "react";
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
            Example sites in different styles — coffee shops, restaurants, churches, redesigns. Yours can follow one of
            these or go fully custom.
          </p>

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
      {sample.imageUrl && (
        <div style={{ margin: "-16px -16px 12px -16px", borderRadius: "var(--radius) var(--radius) 0 0", overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sample.imageUrl}
            alt=""
            style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
          />
        </div>
      )}
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
