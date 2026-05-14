#!/usr/bin/env node

const baseUrl = (process.env.TEST_LEAD_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

const unique = new Date().toISOString();
const payload = {
  submission_type: "public_lead",
  debug_notifications: true,
  source: "quote_request",
  name: `Lead Capture Test ${unique}`,
  business_name: `MixedMakerShop Test Lead ${unique}`,
  email: process.env.TEST_LEAD_EMAIL || "Topher@mixedmakershop.com",
  phone: "(501) 000-0000",
  website: "https://mixedmakershop.com",
  category: "Lead capture test",
  service_type: "notification_test",
  message: [
    "Automated public lead capture test.",
    `Created at: ${unique}`,
    "Expected: CRM lead ID, form_submissions ID, and notification_sent=true.",
  ].join("\n"),
  transcript: "Captain Maker: This is an automated test transcript.",
};

async function main() {
  const res = await fetch(`${baseUrl}/api/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "mixedmakershop-public-lead-test/1.0",
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  console.log(JSON.stringify({ status: res.status, body }, null, 2));

  if (!res.ok || body.ok !== true) {
    throw new Error(`Lead API failed: ${body.error || res.status}`);
  }
  if (!body.id) {
    throw new Error("Lead API did not return a CRM lead id.");
  }
  if (!body.form_submission_id) {
    throw new Error("Lead API did not return a form_submissions id.");
  }
  if (body.notification_sent !== true) {
    throw new Error("Lead API did not report notification_sent=true.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
