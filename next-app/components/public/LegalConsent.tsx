import Link from "next/link";
import { cn } from "@/lib/utils";
import { mmsTextLinkOnGlass } from "@/lib/mms-umbrella-ui";

type LegalConsentProps = {
  className?: string;
  /** Use on dark glass panels (Captain Maker, umbrella forms). */
  variant?: "default" | "glass";
};

const linkClass = {
  default: "font-semibold text-[#8a4b2a] underline-offset-4 hover:text-[#b85c1e] hover:underline",
  glass: cn(mmsTextLinkOnGlass, "font-semibold"),
} as const;

function LegalLinks({ variant }: { variant: "default" | "glass" }) {
  const cls = linkClass[variant];
  return (
    <>
      <Link href="/terms" className={cls}>
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link href="/privacy" className={cls}>
        Privacy Policy
      </Link>
    </>
  );
}

export function FormLegalConsent({ className, variant = "default" }: LegalConsentProps) {
  return (
    <p className={cn("text-sm leading-relaxed", className)}>
      By submitting this form, you agree to our <LegalLinks variant={variant} />.
    </p>
  );
}

export function PaymentLegalConsent({ className, variant = "default" }: LegalConsentProps) {
  return (
    <p className={cn("text-sm leading-relaxed", className)}>
      By purchasing or starting a project, you agree to our <LegalLinks variant={variant} />.
    </p>
  );
}
