"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { leadHasStandaloneWebsite } from "@/lib/crm-lead-schema";
import { laneLabel } from "@/lib/crm/web-lead-lane";
import { buildLeadSummary, deriveLeadPriority, displayLeadSourceLabel } from "@/lib/crm/lead-display";
import { toWebLeadViewModel } from "@/lib/crm/web-lead-view-model";
import { buildLeadPath } from "@/lib/lead-route";
import { getLeadPriorityBadges, leadStatusClass, prettyLeadStatus } from "@/components/admin/lead-visuals";
import { BackToLeadsLink } from "@/components/admin/crm/back-to-leads-link";
import { ClientSiteDraftPreviewLink } from "@/components/admin/client-site-draft-preview-link";
import { LeadActivityTimeline } from "@/components/admin/lead-activity-timeline";
import { LeadDealTrackingCard } from "@/components/admin/lead-deal-tracking-card";
import { LeadFollowUpPanel } from "@/components/admin/lead-follow-up-panel";
import { LeadMockupSharePanel } from "@/components/admin/lead-mockup-share-panel";
import { LeadPitchPanel } from "@/components/admin/lead-pitch-panel";
import { LeadPrimaryActions } from "@/components/admin/lead-primary-actions";
import { ConvertLeadToProject } from "@/components/admin/crm/convert-lead-to-project";
import { LeadPriorityEditor } from "@/components/admin/crm/lead-priority-editor";
import { LeadSuggestedResponse } from "@/components/admin/lead-suggested-response";
import { LeadContactNow } from "@/components/admin/lead-contact-now";
import { LeadFollowUpChecklist } from "@/components/admin/crm/lead-follow-up-checklist";
import { WebLeadContactPaths } from "@/components/admin/crm/web-lead-contact-paths";
import { WebLeadDealPanel } from "@/components/admin/crm/web-lead-deal-panel";
import { WebLeadNextActionCard } from "@/components/admin/crm/web-lead-next-action-card";
import { WebLeadSamplePanel } from "@/components/admin/crm/web-lead-sample-panel";
import { WebLeadSourcePanel } from "@/components/admin/crm/web-lead-source-panel";
import {
  EMPTY_WEB_LEAD_WORKSPACE_QUERY,
  type WebLeadWorkspaceQuery,
} from "@/lib/crm/web-lead-workspace-query";

function resolveBestContact(lead: Record<string, unknown>) {
  const displayEmail = String(lead.email || "").trim();
  const displayPhone = String(lead.phone || "").trim();
  const displayContactPage = String(lead.contact_page || "").trim();
  const displayFacebook = String(lead.facebook_url || "").trim();
  const displayWebsite = String(lead.website || "").trim();
  const fbNorm = displayFacebook
    ? displayFacebook.startsWith("http")
      ? displayFacebook
      : `https://${displayFacebook}`
    : "";
  const noEmail = !displayEmail;
  let method = String(lead.best_contact_method || "")
    .trim()
    .toLowerCase();
  if (method === "contact_page") method = "contact_form";
  if (method === "none") method = "";
  let value: string | null = String(lead.best_contact_value || "").trim() || null;
  if (method) {
    if (noEmail && fbNorm && method === "phone") {
      method = "facebook";
      value = fbNorm;
    }
    if (method === "email" && !value) value = displayEmail || null;
    if (method === "facebook" && !value && displayFacebook) value = fbNorm || null;
    if (method === "phone" && !value) value = displayPhone || null;
    if (method === "contact_form" && !value) value = displayContactPage || null;
    if (method === "website" && !value && displayWebsite && leadHasStandaloneWebsite(displayWebsite))
      value = displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`;
    return { method, value };
  }
  if (displayEmail) return { method: "email", value: displayEmail };
  if (displayFacebook) return { method: "facebook", value: fbNorm };
  if (displayPhone) return { method: "phone", value: displayPhone };
  if (displayContactPage)
    return {
      method: "contact_form",
      value: displayContactPage.startsWith("http") ? displayContactPage : `https://${displayContactPage}`,
    };
  if (displayWebsite && leadHasStandaloneWebsite(displayWebsite))
    return {
      method: "website",
      value: displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`,
    };
  return { method: "research_later", value: null };
}

function resolvedAdvertising(lead: Record<string, unknown>) {
  const url = String(lead.advertising_page_url || "").trim();
  const label = String(lead.advertising_page_label || "").trim();
  if (url) {
    return {
      url: url.startsWith("http") ? url : `https://${url}`,
      label: label || "Public page",
    };
  }
  return { url: null as string | null, label: null as string | null };
}

