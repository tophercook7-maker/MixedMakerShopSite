"use client";

import type { WebSourcePlatform } from "@/lib/crm/web-source-normalize";
import { sourcePlatformLabel } from "@/lib/crm/web-source-normalize";

const PLATFORMS: WebSourcePlatform[] = [
  "google_maps",
  "google_search",
  "facebook",
  "manual",
  "extension",
  "quick_add",
  "import",
  "unknown",
];

export type WebCrmFilterState = {
  search: string;
  sourcePlatform: WebSourcePlatform | "";
  hasWebsite: "" | "yes" | "no";
  hasEmail: boolean;
  hasFacebook: boolean;
  hasPhone: boolean;
  category: string;
  city: string;
  highScoreOnly: boolean;
  mockupActiveOnly: boolean;
};

export const defaultWebCrmFilters: WebCrmFilterState = {
  search: "",
  sourcePlatform: "",
  hasWebsite: "",
  hasEmail: false,
  hasFacebook: false,
  hasPhone: false,
  category: "",
  city: "",
  highScoreOnly: false,
  mockupActiveOnly: false,
};

export function WebCrmFilters({
  value,
  onChange,
}: {
  value: WebCrmFilterState;
  onChange: (next: WebCrmFilterState) => void;
}) {
  const set = (patch: Partial<WebCrmFilterState>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1 text-xs col-span-full md:col-span-2">
        <span style={{ color: "var(--admin-muted)" }}>Search</span>
        <input
          className="admin-input text-sm"
          placeholder="Business, city, notes, source query…"
          value={value.search}
          onChange={(e) => set({ search: e.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: "var(--admin-muted)" }}>Source platform</span>
        <select
          className="admin-input text-sm"
          value={value.sourcePlatform}
          onChange={(e) => set({ sourcePlatform: e.target.value as WebSourcePlatform | "" })}
        >
          <option value="">Any</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {sourcePlatformLabel(p)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: "var(--admin-muted)" }}>Website</span>
        <select
          className="admin-input text-sm"
          value={value.hasWebsite}
          onChange={(e) => set({ hasWebsite: e.target.value as WebCrmFilterState["hasWebsite"] })}
        >
          <option value="">Any</option>
          <option value="yes">Has website</option>
          <option value="no">No website</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: "var(--admin-muted)" }}>City</span>
        <input
          className="admin-input text-sm"
          value={value.city}
          onChange={(e) => set({ city: e.target.value })}
          placeholder="Filter city"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span style={{ color: "var(--admin-muted)" }}>Category</span>
        <input
          className="admin-input text-sm"
          value={value.category}
          onChange={(e) => set({ category: e.target.value })}
          placeholder="Contains…"
        />
      </label>
      <div className="flex flex-wrap gap-3 items-end text-xs col-span-full">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={value.hasEmail} onChange={(e) => set({ hasEmail: e.target.checked })} />
          Has email
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={value.hasPhone} onChange={(e) => set({ hasPhone: e.target.checked })} />
          Has phone
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={value.hasFacebook} onChange={(e) => set({ hasFacebook: e.target.checked })} />
          Has Facebook
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.highScoreOnly}
            onChange={(e) => set({ highScoreOnly: e.target.checked })}
          />
          High score (50+)
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.mockupActiveOnly}
            onChange={(e) => set({ mockupActiveOnly: e.target.checked })}
          />
          Mockup active
        </label>
      </div>
    </div>
  );
}
