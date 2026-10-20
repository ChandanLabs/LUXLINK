import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, quiet = false }: { className?: string; quiet?: boolean }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2 text-fg", className)}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <rect width="32" height="32" rx="7" fill="var(--color-raised)" stroke="var(--color-line)" />
        <rect
          x="3.6"
          y="9"
          width="15.4"
          height="14"
          rx="7"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="4.6"
        />
        <rect
          x="13"
          y="9"
          width="15.4"
          height="14"
          rx="7"
          fill="none"
          stroke="var(--color-fg)"
          strokeWidth="4.6"
        />
        <circle cx="16" cy="16" r="3.2" fill="var(--color-safe)" />
      </svg>
      {quiet ? <span className="sr-only">Luxlink</span> : <span className="text-sm font-semibold tracking-widest">LUXLINK</span>}
    </Link>
  );
}
