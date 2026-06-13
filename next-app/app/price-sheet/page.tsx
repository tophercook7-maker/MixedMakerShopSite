import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { PrintButton } from "./PrintButton";
import styles from "./price-sheet.module.css";

const canonical = `${SITE_URL}/price-sheet`;

export const metadata: Metadata = {
  title: "Price Sheet (Printable) | MixedMakerShop",
  description:
    "Print-friendly single-page price sheet for MixedMakerShop — web design, hosting, social media posting, in-home computer repair, tutoring, 3D printing, and AI tools.",
  alternates: { canonical },
  openGraph: {
    title: "MixedMakerShop Price Sheet — Printable",
    description:
      "Every live price on one page, ready to print and study. Web design, social media, computer repair, tutoring, 3D printing.",
    url: canonical,
    type: "website",
  },
};

type Row = { item: string; em?: string; what: string; price: string };
type Group = {
  title: string;
  note?: string;
  intro?: string;
  headers: [string, string, string];
  rows: Row[];
  outro?: string;
};

const GROUPS: Group[] = [
  {
    title: "Web design & hosting",
    note: "/web-design · /pricing",
    headers: ["Item", "What you get", "Price"],
    rows: [
      {
        item: "Starter Setup",
        what: "1-page mobile-friendly website with click-to-call, contact form, basic Google setup. Live within 5 business days.",
        price: "$400",
      },
      {
        item: "Business Setup",
        em: "(most requested)",
        what: "3–5 pages, service pages with strong CTAs, Google Business Profile optimization, review system, baseline SEO. Live within 7–10 business days.",
        price: "$900",
      },
      {
        item: "Online Visibility Setup",
        what: "Google Business Profile setup or optimization, site connected to Google, info verified, map & directions, basic SEO structure review.",
        price: "$250",
      },
      {
        item: "Hosting & Support",
        what: "Secure hosting, off-site backups, monitoring, minor content updates, direct support. Month-to-month, cancel anytime.",
        price: "$89/mo",
      },
      {
        item: "Church Care Plan",
        what: "Hosting & support plus 1 weekly digital sign graphic. Discount available for smaller congregations.",
        price: "$149/mo",
      },
      {
        item: "Menu Updates (client sites)",
        what: "Price & item updates, seasonal swaps, 24–48 hr turnaround. Add-on to a hosting plan for restaurant clients.",
        price: "$29/mo",
      },
    ],
    outro: "Custom builds, restaurant redesigns ($600+), and multi-location sites are quoted individually.",
  },
  {
    title: "Social media posting",
    note: "/social-media-takeover",
    intro:
      "Done-for-you posting across Google Business Profile, Facebook, Instagram, LinkedIn, Pinterest, X, and Threads. We post ads, blogs, and updates — you keep handling your own DMs and comments so customers actually hear from you. Month-to-month, cancel any time with 30 days' notice.",
    headers: ["Tier", "What you get", "Price"],
    rows: [
      {
        item: "Spark — 1 platform + GBP",
        what: "One platform of your choice plus weekly Google Business Profile posts. ~8 posts/month.",
        price: "$129/mo",
      },
      {
        item: "Local Trio",
        em: "(most chosen)",
        what: "GBP + Facebook + Instagram — the highest-leverage three for local. ~12 posts/month, blog drops cross-posted.",
        price: "$249/mo",
      },
      {
        item: "Full Stack — all 7 platforms",
        what: "GBP + Facebook + Instagram + LinkedIn + Pinterest + X + Threads. ~20 posts/month, framed per platform.",
        price: "$449/mo",
      },
      {
        item: "Paid Ads Push (add-on)",
        what: "Meta + Google ad management on top of any posting tier. Ad spend is separate and pays directly to the platform.",
        price: "+$99/mo",
      },
      {
        item: "Platform Setup (one-time)",
        what: "New account creation, profile, bio, links, hours, brand assets, verification help. Per platform.",
        price: "$79 each",
      },
    ],
    outro: "You handle all comments and DMs on every tier — that's deliberate, not an upsell. Custom mixes available.",
  },
  {
    title: "In-home computer repair",
    note: "/in-home-computer-repair",
    intro:
      "Flat rates for the common stuff. Anything not on this list runs hourly at $79/hr (1-hour minimum). Travel inside Hot Springs / Hot Springs Village / Lake Hamilton is included.",
    headers: ["Service", "What it covers", "Price"],
    rows: [
      {
        item: "Diagnostic Visit",
        what: "On-site assessment, written summary, honest fix-vs-replace answer. Credited toward any service done the same visit.",
        price: "$59",
      },
      {
        item: "Clean & Quick Tune-Up",
        em: "(most requested)",
        what: "Startup cleanup, disk & cache cleanup, browser cleanup, basic security check, performance pass.",
        price: "$99",
      },
      {
        item: "New Computer Setup",
        what: "Unbox, sign-in, email + browser migration, printer + Wi-Fi, file/photo transfer, optional wipe of old machine.",
        price: "$129",
      },
      {
        item: "Virus / Malware Removal",
        what: "Full malware sweep, browser hijack removal, account & password review, hardening so it doesn't come back.",
        price: "$149",
      },
      {
        item: "Printer & Network Setup",
        what: "Printer install, Wi-Fi / router reconnect, mobile printing, up to 3 devices reconnected.",
        price: "$99",
      },
      {
        item: "Hardware Install (labor only)",
        what: "RAM upgrade, SSD swap, hard-drive replacement, simple internal install. Parts at cost, no markup.",
        price: "$89",
      },
      {
        item: "Hourly Support",
        what: "Anything not on this list. 1-hour minimum.",
        price: "$79/hr",
      },
    ],
  },
  {
    title: "One-on-one tutoring — including AI",
    note: "/in-home-computer-repair",
    intro:
      "Patient, in-home, one-on-one. AI tools (ChatGPT, Copilot, Gemini, Claude), smartphones, tablets, email, photos, Office / Google Docs, online safety, video calls — whatever's on your list. Sessions ~1 hour.",
    headers: ["Service", "What you get", "Price"],
    rows: [
      {
        item: "Tutoring — flat rate",
        what: "One simple price for every topic. AI tools, basics, email, Office, photos, online safety. One-hour minimum, book as many in a row as you want, no packs or contracts.",
        price: "$65/hr",
      },
    ],
  },
  {
    title: "3D printing — GiGi's Print Shop",
    note: "/3d-printing",
    intro: "Quote-based, depending on size, color, material, and finishing. We always quote before printing.",
    headers: ["Type", "Typical range", "Price"],
    rows: [
      {
        item: "Small parts (keychains, brackets, small replacements)",
        what: "Standard PLA or PETG, quick prints, common sizes.",
        price: "$5–$15",
      },
      {
        item: "Mid-size parts (figures, mid-detail prints, brackets)",
        what: "Multi-hour prints with cleanup & finishing.",
        price: "$15–$45",
      },
      {
        item: "Large or detailed prints (multi-day, multi-color)",
        what: "Quoted per project.",
        price: "Quoted",
      },
      {
        item: "Modeling from photo / sketch / measurements",
        what: "When you don't have an STL. Pricing depends on complexity.",
        price: "$20–$80",
      },
    ],
  },
  {
    title: "AI & small-business automation tools",
    note: "/ai-business-tools",
    intro: "Most individual automation projects are one-time builds. Bigger custom workflows are scoped up front.",
    headers: ["Project type", "Typical scope", "Price"],
    rows: [
      {
        item: "Individual automation project",
        what: "Speed-to-lead text response, auto-invoice, scheduling assistant, lead routing, similar.",
        price: "$300–$1,500 one-time",
      },
      {
        item: "Larger custom workflow",
        what: "Multi-step automation across tools, CRM hookups, AI helpers tied to your specific business.",
        price: "Quoted",
      },
    ],
  },
  {
    title: "Pass-through costs (not markup)",
    headers: ["Item", "Notes", "Typical"],
    rows: [
      {
        item: "Domain registration / renewal",
        what: "Required for any site. Paid directly to the registrar (you own it).",
        price: "$12–$20/yr",
      },
      {
        item: "Premium third-party tools",
        what: "Paid online ordering, advanced reservations, paid email marketing. Passed through at cost, no markup.",
        price: "Varies",
      },
      {
        item: "Ad spend (Paid Ads Push)",
        what: "Meta / Google ad spend pays directly to the platform. We manage; you fund.",
        price: "Your budget",
      },
    ],
  },
];

