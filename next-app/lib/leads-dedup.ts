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

type ExistingLeadRow = {
  id?: string | null;
  business_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
};

type DuplicateCheckResult = {
  duplicate: boolean;
  matchedLeadId: string | null;
  reason: "email" | "phone" | "business_name" | null;
  normalized_business_name: string;
  normalized_email: string;
  normalized_phone: string;
};

export async function findLeadDuplicate(args: {
  supabase: { from: (table: string) => any };
  ownerId: string;
  businessName?: string | null;
  email?: string | null;
  phone?: string | null;
}): Promise<DuplicateCheckResult> {
  const normalized_business_name = normalizeBusinessName(args.businessName);
  const normalized_email = normalizeEmail(args.email);
  const normalized_phone = normalizePhone(args.phone);
  const hasAny = Boolean(normalized_email || normalized_phone || normalized_business_name);
  if (!hasAny) {
    return {
      duplicate: false,
      matchedLeadId: null,
      reason: null,
      normalized_business_name,
      normalized_email,
      normalized_phone,
    };
  }

  const { data, error } = await args.supabase
    .from("leads")
    .select("id,business_name,email,phone,status")
    .eq("owner_id", args.ownerId)
    .limit(5000);
  if (error) {
    return {
      duplicate: false,
      matchedLeadId: null,
      reason: null,
      normalized_business_name,
      normalized_email,
      normalized_phone,
    };
  }
  const rows = (data || []) as ExistingLeadRow[];
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
      };
    }
    if (normalized_business_name && normalizeBusinessName(row.business_name) === normalized_business_name) {
      return {
        duplicate: true,
        matchedLeadId: existingId,
        reason: "business_name",
        normalized_business_name,
        normalized_email,
        normalized_phone,
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
  };
}

