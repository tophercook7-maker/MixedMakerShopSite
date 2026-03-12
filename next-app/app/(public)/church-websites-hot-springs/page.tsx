import Link from "next/link";

export const metadata = {
  title: "Church Websites Hot Springs | MixedMakerShop",
  description: "Church website design for Hot Springs, Arkansas.",
};

export default function ChurchWebsitesPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="panel">
          <h1 style={{ margin: "0 0 10px" }}>Church Websites in Hot Springs</h1>
          <p className="subhead">
            Clear information, events, and ways for visitors to connect with your church.
          </p>
          <Link href="/#free-mockup-request" className="btn gold" style={{ marginTop: 20 }}>
            Get My Free Mockup
          </Link>
        </div>
      </div>
    </section>
  );
}
