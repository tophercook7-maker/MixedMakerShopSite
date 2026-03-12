import Link from "next/link";

export const metadata = {
  title: "3D Printing — MixedMakerShop",
  description: "Custom 3D printing services: prototypes, parts, personalized keychains, and made-to-order prints.",
};

export default function ThreeDPrintingPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <div className="small" style={{ letterSpacing: ".18em", opacity: 0.75 }}>
            WHAT I MAKE
          </div>
          <h1 style={{ margin: "8px 0" }}>Custom 3D Printing Services</h1>
          <p className="subhead">
            Custom 3D printing services for individuals and small businesses. Whether it&apos;s a prototype, a
            replacement part, or a personalized item, I focus on practical design and dependable results.
          </p>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <Link href="/custom-3d-printing" className="btn gold">
              Need a custom part printed? Request a quote →
            </Link>
          </div>
          <div className="grid-2" style={{ marginTop: 14 }}>
            <div className="card">
              <h3>Quote-based pricing</h3>
              <p className="small">
                All items are priced individually based on size, material, and options. Bulk orders and made-to-order
                designs welcome.
              </p>
              <ul className="small" style={{ margin: "10px 0 0 18px" }}>
                <li>PLA filament</li>
                <li>Quality tested before shipping</li>
                <li>Hand-finished details (when needed)</li>
              </ul>
            </div>
            <div className="card">
              <h3>Great for</h3>
              <p className="small">
                Prototypes, parts, organizers, gifts, branded keychains, and made-to-order prints.
              </p>
              <div className="btn-row">
                <Link href="/contact" className="btn gold">
                  Start a Project →
                </Link>
                <Link href="/#pricing" className="btn">
                  Website Pricing
                </Link>
              </div>
            </div>
          </div>
          <hr className="hr" />
          <h2 style={{ margin: "0 0 10px" }}>Example prints</h2>
          <p className="small" style={{ margin: "0 0 14px" }}>
            Examples of what we can print. Customization available.
          </p>
          <div className="gallery">
            {[
              { src: "/images/products/blue%20dragon.png", alt: "Blue dragon", title: "Dragon Figurines", desc: "Collectible • Multiple colors" },
              { src: "/images/products/copper-dragon.png", alt: "Copper dragon", title: "Copper Dragon", desc: "Warm tones • Color options" },
              { src: "/images/products/black-knit-cat.png", alt: "Cat with hat", title: "Cat with Hat", desc: "Decorative • Textured" },
              { src: "/images/products/baby-dragon.png", alt: "Baby dragon", title: "Baby Dragon", desc: "Desk decor • Multiple colors" },
              { src: "/images/products/uno-box.png", alt: "UNO box", title: "UNO Card Case", desc: "Functional • Game storage" },
              { src: "/images/products/articulating-monkey.png", alt: "Articulating monkey", title: "Articulating Monkey", desc: "Poseable • Size options" },
            ].map((item) => (
              <div key={item.title} className="prod">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.alt} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                <div className="p">
                  <div className="t">{item.title}</div>
                  <div className="d">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
