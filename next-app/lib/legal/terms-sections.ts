import type { LegalSection } from "@/lib/legal/types";
import { normalizeLegalBrand } from "@/lib/legal/normalize-brand";

/** Source: terms-of-service---mixed-maker-shop.pdf (Effective Date: June 2, 2026) */
export const TERMS_LAST_UPDATED = "June 2, 2026";

export const TERMS_INTRO: readonly string[] = [
  normalizeLegalBrand(
    'Welcome to MixedMakerShop. These Terms of Service ("Terms") govern your access to and use of the website located at mixedmakershop.com (the "Site") and any services, products, or digital tools provided by MixedMakerShop, including its service lines: Topher\'s Web Design, the Lab, and AI & Automation systems (collectively, the "Services").',
  ),
  "By accessing our Site or engaging our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Site or Services.",
];

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    id: "our-services",
    title: "1. Our Services",
    paragraphs: [
      normalizeLegalBrand(
        "MixedMakerShop is a one-person studio providing a variety of digital services:",
      ),
    ],
    list: [
      "Topher's Web Design: Development of mobile-friendly websites, landing pages, and local SEO foundations.",
      "Apps, Games & Media: Custom applications, published books and audiobooks, original music, and video production.",
      "AI & Automation: Implementation of AI workflows, customer-helper bots, and digital automation tools.",
      "Creative Projects: Digital products, templates, and experimental builds from MixedMakerShop Labs.",
    ],
  },
  {
    id: "consultations",
    title: "2. Consultations and Estimates",
    paragraphs: ["We provide several tools to help you understand our services before you commit:"],
    list: [
      normalizeLegalBrand(
        "AI helpers and chat tools: Any AI helpers or chat tools we offer (now or in the future) are informational only. Their answers are not a legal contract, a guarantee, or expert advice. Always verify key details (pricing, timelines, materials, specs, and scope) with Topher before you commit. Any AI-generated estimate is for informational purposes and does not constitute a binding contract until a formal project scope is approved by MixedMakerShop.",
      ),
      normalizeLegalBrand(
        "Free Homepage Preview: We may offer a complimentary homepage mockup. While this preview reflects our creative direction, MixedMakerShop retains all ownership of the preview until a formal agreement is reached and payment is made.",
      ),
    ],
  },
  {
    id: "payments",
    title: "3. Payments, Deposits, and Refunds",
    list: [
      "Standard Billing: For web design and custom projects, we typically require a 50% non-refundable deposit to begin work, with the remaining 50% balance due upon project completion or prior to the site going live.",
      "No-Refund Policy: Due to the custom nature of our work (both digital and physical), all payments are final. Once a payment is processed, it is non-refundable.",
      "Pricing and Estimates: Any quote or estimate we provide is valid for 30 days unless we state otherwise in writing.",
      "Subscription Services: Monthly fees for hosting, support, or premium digital access are billed in advance and are non-refundable. You may cancel your subscription at any time to prevent future charges.",
    ],
  },
  {
    id: "web-design",
    title: "4. Web Design and Digital Ownership",
    list: [
      "Content Responsibility: You are responsible for providing all text, images, and data required for your website. You warrant that you have the right to use any materials provided to us.",
      normalizeLegalBrand(
        "Ownership: Upon receipt of final payment in full, the ownership of the custom website design and its code is transferred to you. MixedMakerShop retains the right to display the work in our portfolio and marketing materials.",
      ),
    ],
  },
  {
    id: "ai",
    title: "5. AI and Automation Disclaimers",
    list: [
      normalizeLegalBrand(
        "AI Guidance: Our AI tools and bots are designed to assist and guide users. However, AI can occasionally produce inaccurate information. MixedMakerShop does not guarantee the absolute accuracy of AI-generated content and is not responsible for decisions made based on bot interactions.",
      ),
      "Bot Guardrails: We build AI helpers with specific guardrails, but we are not liable for unintended outputs or service interruptions caused by third-party AI platform providers (e.g., OpenAI, Anthropic).",
    ],
  },
  {
    id: "liability",
    title: "6. Limitation of Liability",
    paragraphs: [
      normalizeLegalBrand(
        "To the maximum extent permitted by law, MixedMakerShop and its owners shall not be liable for any indirect, incidental, or consequential damages, including loss of profits, data, or business opportunities, arising out of or in connection with the use of our Site or Services. Our total liability for any claim shall not exceed the amount paid by you for the specific service in question.",
      ),
    ],
  },
  {
    id: "termination",
    title: "7. Termination",
    paragraphs: [
      "We reserve the right to terminate or suspend access to our Services immediately, without prior notice, if you breach these Terms. Upon termination, your right to use the Services will cease, and any outstanding balances will become immediately due.",
    ],
  },
  {
    id: "governing-law",
    title: "8. Governing Law",
    paragraphs: [
      "These Terms shall be governed by and construed in accordance with the laws of the State of Arkansas, without regard to its conflict of law provisions.",
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    paragraphs: [
      "If you have any questions about these Terms, please contact us at:",
      "MixedMakerShop",
      "Email: Topher@mixedmakershop.com",
      "Website: mixedmakershop.com",
    ],
  },
] as const;
