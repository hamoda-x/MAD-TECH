interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  accent = "text-mad-accent",
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-mad-border bg-mad-surface p-6">
      <p className="text-sm text-mad-muted">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-mad-muted">{subtitle}</p>}
    </div>
  );
}
