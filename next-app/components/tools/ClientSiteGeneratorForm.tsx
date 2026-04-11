"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { NicheKey } from "@astro-niche-pack/types/niche";
import type { ClientIntake } from "@/lib/client-site-generator/intake-schema";

const NICHE_OPTIONS: { value: NicheKey; label: string }[] = [
  { value: "lawn-care", label: "lawn-care" },
  { value: "pressure-washing", label: "pressure-washing" },
  { value: "landscaping", label: "landscaping" },
  { value: "junk-removal", label: "junk-removal" },
  { value: "painting", label: "painting" },
  { value: "roofing", label: "roofing" },
];

const PRICING_STYLES = ["estimate", "recurring", "volume", "inspection", "bundle", "mixed"] as const;

function splitLinesOrCommas(s: string): string[] {
  return s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function readFormState(s: FormState): Partial<ClientIntake> & { nicheKey: NicheKey } {
  return {
    clientKey: s.clientKey.trim(),
    businessName: s.businessName.trim(),
    domain: s.domain.trim(),
    nicheKey: s.nicheKey,
    primaryPhone: s.primaryPhone.trim(),
    primaryEmail: s.primaryEmail.trim(),
    city: s.city.trim(),
    state: s.state.trim(),
    stateAbbr: s.stateAbbr.trim().toUpperCase().slice(0, 2),
    serviceAreas: splitLinesOrCommas(s.serviceAreas),
    featuredServices: splitLinesOrCommas(s.featuredServices),
    selectedServices: splitLinesOrCommas(s.selectedServices),
    primaryCtaLabel: s.primaryCtaLabel.trim(),
    primaryCtaHref: s.primaryCtaHref.trim(),
    secondaryCtaLabel: s.secondaryCtaLabel.trim(),
    secondaryCtaHref: s.secondaryCtaHref.trim(),
    heroHeadline: s.heroHeadline.trim(),
    heroSubheadline: s.heroSubheadline.trim(),
    brandDescription: s.brandDescription.trim(),
    trustPoints: splitLinesOrCommas(s.trustPoints),
    reviewPrompt: s.reviewPrompt.trim(),
    offerText: s.offerText.trim(),
    pricingStyle: s.pricingStyle,
    hasGoogleReviews: s.hasGoogleReviews,
    googleReviewLink: s.googleReviewLink.trim(),
    facebookUrl: s.facebookUrl.trim(),
    instagramUrl: s.instagramUrl.trim(),
    logoPath: s.logoPath.trim(),
    notes: s.notes.trim(),
  };
}

type FormState = {
  clientKey: string;
  businessName: string;
  domain: string;
  nicheKey: NicheKey;
  primaryPhone: string;
  primaryEmail: string;
  city: string;
  state: string;
  stateAbbr: string;
  serviceAreas: string;
  featuredServices: string;
  selectedServices: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  heroHeadline: string;
  heroSubheadline: string;
  brandDescription: string;
  trustPoints: string;
  reviewPrompt: string;
  offerText: string;
  pricingStyle: (typeof PRICING_STYLES)[number];
  hasGoogleReviews: boolean;
  googleReviewLink: string;
  facebookUrl: string;
  instagramUrl: string;
  logoPath: string;
  notes: string;
};

const initialForm: FormState = {
  clientKey: "new-client",
  businessName: "New Client LLC",
  domain: "https://example.com",
  nicheKey: "lawn-care",
  primaryPhone: "(501) 555-0000",
  primaryEmail: "hello@example.com",
  city: "Hot Springs",
  state: "Arkansas",
  stateAbbr: "AR",
  serviceAreas: "Hot Springs Village, Lake Hamilton",
  featuredServices: "",
  selectedServices: "lawn-care, lawn-mowing",
  primaryCtaLabel: "",
  primaryCtaHref: "/contact#estimate",
  secondaryCtaLabel: "Pricing",
  secondaryCtaHref: "/pricing",
  heroHeadline: "",
  heroSubheadline: "",
  brandDescription: "",
  trustPoints: "",
  reviewPrompt: "",
  offerText: "",
  pricingStyle: "estimate",
  hasGoogleReviews: false,
  googleReviewLink: "",
  facebookUrl: "",
  instagramUrl: "",
  logoPath: "",
  notes: "",
};

type GenOk = {
  ok: true;
  ts: string;
  intake: ClientIntake;
  localPageSlugs: string[];
  homepagePreview: {
    metaTitle: string;
    metaDescription: string;
    heroHeadline: string;
    heroSubheadline: string;
    coreOffer: string;
    finalCtaTitle: string;
    finalCtaBody: string;
  };
  selectedServicesResolved: { key: string; name: string }[];
  checklist: { done: string[]; todo: string[] };
  registerClientSnippet: string;
  clientKey: string;
};

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const labelCls = "text-sm font-medium text-muted-foreground";

export function ClientSiteGeneratorForm() {
  const [form, setForm] = React.useState<FormState>(initialForm);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [tsOut, setTsOut] = React.useState("");
  const [slugsOut, setSlugsOut] = React.useState("");
  const [metaOut, setMetaOut] = React.useState("");
  const [checklistOut, setChecklistOut] = React.useState("");
  const [intakeJson, setIntakeJson] = React.useState("");

  const runGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const body = readFormState(form);
      const res = await fetch("/api/tools/client-site-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as
        | GenOk
        | { ok: false; issues?: { path: string; message: string }[]; error?: string };

      if (!res.ok || !("ok" in data) || !data.ok) {
        if ("issues" in data && data.issues?.length) {
          setError(data.issues.map((i) => `${i.path}: ${i.message}`).join("\n"));
        } else {
          setError(("error" in data && data.error) || `Request failed (${res.status})`);
        }
        setTsOut("");
        setSlugsOut("");
        setMetaOut("");
        setChecklistOut("");
        setIntakeJson("");
        return;
      }

      const d = data as GenOk;
      setIntakeJson(JSON.stringify(d.intake, null, 2));
      setTsOut(d.ts);
      setSlugsOut(d.localPageSlugs.join("\n"));
      setMetaOut(
        [
          `Title: ${d.homepagePreview.metaTitle}`,
          "",
          `Description: ${d.homepagePreview.metaDescription}`,
          "",
          `Hero: ${d.homepagePreview.heroHeadline}`,
          "",
          d.homepagePreview.heroSubheadline,
          "",
          `Services: ${d.selectedServicesResolved.map((s) => `${s.key} (${s.name})`).join(", ")}`,
        ].join("\n"),
      );
      setChecklistOut(
        [
          "Done:",
          ...d.checklist.done.map((x) => `  ✓ ${x}`),
          "",
          "Still needed:",
          ...d.checklist.todo.map((x) => `  • ${x}`),
          "",
          "Register client:",
          d.registerClientSnippet,
        ].join("\n"),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const applyNicheDefaults = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tools/client-site-generator/defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicheKey: form.nicheKey }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        defaults?: {
          primaryCtaLabel: string;
          primaryCtaHref: string;
          heroHeadline: string;
          heroSubheadline: string;
          offerText: string;
          reviewPrompt: string;
          selectedServices: string[];
          featuredServices: string[];
          trustPoints: string[];
          pricingStyle: FormState["pricingStyle"];
        };
        error?: string;
      };
      if (!res.ok || !data.ok || !data.defaults) {
        setError(data.error || "Failed to load defaults");
        return;
      }
      const def = data.defaults;
      setForm((f) => ({
        ...f,
        primaryCtaLabel: def.primaryCtaLabel,
        primaryCtaHref: def.primaryCtaHref,
        heroHeadline: def.heroHeadline,
        heroSubheadline: def.heroSubheadline,
        offerText: def.offerText,
        reviewPrompt: def.reviewPrompt,
        selectedServices: def.selectedServices.join(", "),
        featuredServices: def.featuredServices.join(", "),
        trustPoints: def.trustPoints.join(", "),
        pricingStyle: def.pricingStyle,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const patch = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Client intake → Astro config</h1>
        <p className="mt-2 max-w-[70ch] text-sm text-muted-foreground">
          Generates <code className="rounded bg-muted px-1 py-0.5 text-xs">ClientConfig</code> TypeScript for{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">fresh-cut-property-care</code>. This page is{" "}
          <strong>noindex</strong> — internal sales / scaffolding tool.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          CLI: <code className="rounded bg-muted px-1 py-0.5 text-xs">cd next-app && npm run generate:client -- scripts/intake.example.json</code>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Intake</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className={cn("grid gap-1")}>
              <span className={labelCls}>clientKey (kebab-case)</span>
              <Input value={form.clientKey} onChange={(e) => patch("clientKey", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Business name</span>
              <Input value={form.businessName} onChange={(e) => patch("businessName", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Domain (https://…)</span>
              <Input value={form.domain} onChange={(e) => patch("domain", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Niche</span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.nicheKey}
                onChange={(e) => patch("nicheKey", e.target.value as NicheKey)}
              >
                {NICHE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Phone</span>
              <Input value={form.primaryPhone} onChange={(e) => patch("primaryPhone", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Email</span>
              <Input type="email" value={form.primaryEmail} onChange={(e) => patch("primaryEmail", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>City</span>
              <Input value={form.city} onChange={(e) => patch("city", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>State</span>
              <Input value={form.state} onChange={(e) => patch("state", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>ST</span>
              <Input maxLength={2} value={form.stateAbbr} onChange={(e) => patch("stateAbbr", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Pricing style</span>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.pricingStyle}
                onChange={(e) => patch("pricingStyle", e.target.value as FormState["pricingStyle"])}
              >
                {PRICING_STYLES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1">
            <span className={labelCls}>Service areas (comma or newline — match known cities)</span>
            <textarea
              className="min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.serviceAreas}
              onChange={(e) => patch("serviceAreas", e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Selected services (keys, comma-separated)</span>
            <textarea
              className="min-h-[3.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.selectedServices}
              onChange={(e) => patch("selectedServices", e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Featured services (optional)</span>
            <textarea
              className="min-h-[3.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.featuredServices}
              onChange={(e) => patch("featuredServices", e.target.value)}
              placeholder="pressure-washing, concrete-cleaning"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className={labelCls}>Primary CTA label</span>
              <Input value={form.primaryCtaLabel} onChange={(e) => patch("primaryCtaLabel", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Primary CTA href</span>
              <Input value={form.primaryCtaHref} onChange={(e) => patch("primaryCtaHref", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Secondary CTA label</span>
              <Input value={form.secondaryCtaLabel} onChange={(e) => patch("secondaryCtaLabel", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Secondary CTA href</span>
              <Input value={form.secondaryCtaHref} onChange={(e) => patch("secondaryCtaHref", e.target.value)} />
            </label>
          </div>

          <label className="grid gap-1">
            <span className={labelCls}>Hero headline</span>
            <Input value={form.heroHeadline} onChange={(e) => patch("heroHeadline", e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Hero subheadline</span>
            <textarea
              className="min-h-[4rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.heroSubheadline}
              onChange={(e) => patch("heroSubheadline", e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Brand description</span>
            <textarea
              className="min-h-[4rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.brandDescription}
              onChange={(e) => patch("brandDescription", e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Trust points (comma-separated)</span>
            <textarea
              className="min-h-[3rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.trustPoints}
              onChange={(e) => patch("trustPoints", e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Offer / core offer</span>
            <textarea
              className="min-h-[3rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.offerText}
              onChange={(e) => patch("offerText", e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelCls}>Review prompt</span>
            <textarea
              className="min-h-[3rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.reviewPrompt}
              onChange={(e) => patch("reviewPrompt", e.target.value)}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-1">
              <span className={labelCls}>Logo path (optional)</span>
              <Input value={form.logoPath} onChange={(e) => patch("logoPath", e.target.value)} placeholder="/logo.svg" />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Facebook URL</span>
              <Input value={form.facebookUrl} onChange={(e) => patch("facebookUrl", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Instagram URL</span>
              <Input value={form.instagramUrl} onChange={(e) => patch("instagramUrl", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className={labelCls}>Google review URL</span>
              <Input value={form.googleReviewLink} onChange={(e) => patch("googleReviewLink", e.target.value)} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.hasGoogleReviews} onChange={(e) => patch("hasGoogleReviews", e.target.checked)} />
            Link Google reviews (uses review URL above)
          </label>

          <label className="grid gap-1">
            <span className={labelCls}>Notes (internal)</span>
            <textarea
              className="min-h-[3rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.notes}
              onChange={(e) => patch("notes", e.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={loading} onClick={() => void runGenerate()}>
              {loading ? "Working…" : "Generate preview"}
            </Button>
            <Button type="button" variant="secondary" disabled={loading} onClick={() => void applyNicheDefaults()}>
              Apply niche defaults to CTAs / hero
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p className="whitespace-pre-wrap rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-lg">Generated client config (.ts)</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!tsOut}
              onClick={() => tsOut && void navigator.clipboard.writeText(tsOut)}
            >
              Copy
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={!tsOut} onClick={() => tsOut && download(`${form.clientKey || "client"}.ts`, tsOut)}>
              Download .ts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto rounded-md border bg-muted/30 p-3 text-xs">{tsOut || "—"}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-lg">Local page slugs</CardTitle>
          <Button type="button" variant="secondary" size="sm" disabled={!slugsOut} onClick={() => slugsOut && void navigator.clipboard.writeText(slugsOut)}>
            Copy slugs
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{slugsOut || "—"}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metadata + hero preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{metaOut || "—"}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{checklistOut || "—"}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-lg">Export intake JSON</CardTitle>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!intakeJson}
            onClick={() => intakeJson && download(`${form.clientKey || "intake"}-intake.json`, intakeJson)}
          >
            Download intake.json
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Populated after a successful generate (form payload sent to the API).</p>
        </CardContent>
      </Card>
    </div>
  );
}
