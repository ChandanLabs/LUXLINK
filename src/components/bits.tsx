import { ChevronRight } from "lucide-react";
import type { Risk } from "@/lib/model";
import { cn } from "@/lib/utils";

const RISK: Record<Risk, { label: string; className: string }> = {
  safe: { label: "Safe", className: "border-safe/30 bg-safe/10 text-safe" },
  caution: { label: "Caution", className: "border-warn/30 bg-warn/10 text-warn" },
  danger: { label: "Danger", className: "border-danger/30 bg-danger/10 text-danger" },
};

export function RiskPill({ risk }: { risk: Risk }) {
  const item = RISK[risk];
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-3 font-mono text-xs tracking-wide",
        item.className,
      )}
    >
      {item.label}
    </span>
  );
}

export function Chain({ hops }: { hops: string[] }) {
  if (!hops.length) return null;
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {hops.map((hop, index) => (
        <li key={`${hop}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight className="size-3.5 text-faint" aria-hidden /> : null}
          <span className="max-w-full truncate rounded-lg border border-line bg-bg px-2 py-1 font-mono text-xs text-muted">
            {hop}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Radar() {
  return <div className="radar" aria-hidden />;
}

export function Meter({ rows, empty }: { rows: { name: string; count: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (!rows.length) return <p className="text-sm text-faint">{empty}</p>;
  return (
    <ul className="grid gap-3">
      {rows.map((row) => (
        <li key={row.name}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>{row.name}</span>
            <span className="tabular-nums text-muted">{row.count}</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-bg">
            <div
              className="h-1.5 rounded-full bg-accent"
              style={{ width: `${Math.max(6, Math.round((row.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
