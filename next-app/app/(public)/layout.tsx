import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-site public-site--light-umbrella public-site--immersive min-h-screen min-h-dvh flex flex-col">
      {/* Background image */}
      <div className="public-site__bg" aria-hidden="true" />

      {/* Dark overlay for readability */}
      <div className="public-site__veil" aria-hidden="true" />

      <div className="public-site__inner relative z-[2] flex min-h-screen min-h-dvh flex-col">
        <PublicNav />
        <noscript>
          <div className="noscript-fallback" role="status">
            <strong>MixedMakerShop works without JavaScript.</strong>
            <p>Browse the services and contact Topher directly:</p>
            <p>
              <a href="/start-here">Start here</a> · <a href="/web-design">Web design</a> ·
              <a href="/local-seo-services">Local SEO</a> · <a href="/free-mockup">Free preview</a> ·
              <a href="/pricing">Pricing</a> · <a href="/contact">Contact</a>
            </p>
          </div>
        </noscript>
        <main className="flex-1 pb-[max(4.5rem,calc(env(safe-area-inset-bottom,0px)+3.5rem))] md:pb-0">
          {children}
        </main>
        <PublicFooter />
      </div>

    </div>
  );
}
