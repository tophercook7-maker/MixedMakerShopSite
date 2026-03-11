import Link from "next/link";
import { Users, UserCheck, FolderKanban, CheckSquare, DollarSign } from "lucide-react";

type Stat = {
  label: string;
  value: string | number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map(({ label, value, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span className="text-sm">{label}</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </Link>
      ))}
    </div>
  );
}
