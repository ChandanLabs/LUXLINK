import type { Risk } from "@/lib/model";

export function BrandCard({
  title,
  hostname,
  hideBrand = false,
}: {
  title: string;
  hostname: string;
  hideBrand?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-raised">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-accent" />
      <div className="px-6 py-8 sm:px-8">
        <p className="font-mono text-xs tracking-widest text-faint">{hideBrand ? "PREVIEW" : "LUXLINK"}</p>
        <p className="mt-6 max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title || hostname}
        </p>
        <p className="mt-8 font-mono text-sm text-muted">{hostname}</p>
      </div>
    </div>
  );
}

function token(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function downloadBrandCard(input: { title: string; hostname: string; risk: Risk; hideBrand?: boolean }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const bg = token("--color-bg", "#09090b");
  const fg = token("--color-fg", "#f4f1ea");
  const accent = token("--color-accent", "#8b5cf6");
  const muted = token("--color-muted", "#b7b7c2");
  const riskColor =
    input.risk === "danger"
      ? token("--color-danger", "#fb7185")
      : input.risk === "caution"
        ? token("--color-warn", "#fbbf24")
        : token("--color-safe", "#34d399");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 18, 630);
  ctx.fillStyle = muted;
  ctx.font = "500 26px 'Geist Mono', ui-monospace, monospace";
  ctx.fillText(input.hideBrand ? "PREVIEW" : "LUXLINK", 72, 110);
  ctx.fillStyle = fg;
  ctx.font = "600 68px 'Geist Sans', sans-serif";
  const lines = wrap(ctx, input.title || input.hostname, 1000).slice(0, 3);
  lines.forEach((line, index) => ctx.fillText(line, 72, 250 + index * 82));
  ctx.fillStyle = riskColor;
  ctx.beginPath();
  ctx.arc(84, 548, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = muted;
  ctx.font = "500 28px 'Geist Mono', ui-monospace, monospace";
  ctx.fillText(input.hostname, 108, 558);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${input.hostname.replace(/[^a-z0-9.]+/gi, "-") || "luxlink"}-card.png`;
  link.click();
}
