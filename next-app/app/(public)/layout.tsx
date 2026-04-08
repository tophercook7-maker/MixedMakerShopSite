import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicMotionInit } from "@/components/public/PublicMotionInit";

export default function PublicLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="public-site public-site--light-umbrella min-h-screen min-h-dvh flex flex-col">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <PublicMotionInit />
    </div>
  );
}
