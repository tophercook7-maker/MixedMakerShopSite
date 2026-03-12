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
    <div className="admin-stats-grid">
      {stats.map(({ label, value, href, icon: Icon }) => (
        <Link key={label} href={href} className="admin-stat-card block">
          <div className="admin-stat-icon-wrap">
            <Icon className="admin-stat-icon" />
          </div>
          <div className="admin-stat-label">{label}</div>
          <div className="admin-stat-value">{value}</div>
        </Link>
      ))}
    </div>
  );
}
