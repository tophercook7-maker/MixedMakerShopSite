import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { MenuSection } from "@/components/MenuSection";
import { MobileStickyOrder } from "@/components/MobileStickyOrder";
import { Navbar } from "@/components/Navbar";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { VisitSection } from "@/components/VisitSection";

export default function Page() {
  return (
    <>
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="content" className="bg-stone-50 pb-24 text-stone-800 dark:bg-roast dark:text-stone-50 md:pb-0">
        <HeroSection />
        <MenuSection />
        <AboutSection />
        <TestimonialsSection />
        <VisitSection />
        <ContactSection />
      </main>
      <MobileStickyOrder />
      <Footer />
    </>
  );
}