export default function PriceSheetPage() {
  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <div className={`${styles.topbar} ${styles.noPrint}`}>
          <Link href="/">← Back to MixedMakerShop</Link>
          <PrintButton className={styles.printBtn} />
        </div>

        <h1>MixedMakerShop — Price Sheet</h1>
        <p className={styles.lede}>
          All current prices on one page. Print it. Study it. Bring it to the kitchen-table conversation.
        </p>
        <p className={styles.meta}>
          MixedMakerShop · Topher Cook · Hot Springs, AR · topher@mixedmakershop.com · mixedmakershop.com
        </p>

        {GROUPS.map((group) => (
          <div className={styles.group} key={group.title}>
            <h2>
              {group.title}
              {group.note ? <span className={styles.h2note}>{group.note}</span> : null}
            </h2>
            {group.intro ? <p className={styles.smallNote}>{group.intro}</p> : null}
            <table>
              <thead>
                <tr>
                  <th className={styles.item}>{group.headers[0]}</th>
                  <th className={styles.what}>{group.headers[1]}</th>
                  <th className={styles.price}>{group.headers[2]}</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row) => (
                  <tr key={row.item}>
                    <td className={styles.item}>
                      {row.item}
                      {row.em ? <em> {row.em}</em> : null}
                    </td>
                    <td className={styles.what}>{row.what}</td>
                    <td className={styles.price}>{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {group.outro ? <p className={styles.smallNote}>{group.outro}</p> : null}
          </div>
        ))}

        <div className={styles.bottom}>
          <strong>How to book or ask anything:</strong>
          <p>
            Text Topher directly · <Link href="/contact">contact form</Link> · topher@mixedmakershop.com
          </p>
          <p>Hot Springs, Arkansas · serving nearby towns and remote-friendly nationwide.</p>
          <p>
            Prices subject to change. The live <Link href="/pricing">pricing page</Link> is always the authoritative
            version.
          </p>
        </div>
      </div>
    </div>
  );
}
