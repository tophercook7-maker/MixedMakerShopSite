import { CaptainMakerFloatingButton } from "@/components/public/CaptainMakerFloatingButton";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicMotionInit } from "@/components/public/PublicMotionInit";

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
        <main className="flex-1 pb-[max(4.5rem,calc(env(safe-area-inset-bottom,0px)+3.5rem))] md:pb-0">
          {children}
        </main>
        <PublicFooter />
      </div>

      <CaptainMakerFloatingButton />
      <PublicMotionInit />
    </div>
  );
}
