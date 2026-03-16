export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MinimalAdminPage() {
  return (
    <div className="space-y-4">
      <section className="admin-card">
        <h1 className="text-2xl font-bold" style={{ color: "var(--admin-fg)" }}>
          Minimal Admin Mode
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--admin-muted)" }}>
          Signed in successfully. Some admin data services are unavailable, so this reduced mode keeps core navigation online.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/admin" className="admin-btn-primary text-xs h-8 px-3 inline-flex items-center">
            Retry Full Admin
          </a>
          <a href="/admin/leads" className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center">
            Open Leads
          </a>
          <a href="/admin/scout" className="admin-btn-ghost text-xs h-8 px-3 inline-flex items-center">
            Open Scout
          </a>
        </div>
      </section>
    </div>
  );
}
