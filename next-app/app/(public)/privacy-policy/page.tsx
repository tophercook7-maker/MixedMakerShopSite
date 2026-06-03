import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — MixedMakerShop",
  description:
    "How MixedMakerShop and PartnerDeskAI collect, use, and protect your information when you connect social accounts or use our tools.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
  openGraph: {
    title: "Privacy Policy — MixedMakerShop",
    url: `${SITE_URL}/privacy-policy`,
  },
};

const sections = [
  {
    id: "who-we-are",
    title: "1. Who we are",
    paragraphs: [
      "MixedMakerShop is a small studio that builds websites, digital tools, and practical software for real businesses. PartnerDeskAI is one of those tools — it helps you prepare, review, and publish content to connected social platforms.",
      "This privacy policy explains what information we collect, how we use it, and the choices you have when you use MixedMakerShop services or PartnerDeskAI.",
    ],
  },
  {
    id: "what-we-collect",
    title: "2. What data we collect",
    paragraphs: [
      "The information we collect depends on how you use our services. It may include:",
    ],
    list: [
      "Account details you provide, such as your name, email address, and business name.",
      "Content you create or upload in PartnerDeskAI, including drafts, captions, images, and scheduling preferences.",
      "Basic usage information, such as which features you use and when actions are taken, so we can keep the product working reliably.",
      "Technical information needed to operate the service, such as browser type, device type, and general log data when errors occur.",
    ],
  },
  {
    id: "platform-access",
    title: "3. How PartnerDeskAI uses connected platform access",
    paragraphs: [
      "When you connect a social account to PartnerDeskAI, we use that access only to support actions you choose in the product — for example, reading profile or page information needed to prepare a post, checking connection status, or publishing content after you review and approve it.",
      "PartnerDeskAI only uses connected account access to perform actions the user explicitly approves, such as publishing reviewed content. It does not post automatically without user confirmation.",
      "We do not use connected access to read private messages, scrape unrelated data, or take actions outside what the product needs to complete your approved request.",
    ],
  },
  {
    id: "connection-data",
    title: "4. LinkedIn, Facebook, Google, and Instagram connection data",
    paragraphs: [
      "If you choose to connect LinkedIn, Facebook, Google, Instagram, or similar platforms, PartnerDeskAI may receive information those platforms share as part of the connection process. This typically includes:",
    ],
    list: [
      "Basic profile or page details (such as name, profile ID, and page identifiers).",
      "Access tokens that allow PartnerDeskAI to perform approved actions on your behalf.",
      "Information needed to publish or manage content you explicitly submit through the app.",
    ],
    afterList:
      "We use this information only to provide the connected features you use. You can disconnect a platform at any time through PartnerDeskAI or through the platform's own account settings, which will stop future access through our app.",
  },
  {
    id: "no-auto-posting",
    title: "5. No automatic posting without approval",
    paragraphs: [
      "PartnerDeskAI is designed for reviewed publishing, not silent automation. Content is not posted to connected accounts unless you take a clear action to approve or publish it.",
      "We do not schedule or publish posts in the background without your confirmation for that specific action.",
    ],
  },
  {
    id: "no-selling",
    title: "6. No selling personal data",
    paragraphs: [
      "We do not sell your personal information.",
      "We do not share your data with third parties for their own marketing purposes. We may use trusted service providers (such as hosting or infrastructure partners) strictly to operate the product, and only under appropriate safeguards.",
    ],
  },
  {
    id: "local-first",
    title: "7. Local-first storage",
    paragraphs: [
      "PartnerDeskAI is built with a local-first approach where practical. Much of your working content and preferences are stored on your device or in your workspace so you stay in control of drafts and review steps.",
      "When cloud or server storage is needed — for example, to sync settings, complete an approved publish action, or back up account data — we store only what is necessary to provide the service securely.",
    ],
  },
  {
    id: "contact",
    title: "8. Contact information",
    paragraphs: [
      "If you have questions about this policy or want to request access, correction, or deletion of your information, contact us:",
    ],
    contact: true,
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <section className="section">
      <div className="container">
        <article className="panel" style={{ maxWidth: 720, margin: "0 auto" }}>
          <p className="small" style={{ margin: "0 0 8px", opacity: 0.85 }}>
            Last updated: May 30, 2026
          </p>
          <h1 style={{ margin: "0 0 12px" }}>Privacy Policy</h1>
          <p className="subhead" style={{ margin: "0 0 28px" }}>
            MixedMakerShop and PartnerDeskAI
          </p>

          <div className="stack" style={{ display: "grid", gap: 28 }}>
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 style={{ margin: "0 0 12px", fontSize: "1.15rem" }}>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="small" style={{ margin: "0 0 12px", lineHeight: 1.65 }}>
                    {paragraph}
                  </p>
                ))}
                {"list" in section && section.list ? (
                  <ul className="small" style={{ margin: "0 0 12px", paddingLeft: 20, lineHeight: 1.65 }}>
                    {section.list.map((item) => (
                      <li key={item} style={{ marginBottom: 8 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {"afterList" in section && section.afterList ? (
                  <p className="small" style={{ margin: 0, lineHeight: 1.65 }}>
                    {section.afterList}
                  </p>
                ) : null}
                {"contact" in section && section.contact ? (
                  <address
                    className="small"
                    style={{ fontStyle: "normal", lineHeight: 1.65, margin: 0 }}
                  >
                    <strong>MixedMakerShop</strong>
                    <br />
                    <Link href="/">https://mixedmakershop.com</Link>
                  </address>
                ) : null}
              </section>
            ))}
          </div>

          <hr style={{ margin: "32px 0 20px", opacity: 0.2 }} />

          <p className="small" style={{ margin: 0, lineHeight: 1.65, opacity: 0.9 }}>
            We may update this privacy policy from time to time. When we do, we will revise the
            &ldquo;Last updated&rdquo; date at the top of this page. Continued use of our services after
            changes are posted means the updated policy applies going forward.
          </p>
        </article>
      </div>
    </section>
  );
}
