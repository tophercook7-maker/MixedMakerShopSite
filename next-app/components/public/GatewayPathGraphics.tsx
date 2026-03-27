import { cn } from "@/lib/utils";

export function GatewayWebGraphic({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-full w-full", className)}
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="gw-web-bg" x1="80" y1="0" x2="340" y2="260" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFB2" stopOpacity="0.12" />
          <stop offset="0.45" stopColor="#22D3EE" stopOpacity="0.05" />
          <stop offset="1" stopColor="#00FFB2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gw-web-bar" x1="210" y1="200" x2="210" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFB2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect width="420" height="260" fill="url(#gw-web-bg)" />
      {/* subtle map pin / reach */}
      <path
        d="M52 196c0-22 18-40 40-40s40 18 40 40c0 28-40 52-40 52s-40-24-40-52z"
        stroke="rgba(0,255,178,0.2)"
        strokeWidth="1.2"
        fill="rgba(0,255,178,0.06)"
      />
      <circle cx="92" cy="192" r="5" fill="rgba(0,255,178,0.35)" />
      {/* browser window */}
      <rect
        x="108"
        y="44"
        width="260"
        height="168"
        rx="14"
        stroke="rgba(232,253,245,0.16)"
        strokeWidth="1.5"
        fill="rgba(11,15,14,0.92)"
      />
      <path d="M108 72h260" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="124" cy="58" r="4" fill="rgba(255,95,87,0.45)" />
      <circle cx="142" cy="58" r="4" fill="rgba(255,189,46,0.4)" />
      <circle cx="160" cy="58" r="4" fill="rgba(52,199,89,0.4)" />
      <rect x="182" y="52" width="140" height="14" rx="4" fill="rgba(255,255,255,0.06)" />
      {/* “site” content blocks */}
      <rect x="124" y="88" width="128" height="10" rx="3" fill="rgba(232,253,245,0.12)" />
      <rect x="124" y="106" width="92" height="8" rx="2" fill="rgba(159,181,173,0.12)" />
      <rect x="124" y="124" width="228" height="56" rx="8" fill="rgba(0,255,178,0.06)" stroke="rgba(0,255,178,0.15)" />
      <rect x="136" y="136" width="72" height="8" rx="2" fill="rgba(232,253,245,0.14)" />
      <rect x="136" y="152" width="120" height="6" rx="2" fill="rgba(159,181,173,0.1)" />
      <rect x="136" y="164" width="52" height="10" rx="5" fill="rgba(255,209,102,0.35)" />
      {/* growth bars */}
      <rect x="290" y="128" width="14" height="40" rx="3" fill="url(#gw-web-bar)" opacity="0.85" />
      <rect x="310" y="118" width="14" height="50" rx="3" fill="url(#gw-web-bar)" opacity="0.65" />
      <rect x="330" y="108" width="14" height="60" rx="3" fill="url(#gw-web-bar)" opacity="0.45" />
      <path
        d="M292 122c16-10 28-6 42 4s28 14 40 4"
        stroke="rgba(0,255,178,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function GatewayPrintGraphic({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-full w-full", className)}
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="gw-print-bg" x1="60" y1="20" x2="360" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" stopOpacity="0.14" />
          <stop offset="0.5" stopColor="#10B981" stopOpacity="0.06" />
          <stop offset="1" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
        <pattern id="gw-blueprint" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" stroke="rgba(232,253,245,0.06)" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="420" height="260" fill="url(#gw-print-bg)" />
      <rect width="420" height="260" fill="url(#gw-blueprint)" opacity="0.5" />
      {/* dimension ticks */}
      <path d="M72 200h276" stroke="rgba(251,191,36,0.25)" strokeWidth="1" strokeDasharray="4 6" />
      <path d="M92 56V208" stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="3 5" />
      {/* printer silhouette */}
      <rect x="118" y="78" width="196" height="118" rx="12" fill="rgba(15,23,15,0.88)" stroke="rgba(255,255,255,0.12)" />
      <rect x="132" y="92" width="168" height="72" rx="6" fill="rgba(0,0,0,0.35)" stroke="rgba(251,191,36,0.12)" />
      <rect x="148" y="172" width="136" height="12" rx="3" fill="rgba(255,255,255,0.08)" />
      <rect x="174" y="54" width="72" height="28" rx="6" fill="rgba(15,23,15,0.9)" stroke="rgba(255,255,255,0.1)" />
      <circle cx="210" cy="68" r="10" stroke="rgba(251,191,36,0.35)" strokeWidth="2" fill="rgba(251,191,36,0.08)" />
      {/* printed part — bracket */}
      <path
        d="M268 118h48v36h-20l-8 32h-32l8-32h-12l8-36z"
        fill="rgba(52,211,153,0.22)"
        stroke="rgba(52,211,153,0.45)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="292" cy="136" r="6" fill="rgba(11,15,14,0.65)" stroke="rgba(232,253,245,0.15)" />
      {/* floating filament hint */}
      <path
        d="M338 96c-12 24-4 52 16 68"
        stroke="rgba(251,191,36,0.35)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="334" y="88" width="8" height="14" rx="2" fill="rgba(251,191,36,0.25)" />
    </svg>
  );
}
