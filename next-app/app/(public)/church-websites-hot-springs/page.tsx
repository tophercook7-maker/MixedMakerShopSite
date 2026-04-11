import Link from "next/link";

export const metadata = {
  title: "Church Website Design Hot Springs | MixedMakerShop",
  description:
    "Church website design in Hot Springs, Arkansas. Clear service times, events, and next steps for first-time visitors and members.",
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
          <h2 style={{ margin: "28px 0 10px" }}>Church Landing Page Priorities</h2>
          <div className="grid-2">
            <div className="card">
              <h3>Service times and location</h3>
              <p className="small">Help first-time visitors find where and when to attend.</p>
            </div>
            <div className="card">
              <h3>Next steps and ministries</h3>
              <p className="small">Clear paths for visitors, families, and members to get connected.</p>
            </div>
            <div className="card">
              <h3>Events and updates</h3>
              <p className="small">Keep church activity visible and easy to navigate.</p>
            </div>
            <div className="card">
              <h3>Welcoming first impression</h3>
              <p className="small">A cleaner layout that reduces uncertainty for new attendees.</p>
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 22 }}>
            <Link href="/free-mockup" className="btn gold">
              Get My Free Preview
            </Link>
            <Link href="/examples" className="btn ghost">
              See Examples
            </Link>
            <Link href="/web-design" className="btn ghost">
              Web Design
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
