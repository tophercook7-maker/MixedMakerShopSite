import Link from "next/link";
import { HomeWebsiteScoreForm } from "@/components/public/HomeWebsiteScoreForm";
import { HomeMockupForm } from "@/components/public/HomeMockupForm";
import { HomeProjectForm } from "@/components/public/HomeProjectForm";

export const metadata = {
  title: "Custom Website Design in Hot Springs Arkansas | MixedMakerShop",
  description:
    "MixedMakerShop builds clean, fast small-business websites from Hot Springs, Arkansas. Custom web design, hosting, and ongoing support for businesses that want to look professional online.",
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="kicker">
              <span className="dot" /> MixedMakerShop.com • Custom 3D Prints • Small Business Web Design • Personalized
              Products
            </div>
            <h1 className="h1">
              Websites that bring you customers — not just visitors.
            </h1>
            <p className="subhead">Custom web design for businesses in Hot Springs and beyond.</p>
            <p className="small" style={{ margin: "8px 0 0" }}>
              <a href="https://share.google.com/cJA3CmiybFK1WNE5D" target="_blank" rel="noopener noreferrer">
                ⭐ Rated 5.0 by local clients
              </a>
            </p>
            <p className="hero-microproof" style={{ marginTop: 12 }}>
              Designed and built by Topher Cook — a small business web designer focused on clean, fast websites that
              help local businesses grow.
            </p>
            <div className="btn-row">
              <a className="btn gold" href="#free-mockup-request">
                Get My Free Mockup
              </a>
              <a className="btn ghost" href="#full-project-inquiry">
                Start a Full Project
              </a>
            </div>
            <div className="trust-line">
              <span>Free homepage mockup</span>
              <span>Delivered fast</span>
              <span>No obligation</span>
            </div>
            <p className="small" style={{ marginTop: 14 }}>Hot Springs, AR • Fast turnaround • You work directly with me</p>
          </div>

          <aside className="panel">
            <div className="small" style={{ fontWeight: 950, color: "rgba(255,255,255,.80)", marginBottom: 10 }}>
              One studio, many small ventures
            </div>
            <div className="btn-row" style={{ marginTop: 0 }}>
              <Link href="/website-samples" className="btn">
                Website Samples ↗
              </Link>
              <a className="btn gold" href="#free-mockup-request">
                Get My Free Mockup
              </a>
            </div>
            <div className="icon-row">
              <div className="ic">
                <div>
                  <span>⚡️ Quick quotes</span>
                  <br />
                  <strong>Fast Turnaround</strong>
                </div>
              </div>
              <div className="ic">
                <div>
                  <span>📍 Online service</span>
                  <br />
                  <strong>Remote Projects</strong>
                </div>
              </div>
              <div className="ic">
                <div>
                  <span>🧰 Problem solving</span>
                  <br />
                  <strong>Functional Fixes</strong>
                </div>
              </div>
              <div className="ic">
                <div>
                  <span>🧱 Made to order</span>
                  <br />
                  <strong>Custom Builds</strong>
                </div>
              </div>
              <div className="ic">
                <div>
                  <span>🧩 Custom prints</span>
                  <br />
                  <strong>3D Prints</strong>
                </div>
              </div>
              <div className="ic">
                <div>
                  <span>📱 Website building</span>
                  <br />
                  <strong>Small Business Sites</strong>
                </div>
              </div>
              <div className="ic">
                <div>
                  <span>🎣 Product development</span>
                  <br />
                  <strong>Prototypes & Parts</strong>
                </div>
              </div>
            </div>
            <div className="card" style={{ marginTop: 14 }}>
              <p className="small" style={{ margin: 0 }}>
                Web design and 3D printing — digital and physical builds under one roof.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Website Score */}
      <section className="section website-score-section" id="website-score">
        <div className="container">
          <div className="website-score-card panel">
            <h2 className="website-score-title">What&apos;s Your Website Score?</h2>
            <p className="website-score-copy">
              Enter your website below and I&apos;ll quickly check it for speed, structure, and conversion issues.
            </p>
            <HomeWebsiteScoreForm />
          </div>
        </div>
      </section>

      {/* Credibility strip */}
      <section className="credibility-strip">
        <div className="container">
          <p className="small" style={{ margin: 0 }}>Founder-Led Studio</p>
          <p className="small" style={{ margin: 0 }}>Clear Pricing</p>
          <p className="small" style={{ margin: 0 }}>Fast Turnaround</p>
          <p className="small" style={{ margin: 0 }}>Mobile-First Websites</p>
          <p className="small" style={{ margin: 0 }}>Based in Hot Springs, Arkansas</p>
        </div>
      </section>

      {/* Roast promo */}
      <section className="section roast-promo-strip">
        <div className="container">
          <div className="roast-promo-card panel">
            <div className="roast-promo-content">
              <h3 className="roast-promo-title">Get Your Website Roasted for Free</h3>
              <p className="roast-promo-copy">
                I&apos;ll review your site and show what&apos;s hurting trust, clarity, or conversions.
              </p>
            </div>
            <Link href="/website-roast" className="btn ghost roast-promo-btn">
              Go to Website Roast
            </Link>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="section" id="problem-solution">
        <div className="container">
          <h2 className="section-heading">Is your website helping your business — or holding it back?</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            Many small business websites look outdated, load slowly, or make it hard for customers to find what they
            need. A better website can make a huge difference in how your business is perceived online.
          </p>
          <div className="how-it-works-grid" style={{ marginBottom: 28 }}>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Outdated design</h3>
              <p className="small" style={{ margin: "0 0 10px", color: "var(--muted2)" }}>
                If your website looks old or cluttered, visitors may assume your business is too.
              </p>
              <p className="how-it-works-copy" style={{ margin: 0, color: "var(--gold2)" }}>
                A clean, modern design helps customers trust your business right away.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Confusing navigation</h3>
              <p className="small" style={{ margin: "0 0 10px", color: "var(--muted2)" }}>
                If visitors can&apos;t quickly understand what you do or how to contact you, they leave.
              </p>
              <p className="how-it-works-copy" style={{ margin: 0, color: "var(--gold2)" }}>
                Clear structure and simple navigation guide visitors toward becoming customers.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Slow or hard-to-use websites</h3>
              <p className="small" style={{ margin: "0 0 10px", color: "var(--muted2)" }}>
                Websites that load slowly or feel frustrating on mobile devices lose potential customers.
              </p>
              <p className="how-it-works-copy" style={{ margin: 0, color: "var(--gold2)" }}>
                Fast, responsive websites keep visitors engaged and ready to reach out.
              </p>
            </div>
          </div>
          <p className="subhead" style={{ margin: "0 0 16px", textAlign: "center" }}>
            See what your website could look like with a professional redesign.
          </p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <a className="btn gold" href="#free-mockup-request">
              Get My Free Mockup
            </a>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="section" id="recent-projects">
        <div className="container">
          <h2 className="section-heading">Recent Website Projects</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            A few examples of websites designed through MixedMakerShop.
          </p>
          <div className="how-it-works-grid" style={{ marginBottom: 28 }}>
            <div className="card project-card">
              <h3 style={{ margin: "0 0 10px" }}>Restaurant Website Redesign</h3>
              <p className="small" style={{ margin: "0 0 16px", flex: 1, color: "var(--muted)" }}>
                A clean redesign focused on clear menus, faster loading times, and a modern look.{" "}
                <Link href="/restaurant-websites-hot-springs">Restaurant website design</Link> for Hot Springs.
              </p>
              <Link href="/restaurant-website-redesign" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                View Example
              </Link>
            </div>
            <div className="card project-card">
              <h3 style={{ margin: "0 0 10px" }}>Small Business Website</h3>
              <p className="small" style={{ margin: "0 0 16px", flex: 1, color: "var(--muted)" }}>
                A simple, professional website designed to clearly explain services and make it easy for customers to
                get in touch. <Link href="/small-business-websites-hot-springs">Small business website design</Link> for
                Hot Springs.
              </p>
              <Link href="/website-samples" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                View Example
              </Link>
            </div>
            <div className="card project-card">
              <h3 style={{ margin: "0 0 10px" }}>Service Business Website</h3>
              <p className="small" style={{ margin: "0 0 16px", flex: 1, color: "var(--muted)" }}>
                A structured website layout designed to build trust and guide visitors toward contacting the business.{" "}
                <Link href="/coffee-shop-websites-hot-springs">Coffee shop</Link> and{" "}
                <Link href="/church-websites-hot-springs">church website design</Link> in Hot Springs.
              </p>
              <Link href="/website-samples" className="btn ghost" style={{ alignSelf: "flex-start" }}>
                View Example
              </Link>
            </div>
          </div>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <a className="btn gold" href="#free-mockup-request">
              Get My Free Mockup
            </a>
            <Link href="/website-samples" className="btn ghost">
              View All Website Samples
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="section" id="why-choose">
        <div className="container">
          <h2 className="section-heading">Why businesses choose MixedMakerShop</h2>
          <p className="transformations-subhead" style={{ margin: "0 0 28px" }}>
            Simple process, clear communication, and websites designed to help small businesses grow.
          </p>
          <div className="trust-points-grid">
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Work directly with the designer</h3>
              <p className="how-it-works-copy">
                You work directly with Topher Cook from start to finish. No middlemen, no confusing project handoffs —
                just clear communication and focused design.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Clean, modern website design</h3>
              <p className="how-it-works-copy">
                Every website is designed to load quickly, look professional, and work smoothly across phones, tablets,
                and desktops.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">Built for small businesses</h3>
              <p className="how-it-works-copy">
                MixedMakerShop focuses on practical websites for real businesses — restaurants, local services, shops,
                and organizations that need a clear online presence.
              </p>
            </div>
            <div className="how-it-works-card">
              <h3 className="how-it-works-title">See a concept before committing</h3>
              <p className="how-it-works-copy">
                Start with a free homepage mockup. You&apos;ll see the design direction before deciding whether to move
                forward with a full project.
              </p>
            </div>
          </div>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <a className="btn gold" href="#free-mockup-request">
              Get My Free Mockup
            </a>
            <Link href="/website-samples" className="btn ghost">
              View Website Samples
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section how-it-works-section">
        <div className="container">
          <h2 className="section-heading">How It Works</h2>
          <div className="how-it-works-grid">
            <div className="how-it-works-card">
              <span className="how-it-works-badge">01</span>
              <h3 className="how-it-works-title">Tell me about your business</h3>
              <p className="how-it-works-copy">
                Share what you do, who your customers are, and what your website needs to accomplish.
              </p>
            </div>
            <div className="how-it-works-card">
              <span className="how-it-works-badge">02</span>
              <h3 className="how-it-works-title">I design your homepage concept</h3>
              <p className="how-it-works-copy">
                You&apos;ll receive a clean homepage mockup designed around your brand and goals.
              </p>
            </div>
            <div className="how-it-works-card">
              <span className="how-it-works-badge">03</span>
              <h3 className="how-it-works-title">Launch your full website</h3>
              <p className="how-it-works-copy">If you like the direction, we move forward building the full site.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Mockup Request */}
      <section className="section" id="free-mockup-request">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>Free Mockup Request</h2>
            <p className="subhead" style={{ margin: "0 0 12px" }}>
              Request a free homepage mockup and see what your business could look like with a professionally designed
              website.
            </p>
            <p className="subhead" style={{ margin: "0 0 12px" }}>
              Share your business, goals, and the kind of site you want. More detail means a mockup that better fits
              your brand.
            </p>
            <p className="small" style={{ margin: "0 0 24px", opacity: 0.9 }}>
              Homepage concept only. No file uploads. Typical turnaround: 24–48 hours.
            </p>
            <HomeMockupForm />
            <div className="free-website-check-crosssell card">
              <h3 className="crosssell-title">Quick feedback on your current site?</h3>
              <p className="crosssell-copy">Get a free website check and see what&apos;s holding it back.</p>
              <Link href="/free-website-check" className="btn ghost">
                Get a Free Website Check
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full Project Inquiry */}
      <section className="section" id="full-project-inquiry">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>Full Project Inquiry</h2>
            <p className="subhead" style={{ margin: "0 0 12px" }}>
              Have branding or reference material ready? Send details and upload your logo or photos. File uploads are
              available here.
            </p>
            <HomeProjectForm />
          </div>
        </div>
      </section>

      {/* Samples */}
      <section className="section" id="samples">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 14px" }}>Real Website Examples</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              Example sites in different styles — clean, modern, rustic, bold. Yours can follow one of these or go fully
              custom.
            </p>
            <div className="grid-2" style={{ marginBottom: 14 }}>
              <Link href="/website-samples/bean-bliss" className="card" style={{ textDecoration: "none" }}>
                Bean Bliss{" "}
                <span className="small" style={{ display: "block", marginTop: 6 }}>
                  Clean café website designed to highlight menu, location, and daily traffic.
                </span>
              </Link>
              <Link href="/website-samples/noir-roast" className="card" style={{ textDecoration: "none" }}>
                Noir Roast{" "}
                <span className="small" style={{ display: "block", marginTop: 6 }}>
                  Bold roastery layout focused on brand identity and product storytelling.
                </span>
              </Link>
              <Link href="/website-samples/sunrise-cafe" className="card" style={{ textDecoration: "none" }}>
                Sunrise Café{" "}
                <span className="small" style={{ display: "block", marginTop: 6 }}>
                  Warm neighborhood café style built to encourage visits and local loyalty.
                </span>
              </Link>
              <Link href="/website-samples/route-66-coffee" className="card" style={{ textDecoration: "none" }}>
                Route 66 Coffee{" "}
                <span className="small" style={{ display: "block", marginTop: 6 }}>
                  Retro diner-inspired design that stands out and invites travelers inside.
                </span>
              </Link>
            </div>
            <div className="btn-row">
              <Link href="/website-samples" className="btn gold">
                View all website samples →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section testimonial-section" id="client-feedback">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 10px" }}>What clients say about working with MixedMakerShop</h2>
            <p className="testimonial-intro">Real feedback from local clients and customers.</p>
            <div className="testimonials-editorial">
              <article className="testimonial-card testimonial-card-featured">
                <div className="testimonial-stars" aria-hidden="true">
                  ★★★★★
                </div>
                <blockquote className="testimonial-quote">
                  <p style={{ margin: 0 }}>
                    I had an excellent experience working with Chris owner of MixedMakerShop out in Hot Springs,
                    Arkansas. He created a very well-laid-out, thoughtful website page for me that looks professional
                    and is easy to navigate. He was great to communicate with, paid attention to the details I asked
                    for, and delivered exactly what I needed if not more! You can tell he really cares about the quality
                    of his work and making sure his clients are happy and on the road to great success with a website to
                    promote. If you&apos;re looking for someone who can design a clean, organized, and effective website
                    page, I highly recommend him. I would absolutely work with him again.
                  </p>
                </blockquote>
                <p className="testimonial-name">Kelsey Cook</p>
              </article>
              <div className="testimonials-supporting">
                <article className="testimonial-card testimonial-card-supporting">
                  <div className="testimonial-stars" aria-hidden="true">
                    ★★★★★
                  </div>
                  <blockquote className="testimonial-quote">
                    <p style={{ margin: 0 }}>
                      I&apos;ve placed 5 orders and love every item I&apos;ve gotten. The website is very easy to use
                      and they&apos;re conveniently located in Hot Springs near me.
                    </p>
                  </blockquote>
                  <p className="testimonial-name">McKayla</p>
                </article>
                <article className="testimonial-card testimonial-card-supporting">
                  <div className="testimonial-stars" aria-hidden="true">
                    ★★★★★
                  </div>
                  <blockquote className="testimonial-quote">
                    <p style={{ margin: 0 }}>
                      Wonderful shop with many options and quick response help for all my questions. I highly recommend.
                    </p>
                  </blockquote>
                  <p className="testimonial-name">Rodney Blocker</p>
                </article>
                <article className="testimonial-card testimonial-card-supporting">
                  <div className="testimonial-stars" aria-hidden="true">
                    ★★★★★
                  </div>
                  <blockquote className="testimonial-quote">
                    <p style={{ margin: 0 }}>
                      Friendly, helpful, eager customer service with user-friendly products and designs — easy to
                      navigate and a pleasure to work with.
                    </p>
                  </blockquote>
                  <p className="testimonial-name">Taryn Cook</p>
                </article>
              </div>
            </div>
            <p className="small testimonial-cta" style={{ marginBottom: 0 }}>
              <a href="https://share.google.com/cJA3CmiybFK1WNE5D" target="_blank" rel="noopener noreferrer">
                Read more reviews on Google
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 14px" }}>Services</h2>
            <div className="price-grid" style={{ marginTop: 14 }}>
              <div className="price-card">
                <div className="tag">FULL WEBSITE BUILD • MOST REQUESTED</div>
                <div className="price">$950</div>
                <p className="small">
                  A clean, modern website built for your business — structured for long-term use, not just launch day.
                </p>
                <ul>
                  <li>Up to 5 pages (Home, About, Services/Menu, Gallery, Contact)</li>
                  <li>Mobile-first responsive layout</li>
                  <li>Contact form + clear call-to-action</li>
                  <li>Basic SEO structure</li>
                  <li>2 revision rounds</li>
                  <li>Launch support included</li>
                </ul>
                <div className="actions">
                  <a className="mini gold" href="#full-project-inquiry">
                    Start a Full Project
                  </a>
                  <Link href="/pricing" className="mini">
                    View Pricing
                  </Link>
                </div>
              </div>
              <div className="price-card">
                <div className="tag">HOSTING & SUPPORT</div>
                <div className="price">$89/mo</div>
                <p className="small">
                  Hosting, backups, monitoring, and direct support — your site stays secure and fast without you
                  managing it.
                </p>
                <ul>
                  <li>Secure hosting</li>
                  <li>Regular backups</li>
                  <li>Minor content updates</li>
                  <li>Direct support</li>
                </ul>
                <div className="actions">
                  <a className="mini gold" href="#full-project-inquiry">
                    Add hosting & support
                  </a>
                </div>
              </div>
              <div className="price-card">
                <div className="tag">3D PRINTING & CUSTOM BUILDS</div>
                <div className="price">Quote</div>
                <p className="small">
                  Custom prints, personalized products, prototypes. Quote-based, made-to-order.
                </p>
                <div className="actions">
                  <Link href="/3d-printing" className="mini gold">
                    See 3D Printing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ventures */}
      <section className="section" id="ventures">
        <div className="container">
          <div className="panel">
            <div className="small" style={{ letterSpacing: ".18em", opacity: 0.75 }}>
              VENTURES BY MIXEDMAKERSHOP
            </div>
            <h2 style={{ margin: "6px 0 8px" }}>The businesses that grew out of the workshop</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              MixedMakerShop is where ideas start. Some stay as projects; a few become their own ventures.
            </p>
            <div className="grid-2">
              <div className="card">
                <h3>Henry AI <span className="small">• In development</span></h3>
                <p className="small">A new AI project that&apos;s still being designed.</p>
                <div className="btn-row">
                  <Link href="/contact" className="btn">
                    Get updates ↗
                  </Link>
                </div>
              </div>
              <div className="card">
                <h3>StrainSpotter.app <span className="small">• Active</span></h3>
                <p className="small">A weed identification scanner and more.</p>
                <div className="btn-row">
                  <a href="https://strainspotter.app/" target="_blank" rel="noopener noreferrer" className="btn">
                    Visit StrainSpotter.app ↗
                  </a>
                </div>
              </div>
              <div className="card">
                <h3>GoneFishin Keychains <span className="small">• Active</span></h3>
                <p className="small">Vintage + new fishing lure keychains.</p>
                <div className="btn-row">
                  <a href="https://gonefishinkeychains.com/" target="_blank" rel="noopener noreferrer" className="btn">
                    Visit Website ↗
                  </a>
                </div>
              </div>
              <div className="card">
                <h3>Kelsey&apos;sKustom Kreations <span className="small">• Active</span></h3>
                <p className="small">Personalized apparel, gifts, and heat-pressed designs.</p>
                <div className="btn-row">
                  <a href="https://kelseyskustomkreations.com/" target="_blank" rel="noopener noreferrer" className="btn">
                    Visit Website ↗
                  </a>
                </div>
              </div>
            </div>
            <hr className="hr" />
            <div className="grid-2">
              <div className="card">
                <h3>Web Design</h3>
                <p className="small">Clean, responsive small-business sites. You work directly with me.</p>
                <div className="btn-row">
                  <Link href="/web-design" className="btn gold">
                    Browse Small Business Sites
                  </Link>
                  <Link href="/pricing" className="btn">
                    Pricing
                  </Link>
                </div>
              </div>
              <div className="card">
                <h3>3D Printing</h3>
                <p className="small">Custom prints, prototypes & parts. Quote-based, made-to-order.</p>
                <div className="btn-row">
                  <Link href="/custom-3d-printing" className="btn gold">
                    Custom 3D Printing Service
                  </Link>
                  <Link href="/3d-printing" className="btn">
                    See 3D Printing
                  </Link>
                  <Link href="/contact" className="btn">
                    Start a Project
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="panel">
            <h2 style={{ margin: "0 0 14px" }}>Ready for a better website?</h2>
            <p className="subhead" style={{ margin: "0 0 14px" }}>
              Get a free mockup or start a full project — no obligation.
            </p>
            <div className="btn-row">
              <a className="btn gold" href="#free-mockup-request">
                Get My Free Mockup
              </a>
              <a className="btn ghost" href="#full-project-inquiry">
                Start a Full Project
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
