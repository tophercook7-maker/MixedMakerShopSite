import type { WebCrmLane } from "@/lib/crm/web-lead-lane";
import type { WebLeadViewModel } from "@/lib/crm/web-lead-view-model";

function ms(iso: string | null | undefined): number {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function sampleRank(vm: WebLeadViewModel): number {
  const s = vm.sampleStatus.toLowerCase();
  if (s === "discussed" || s === "viewed" || s === "sent") return 0;
  if (s === "ready") return 1;
  if (s === "queued" || s === "building") return 2;
  return 3;
}

/** Default multi-lane sort (priority queue). */
export function compareWebLeadsDefault(a: WebLeadViewModel, b: WebLeadViewModel): number {
  const ur = (b.unreadReplyCount || 0) - (a.unreadReplyCount || 0);
  if (ur !== 0) return ur;

  const lanePri = (l: WebCrmLane) =>
    ({
      responded: 0,
      ready_now: 1,
      waiting: 2,
      sample_active: 3,
      qualified_deal: 4,
      inbox: 5,
      parked: 6,
      won: 7,
    })[l] ?? 99;
  const lp = lanePri(a.lane) - lanePri(b.lane);
  if (lp !== 0) return lp;

  const aOver = a.followUpDueAt && ms(a.followUpDueAt) < Date.now() ? 1 : 0;
  const bOver = b.followUpDueAt && ms(b.followUpDueAt) < Date.now() ? 1 : 0;
  if (aOver !== bOver) return bOver - aOver;

  const sa = sampleRank(a) - sampleRank(b);
  if (sa !== 0) return sa;

  const sc = (b.score ?? -1) - (a.score ?? -1);
  if (sc !== 0) return sc;

  return ms(b.lastTouchedAt) - ms(a.lastTouchedAt);
}

export function compareForLane(lane: WebCrmLane | "all", a: WebLeadViewModel, b: WebLeadViewModel): number {
  if (lane === "all") return compareWebLeadsDefault(a, b);

  if (lane === "responded") {
    return ms(b.lastReplyAt) - ms(a.lastReplyAt);
  }
  if (lane === "waiting") {
    const aOver = a.followUpDueAt && ms(a.followUpDueAt) < Date.now() ? 1 : 0;
    const bOver = b.followUpDueAt && ms(b.followUpDueAt) < Date.now() ? 1 : 0;
    if (aOver !== bOver) return bOver - aOver;
    return ms(a.followUpDueAt) - ms(b.followUpDueAt);
  }
  if (lane === "ready_now") {
    const sc = (b.score ?? -1) - (a.score ?? -1);
    if (sc !== 0) return sc;
    return ms(b.lastTouchedAt) - ms(a.lastTouchedAt);
  }
  if (lane === "sample_active") {
    const sr = sampleRank(a) - sampleRank(b);
    if (sr !== 0) return sr;
    return ms(b.lastTouchedAt) - ms(a.lastTouchedAt);
  }
  if (lane === "qualified_deal") {
    const stagePri = (s: string | null) => {
      const x = String(s || "").toLowerCase();
      if (x === "closing") return 0;
      if (x === "pricing") return 1;
      if (x === "interested") return 2;
      return 3;
    };
    const p = stagePri(a.dealStage) - stagePri(b.dealStage);
    if (p !== 0) return p;
    return (b.score ?? -1) - (a.score ?? -1);
  }

  return compareWebLeadsDefault(a, b);
}
