import type { LegalSection } from "@/lib/legal/types";
import { normalizeLegalBrand } from "@/lib/legal/normalize-brand";

/** Source: privacy-policy---mixed-maker-shop.pdf (Effective Date: June 2, 2026) */
export const PRIVACY_LAST_UPDATED = "June 2, 2026";

export const PRIVACY_INTRO: readonly string[] = [
  normalizeLegalBrand(
    'MixedMakerShop ("we," "us," or "our") operates the website mixedmakershop.com and manages several service branches, including Topher\'s Web Design and GiGi\'s Print Shop. We are committed to protecting your privacy and providing a clear, honest explanation of how we handle your personal information.',
  ),
  'This Privacy Policy describes how we collect, use, and share your data when you visit our website, request a free website preview, or purchase our creative and digital services.',
];

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    paragraphs: [
      "We collect information that you provide directly to us and information generated automatically through your use of our services.",
    ],
    list: [
      "Contact Information: When you reach out via our contact forms, start an estimate, request a free homepage preview, or place an order, we may collect your name and email address.",
      "Shipping Information (3D Prints): If you order custom 3D-printed items, we collect your shipping address so we can deliver your order.",
      "Project Details: To provide our services (such as web design or 3D printing), we collect specific project data, including website preferences, business descriptions, and digital files or specifications for 3D prints.",
      "Payment Information: Payments are processed through secure third-party payment processors (e.g., Stripe, PayPal). We do not store your full credit card details on our servers.",
      "Communication Data: This includes any emails or messages exchanged regarding your projects, as well as form submissions or chat-tool interactions if we offer one in the future.",
      "Usage Data: We automatically collect information about how you interact with our website, such as your IP address, browser type, and pages visited, to help us improve our user experience.",
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    paragraphs: [
      normalizeLegalBrand(
        "We use the data we collect to run MixedMakerShop and deliver your projects. Specifically, we use your information to:",
      ),
    ],
    list: [
      "Provide, operate, and maintain our website and services.",
      "Generate free website previews and project estimates.",
      "Fulfill orders for custom 3D prints (including shipping your items).",
      "Keep you posted on your projects and orders (updates, questions, and support).",
      "Provide consultation and guidance through any helper tools or chat features we offer.",
      "Process payments through secure third-party payment processors (we don't store your credit card info).",
      "Improve our service offerings and website performance.",
      "Ensure the security of our digital environment.",
    ],
  },
  {
    id: "sharing",
    title: "3. Sharing and Disclosure",
    paragraphs: [
      "We do not sell your personal information. We only share your data in the following limited circumstances:",
    ],
    list: [
      "Service Providers: We share information with trusted third-party vendors who perform services on our behalf (for example, website hosting, shipping providers, and secure payment processors). Payment processors handle your card details; we do not store your full credit card information on our servers.",
      "Legal Requirements: We may disclose your information if required by law or in response to valid requests by public authorities (e.g., a court or government agency).",
      normalizeLegalBrand(
        "Business Transfers: If MixedMakerShop is involved in a merger, acquisition, or asset sale, your information may be transferred as a business asset.",
      ),
    ],
  },
  {
    id: "data-security",
    title: "4. Data Security",
    paragraphs: [
      "The security of your data is important to us. We use reasonable administrative and technical safeguards to help keep your contact details (like your name, email, and shipping address) safe. We do not sell your personal information to anyone. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "cookies",
    title: "5. Cookies and Tracking Technologies",
    paragraphs: [
      "We use cookies to enhance your browsing experience and analyze website traffic. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some portions of our website (including certain tools) may not function as intended.",
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights and Choices",
    paragraphs: ["Depending on your location, you may have the following rights regarding your personal information:"],
    list: [
      "Access: The right to request copies of the data we hold about you.",
      "Correction: The right to request that we correct any information you believe is inaccurate.",
      "Deletion: The right to request that we erase your personal data, subject to certain legal obligations to retain records.",
      "Opt-Out: You may opt out of receiving promotional communications from us at any time by following the instructions in our emails.",
    ],
  },
  {
    id: "children",
    title: "7. Children's Privacy",
    paragraphs: [
      "Our services are not directed to anyone under the age of 13. We do not knowingly collect personally identifiable information from children. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete that information.",
    ],
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    paragraphs: [
      'We may update our Privacy Policy from time to time to reflect changes in our practices or for legal and regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.',
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    paragraphs: [
      "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:",
      "MixedMakerShop",
      "Email: Topher@mixedmakershop.com",
      "Website: mixedmakershop.com",
    ],
  },
] as const;
