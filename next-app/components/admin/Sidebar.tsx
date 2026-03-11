import Link from "next/link";

export default function Sidebar() {
  return (
    <nav className="p-4">
      <div className="mb-6 text-lg font-bold">MixedMakerShop</div>
      <div className="space-y-2">
        <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-100" href="/admin">
          Dashboard
        </Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-100" href="/admin/leads">
          Leads
        </Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-100" href="/admin/clients">
          Clients
        </Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-100" href="/admin/projects">
          Projects
        </Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-100" href="/admin/tasks">
          Tasks
        </Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-100" href="/admin/payments">
          Payments
        </Link>
        <Link className="block rounded-lg px-3 py-2 hover:bg-neutral-100" href="/admin/settings">
          Settings
        </Link>
      </div>
    </nav>
  );
}
