import Link from "next/link";
import { HomeFeaturedWebDesignWork } from "@/components/public/HomeFeaturedWebDesignWork";
import { TrackedPublicLink } from "@/components/public/TrackedPublicLink";
import { publicBodyMutedClass, publicShellClass } from "@/lib/public-brand";

const shell = publicShellClass;
const body = publicBodyMutedClass;
const sectionY = "py-16 md:py-24 lg:py-28";
const h2 = "text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-[#E8FDF5] lg:leading-[1.08]";

const webDesignBullets = [
  "Get more calls and leads",
  "Show up better than your competitors",
  "Look legit immediately",
  "Built for real-world use, not just looks",
] as const;

export function WebDesignSalesPage() {
  return (
    <div className="home-premium home-premium--textured w-full">
      {/* HERO */}
      <section className="home-band home-band--hero home-hero relative overflow-hidden">
        <div className="home-band-hero-bg pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-hero-vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="home-hero-grain pointer-events-none absolute inset-0" aria-hidden />
        <div
          className={`${shell} relative z-[2] mx-auto max-w-4xl px-6 pt-24 pb-20 text-center sm:pt-28 md:pt-32 md:pb-24 lg:pt-[8.5rem] lg:pb-28`}
        >
          <p className="home-reveal home-hero-eyebrow mx-auto mb-4 max-w-2xl text-[0.8rem] uppercase tracking-[0.18em] text-[#9FB5AD] md:text-sm">
            MixedMakerShop — Built by Topher
          </p>
          <h1 className="home-reveal home-hero-headline home-section-title mx-auto max-w-4xl">
            Websites that bring in customers — built by Topher.
          </h1>
          <p className={`home-reveal mx-auto mt-6 max-w-2xl text-lg leading-relaxed md:text-xl ${body}`}>
            I build clean, dependable websites, custom 3D printed solutions, and digital tools that help real businesses
            look legit and actually get results.
          </p>
          <div className="home-reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/free-mockup" className="home-btn-primary home-btn-primary--hero w-full min-w-[200px] sm:w-auto">
              Get My Free Preview
            </Link>
            <Link href="/examples" className="home-btn-secondary--hero w-full min-w-[200px] sm:w-auto">
              See My Work
            </Link>
          </div>
        </div>
        <div className="home-band-hero-foot pointer-events-none absolute inset-x-0 bottom-0 z-[1]" aria-hidden />
      </section>

      {/* TRUST BAR */}
      <section
        className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)] py-6"
        aria-label="What to expect"
      >
        <p
          className={`${shell} px-6 text-center text-sm font-medium leading-relaxed text-[#9FB5AD] md:text-[0.9375rem]`}
        >
          Built by Topher · Fast turnaround · No agency runaround · Based in Hot Springs, Arkansas
        </p>
      </section>

      {/* WEB DESIGN (PRIMARY) */}
      <section className="home-band home-band--deep border-y border-[rgba(232,253,245,0.06)]" id="web-design">
        <div className={`${shell} ${sectionY} max-w-4xl`}>
          <h2 className={`home-reveal ${h2}`}>Web Design by Topher</h2>
          <p className={`home-reveal mt-5 text-base md:text-[17px] leading-relaxed ${body}`}>
            This is the core of what I do. I build websites that help businesses look professional, build trust fast, and
            turn visitors into real customers.
          </p>
          <ul className="home-reveal mt-8 space-y-3 text-[#E8FDF5]/90 md:text-[17px]">
            {webDesignBullets.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="text-[#00FFB2]" aria-hidden>
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div className="home-reveal mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedPublicLink
              href="/examples"
              eventName="public_web_design_sample_click"
              eventProps={{ location: "web_design_sales", label: "see_examples" }}
              className="home-btn-secondary--hero inline-flex justify-center px-8 py-3"
            >
              See Examples
            </TrackedPublicLink>
            <Link href="/free-mockup" className="home-btn-primary home-btn-primary--hero inline-flex justify-center px-8 py-3">
              Get My Free Preview
            </Link>
          </div>
        </div>
      </section>

      <HomeFeaturedWebDesignWork variant="dark" />

      {/* WHAT I BUILD (UMBRELLA) */}
      <section className="home-band home-band--surface border-y border-[rgba(232,253,245,0.08)]" id="what-i-build">
        <div className={`${shell} ${sectionY} max-w-4xl`}>
          <h2 className={`home-reveal ${h2}`}>What I Build</h2>
          <div className="home-reveal mt-14 space-y-14">
            <div>
              <h3 className="home-reveal text-xl font-semibold text-[#e09a5a] md:text-2xl">3D Printing by Topher</h3>
              <p className={`home-reveal mt-4 ${body} text-base md:text-[17px] leading-relaxed`}>
                I design and print custom parts, fixes, and practical solutions. If something&apos;s broken, missing, or
                needs to exist — I can usually make it.
              </p>
              <ul className={`home-reveal mt-5 space-y-2 pl-1 text-[#9FB5AD] md:text-[15px]`}>
                <li>• Replacement parts</li>
                <li>• Custom mounts, clips, tools</li>
                <li>• Prototypes and ideas</li>
                <li>• Real-world problem solving</li>
              </ul>
              <div className="home-reveal mt-6">
                <TrackedPublicLink
                  href="/builds#builds-3d-printing"
                  eventName="public_home_path_cta"
                  eventProps={{ path: "3d_printing", label: "explore_3d_builds" }}
                  className="text-[0.9375rem] font-semibold text-[#00FFB2] hover:text-[#35ffc1] underline-offset-4 hover:underline"
                >
                  3D printing on Builds →
                </TrackedPublicLink>
              </div>
            </div>

            <div className="border-t border-[rgba(232,253,245,0.08)] pt-14">
              <h3 className="home-reveal text-xl font-semibold text-[#9FB5AD] md:text-2xl">Apps &amp; Tools by Topher</h3>
              <p className={`home-reveal mt-4 ${body} text-base md:text-[17px] leading-relaxed`}>
                I also build digital tools and app concepts — the kind of systems that go beyond a basic website. Most
                clients still start with a site; this is here when your idea needs more under the hood.
              </p>
              <ul className={`home-reveal mt-5 space-y-2 pl-1 text-[#9FB5AD] md:text-[15px]`}>
                <li>• AI-assisted tools</li>
                <li>• Custom internal systems</li>
                <li>• App concepts and builds</li>
                <li>• Real problem-solving software</li>
              </ul>
              <div className="home-reveal mt-6">
                <TrackedPublicLink
                  href="/builds"
                  eventName="public_home_path_cta"
                  eventProps={{ path: "digital_builds", label: "see_builds" }}
                  className="text-[0.9375rem] font-semibold text-[#00FFB2] hover:text-[#35ffc1] underline-offset-4 hover:underline"
                >
                  See all builds →
                </TrackedPublicLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT TOPHER */}
      <section className="home-band home-band--deep border-y border-[rgba(232,253,245,0.06)]" id="about-topher">
        <div className={`${shell} ${sectionY} max-w-3xl`}>
          <h2 className={`home-reveal ${h2}`}>About Topher</h2>
          <div className={`home-reveal mt-8 space-y-5 text-base leading-relaxed md:text-[18px] ${body} text-[#E8FDF5]/88`}>
            <p>I&apos;m Topher — I build things that are actually useful.</p>
            <p>
              MixedMakerShop is where I combine web design, 3D printing, and digital builds into one place. Some people
              come to me because they need a website. Others need something physical made. Others just have an idea they
              don&apos;t know how to bring to life yet.
            </p>
            <p>
              I don&apos;t overcomplicate things. I don&apos;t run things like a big agency. You work directly with me,
              and I focus on building something that actually helps you — not just something that looks good on the
              surface.
            </p>
            <p>Most of what I build is focused on one thing: making things easier, clearer, and more effective in the real world.</p>
            <p className="font-semibold text-[#E8FDF5] pt-2">If it needs to exist, work better, or look legit — I can build it.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-band home-band--final home-final-cta" id="home-contact">
        <div className={`${shell} px-6 py-20 text-center md:py-24`}>
          <h2 className="home-reveal text-3xl font-semibold tracking-tight text-[#E8FDF5] md:text-4xl">
            Let&apos;s build something that actually works.
          </h2>
          <p className={`home-reveal mx-auto mt-5 max-w-xl text-base md:text-[17px] ${body}`}>
            Tell me what you need — website, custom print, or idea — and I&apos;ll help you move it forward.
          </p>
          <div className="home-reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <TrackedPublicLink
              href="/contact"
              eventName="public_contact_cta_click"
              eventProps={{ location: "home_cta", target: "start_project" }}
              className="home-btn-primary home-btn-primary--final w-full max-w-sm sm:w-auto"
            >
              Start My Project
            </TrackedPublicLink>
            <Link href="/free-mockup" className="home-btn-secondary--hero w-full max-w-sm sm:w-auto justify-center">
              Get My Free Preview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
