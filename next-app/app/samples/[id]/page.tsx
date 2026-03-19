import { LeadSamplePreviewClient } from "./preview-client";

export default async function LeadSamplePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadSamplePreviewClient sampleId={String(id || "").trim()} />;
}