export function WebLeadWorkspace({
  lead,
  workspaceQuery = EMPTY_WEB_LEAD_WORKSPACE_QUERY,
}: {
  lead: Record<string, unknown>;
  workspaceQuery?: WebLeadWorkspaceQuery;
}) {
  const q = workspaceQuery;
  const vm = toWebLeadViewModel(lead);
  const leadId = String(lead.id || "");
  const status = String(lead.status || "new");
  const displayBusinessName = String(lead.business_name || "").trim() || "Unknown business";
  const displayCategory = String(lead.category || lead.industry || "").trim() || "—";
  const displayScore =
    lead.conversion_score != null && Number.isFinite(Number(lead.conversion_score))
      ? Number(lead.conversion_score)
      : lead.opportunity_score != null && Number.isFinite(Number(lead.opportunity_score))
        ? Number(lead.opportunity_score)
        : null;
  const resolvedBest = resolveBestContact(lead);
  const advertising = resolvedAdvertising(lead);
  const leadPath = buildLeadPath(leadId, displayBusinessName);
  const sourceLabel = displayLeadSourceLabel(lead);
  const leadSummary = buildLeadSummary(lead);
  const priority = deriveLeadPriority(lead);
  const scoreBreakdown =
    lead.score_breakdown && typeof lead.score_breakdown === "object" && !Array.isArray(lead.score_breakdown)
      ? (lead.score_breakdown as Record<string, unknown>)
      : null;
  const convertedProjectId = String(scoreBreakdown?.converted_project_id || "").trim() || null;

  const shortEmailPitch = `Hey — I took a quick look at your online presence and see a few easy wins.
I help local businesses get more calls with simple, cleaner sites.
Want me to show you a quick example?`;
  const shortTextPitch = `Hey this is Topher — I help businesses get more calls with simple websites.
Want me to show you a quick idea?`;

  const hasContactPath =
    Boolean(String(lead.email || "").trim()) ||
    Boolean(String(lead.phone || "").trim()) ||
    Boolean(String(lead.facebook_url || "").trim()) ||
    Boolean(String(lead.contact_page || "").trim()) ||
    (Boolean(String(lead.website || "").trim()) && leadHasStandaloneWebsite(String(lead.website || "")));

  useEffect(() => {
    const go = (id: string) => {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    if (q.sample) go("crm-sample");
    else if (q.generate) go("crm-generate");
    else if (q.compose) go("crm-compose");
    else if (q.focusOutreach) go("crm-outreach");
  }, [q.sample, q.generate, q.compose, q.focusOutreach]);

  return (
    <div className="space-y-6 max-w-5xl">
      <section className="admin-card p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <h1 className="text-2xl font-bold truncate" style={{ color: "var(--admin-fg)" }}>
              {displayBusinessName}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs items-center">
              <span className={`admin-badge ${leadStatusClass(status)}`}>{prettyLeadStatus(status)}</span>
              <span className="admin-badge border border-[var(--admin-border)]">{laneLabel(vm.lane)}</span>
              <span className="admin-badge border border-[var(--admin-border)]">{sourceLabel}</span>
              <span className={`admin-priority-badge ${priority.className}`}>
                {priority.label}
                {priority.isManual ? " (manual)" : ""}
              </span>
              {displayScore != null ? (
                <span style={{ color: "var(--admin-muted)" }}>
                  Score <strong style={{ color: "var(--admin-fg)" }}>{displayScore}</strong>
                </span>
              ) : null}
              <span style={{ color: "var(--admin-muted)" }}>{vm.sourcePlatformLabel}</span>
            </div>
            {(vm.sourceQuery || vm.sourceLabel) && (
              <p className="text-sm" style={{ color: "var(--admin-fg)" }}>
                <span style={{ color: "var(--admin-muted)" }}>Source query / label: </span>
                {vm.sourceQuery || "—"}
                {vm.sourceLabel ? ` · ${vm.sourceLabel}` : ""}
              </p>
            )}
            <p className="text-xs" style={{ color: "var(--admin-muted)" }}>
              {displayCategory}
              {vm.city ? ` · ${vm.city}` : ""}
              {vm.state ? `, ${vm.state}` : ""}
            </p>
            <div className="admin-border-soft rounded-xl border p-3">
              <h2 className="admin-text-fg text-sm font-semibold">Lead summary</h2>
              <dl className="admin-text-muted mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="admin-text-fg font-semibold">Project type</dt>
                  <dd>{leadSummary.projectType}</dd>
                </div>
                <div>
                  <dt className="admin-text-fg font-semibold">Budget range</dt>
                  <dd>{leadSummary.budgetRange}</dd>
                </div>
                <div>
                  <dt className="admin-text-fg font-semibold">Timeline</dt>
                  <dd>{leadSummary.timeline}</dd>
                </div>
                <div>
                  <dt className="admin-text-fg font-semibold">Source</dt>
                  <dd>{leadSummary.source}</dd>
                </div>
                <div>
                  <dt className="admin-text-fg font-semibold">Submitted date</dt>
                  <dd>{String(lead.created_at || "—")}</dd>
                </div>
              </dl>
            </div>
            <div className="admin-border-soft rounded-xl border p-3">
              <LeadPriorityEditor leadId={leadId} initialPriority={priority.key} />
            </div>
            <div className="flex flex-wrap gap-1">
              {getLeadPriorityBadges({
                isHotLead: Boolean(lead.is_hot_lead),
                bucket: null,
                score: displayScore,
                email: String(lead.email || ""),
                phone: String(lead.phone || ""),
              }).map((badge) => (
                <span key={badge.key} className={`admin-priority-badge ${badge.className}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
          <BackToLeadsLink className="admin-btn-ghost text-sm whitespace-nowrap" />
        </div>
      </section>

      <div
        id="crm-outreach"
        className={cn(
          "space-y-4 scroll-mt-6 rounded-xl",
          q.focusOutreach &&
            "ring-2 ring-[var(--admin-gold)]/50 ring-offset-2 ring-offset-[#0b0f0e] p-3 -m-1"
        )}
      >
        <WebLeadNextActionCard vm={vm} primaryHrefSuffix="?focus=outreach" />

        <LeadContactNow
          bestContactMethod={resolvedBest.method}
          bestContactValue={resolvedBest.value}
          advertisingPageUrl={advertising.url}
          advertisingPageLabel={advertising.label}
          email={String(lead.email || "") || null}
          facebookUrl={String(lead.facebook_url || "") || null}
          phone={String(lead.phone || "") || null}
          contactPage={String(lead.contact_page || "") || null}
          website={String(lead.website || "") || null}
        />

        <WebLeadContactPaths vm={vm} leadId={leadId} />
      </div>

      <section id="crm-sample" className="admin-card p-4 space-y-3 scroll-mt-6">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Sample / mockup
        </h2>
        <WebLeadSamplePanel vm={vm} />
        <ClientSiteDraftPreviewLink leadId={leadId} initialSlug={(lead.site_draft_preview_slug as string) ?? null} />
        <LeadMockupSharePanel leadId={leadId} businessName={displayBusinessName} leadEmail={String(lead.email || "")} />
      </section>

      <section className="admin-card p-4 space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Deal
        </h2>
        <WebLeadDealPanel vm={vm} />
        <LeadDealTrackingCard
          leadId={leadId}
          leadStatus={String(lead.lead_status || "") || null}
          lastContactedAt={String(lead.last_contacted_at || "").trim() || null}
          nextFollowUpAt={String(lead.next_follow_up_at || "").trim() || null}
          lastFollowUpTemplateKey={String(lead.last_follow_up_template_key || "").trim() || null}
        />
      </section>

      <section className="admin-card space-y-3">
        <h2 className="text-sm font-semibold px-4 pt-4" style={{ color: "var(--admin-fg)" }}>
          Actions & follow-up
        </h2>
        <div className="px-4 pb-4 space-y-3">
          <LeadPrimaryActions
            leadId={leadId}
            hasContactPath={hasContactPath}
            initialNextFollowUpAt={String(lead.next_follow_up_at || "").trim() || null}
            followUpCount={lead.follow_up_count == null ? 0 : Number(lead.follow_up_count)}
            leadStatus={String(lead.status || "") || null}
            unreadReplyCount={
              lead.unread_reply_count == null || Number.isNaN(Number(lead.unread_reply_count))
                ? null
                : Math.max(0, Number(lead.unread_reply_count))
            }
          />
          <LeadFollowUpPanel
            leadId={leadId}
            status={String(lead.status || "") || null}
            nextFollowUpAt={String(lead.next_follow_up_at || "").trim() || null}
            lastContactedAt={String(lead.last_contacted_at || "").trim() || null}
            followUpCount={lead.follow_up_count == null ? 0 : Number(lead.follow_up_count)}
            lastTemplateKey={String(lead.last_follow_up_template_key || "").trim() || null}
          />
        </div>
      </section>

      <LeadFollowUpChecklist
        leadId={leadId}
        scoreBreakdown={scoreBreakdown}
      />

      <ConvertLeadToProject leadId={leadId} initialProjectId={convertedProjectId} />

      <section className="admin-card p-4 space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          What to say
        </h2>
        <div id="crm-compose" className="scroll-mt-6 space-y-3">
          <LeadSuggestedResponse
            businessName={displayBusinessName}
            leadId={leadId}
            composeHref={leadPath}
            bestContactMethod={resolvedBest.method}
            bestContactValue={resolvedBest.value}
            email={String(lead.email || "") || null}
            facebookUrl={String(lead.facebook_url || "") || null}
            phone={String(lead.phone || "") || null}
            suggestedTemplateKey={String(lead.suggested_template_key || "").trim() || null}
            suggestedResponse={String(lead.suggested_response || "").trim() || null}
          />
        </div>
        <div id="crm-generate" className="scroll-mt-6">
          <LeadPitchPanel emailPitch={shortEmailPitch} textPitch={shortTextPitch} doorPitch="" showDoor={false} />
        </div>
      </section>

      <section className="admin-card p-4 space-y-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--admin-fg)" }}>
          Timeline
        </h2>
        <LeadActivityTimeline leadId={leadId} />
      </section>

      <WebLeadSourcePanel vm={vm} raw={lead} />

      <details className="admin-card p-4">
        <summary className="text-sm font-semibold cursor-pointer" style={{ color: "var(--admin-fg)" }}>
          Content review &amp; site notes
        </summary>
        <p className="text-xs mt-2" style={{ color: "var(--admin-muted)" }}>
          When a case file is linked, link analysis, site notes, issues and opportunities, and writing and messaging
          context show up in the Cases area of admin.
        </p>
      </details>
    </div>
  );
}
