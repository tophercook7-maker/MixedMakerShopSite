export function normalizeBusinessName(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEmail(value: unknown): string {
  return String(value || "").toLowerCase().trim();
}

export function normalizePhone(value: unknown): string {
  return String(value || "").replace(/[^\d]/g, "");
}

export function normalizeWebsiteUrl(value: unknown): string {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  try {
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    const u = new URL(withProto);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "");
    return `${host}${path === "/" ? "" : path}`.trim();
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
  }
}

export function normalizeFacebookUrl(value: unknown): string {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  const stripped = raw.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (!stripped.includes("facebook.") && !stripped.includes("fb.com")) return "";
  return stripped.replace(/\/+$/, "");
}

type ExistingLeadRow = {
  id?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  normalized_website?: string | null;
  normalized_facebook_url?: string | null;
  status?: string | null;
};

type DuplicateCheckResult = {
  duplicate: boolean;
  matchedLeadId: string | null;
  reason: "email" | "phone" | "business_name" | "website" | "facebook_url" | null;
  normalized_business_name: string;
  normalized_email: string;
  normalized_phone: string;
  normalized_website: string;
  normalized_facebook_url: string;
};

export async function findLeadDuplicate(args: {
  supabase: { from: (table: string) => any };
  ownerId: string;
  businessName?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  facebookUrl?: string | null;
}): Promise<DuplicateCheckResult> {
  const normalized_business_name = normalizeBusinessName(args.businessName);
  const normalized_email = normalizeEmail(args.email);
  const normalized_phone = normalizePhone(args.phone);
  const normalized_website = normalizeWebsiteUrl(args.website);
  const normalized_facebook_url = normalizeFacebookUrl(args.facebookUrl);
  const hasAny = Boolean(
    normalized_email ||
      normalized_phone ||
      normalized_business_name ||
      normalized_website ||
      normalized_facebook_url
  );
  if (!hasAny) {
    return {
      duplicate: false,
      matchedLeadId: null,
      reason: null,
      normalized_business_name,
      normalized_email,
      normalized_phone,
      normalized_website,
      normalized_facebook_url,
    };
  }

  const selectVariants = [
    "id,business_name,email,phone,website,facebook_url,normalized_website,normalized_facebook_url,status",
    "id,business_name,email,phone,website,facebook_url,status",
    "id,business_name,email,phone,status",
  ];
  let rows: ExistingLeadRow[] = [];
  for (const sel of selectVariants) {
    const { data, error } = await args.supabase
      .from("leads")
      .select(sel)
      .eq("owner_id", args.ownerId)
      .limit(5000);
    if (!error) {
      rows = (data || []) as ExistingLeadRow[];
      break;
    }
  }
  for (const row of rows) {
    const existingId = String(row.id || "").trim();
    if (!existingId) continue;
    if (normalized_email && normalizeEmail(row.email) === normalized_email) {
      return {
        duplicate: true,
        matchedLeadId: existingId,
        reason: "email",
        normalized_business_name,
        normalized_email,
        normalized_phone,
        normalized_website,
        normalized_facebook_url,
      };
    }
    if (normalized_phone && normalizePhone(row.phone) === normalized_phone) {
      return {
        duplicate: true,
        matchedLeadId: existingId,
        reason: "phone",
        normalized_business_name,
        normalized_email,
        normalized_phone,
        normalized_website,
        normalized_facebook_url,
      };
    }
    if (normalized_facebook_url) {
      const rowFb =
        String(row.normalized_facebook_url || "").trim() ||
        normalizeFacebookUrl(row.facebook_url);
      if (rowFb && rowFb === normalized_facebook_url) {
        return {
          duplicate: true,
          matchedLeadId: existingId,
          reason: "facebook_url",
          normalized_business_name,
          normalized_email,
          normalized_phone,
          normalized_website,
          normalized_facebook_url,
        };
      }
    }
    if (normalized_website) {
      const rowSite =
        String(row.normalized_website || "").trim() || normalizeWebsiteUrl(row.website);
      if (rowSite && rowSite === normalized_website) {
        return {
          duplicate: true,
          matchedLeadId: existingId,
          reason: "website",
          normalized_business_name,
          normalized_email,
          normalized_phone,
          normalized_website,
          normalized_facebook_url,
        };
      }
    }
    if (normalized_business_name && normalizeBusinessName(row.business_name) === normalized_business_name) {
      return {
        duplicate: true,
        matchedLeadId: existingId,
        reason: "business_name",
        normalized_business_name,
        normalized_email,
        normalized_phone,
        normalized_website,
        normalized_facebook_url,
      };
    }
  }
  return {
    duplicate: false,
    matchedLeadId: null,
    reason: null,
    normalized_business_name,
    normalized_email,
    normalized_phone,
    normalized_website,
    normalized_facebook_url,
  };
}

