import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

const FRAMES = [
  {
    label: "01 / Inspect",
    title: "A link, not a leap of faith.",
    address: "drive.google.com/file/d/portfolio",
    status: "Reading destination",
    progress: 24,
  },
  {
    label: "02 / Verify",
    title: "The destination checks out.",
    address: "drive.google.com/file/d/portfolio",
    status: "Destination verified",
    progress: 58,
  },
  {
    label: "03 / Protect",
    title: "Share a safer first impression.",
    address: "lux.link/maya-portfolio",
    status: "Gateway ready",
    progress: 100,
  },
] as const;

export function ProductWalkthrough() {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const active = FRAMES[frame] ?? FRAMES[0];

  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % FRAMES.length),
      3600,
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  function selectFrame(index: number) {
    setFrame(index);
    setPlaying(false);
  }

  return (
    <div className="product-film">
      <div className="film-heading">
        <span className="flex items-center gap-2 font-mono text-xs tracking-widest text-faint">
          <span className="film-live-dot" />
          PRODUCT WALKTHROUGH
        </span>
        <span className="font-mono text-xs text-faint">00:12</span>
      </div>

      <div
        className={`film-window film-frame-${frame}`}
        aria-label="Animated Luxlink product walkthrough"
      >
        <div className="film-browser-bar">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-danger/80" />
            <span className="size-2 rounded-full bg-warn/80" />
            <span className="size-2 rounded-full bg-safe/80" />
          </div>
          <div className="film-address">
            <LockKeyhole className="size-3 text-faint" />
            <span>lux.link / safety check</span>
          </div>
          <span className="size-5" aria-hidden="true" />
        </div>

        <div className="film-content" aria-live="polite">
          <div className="film-topline">
            <span className="font-mono text-xs tracking-widest text-accent-soft">
              LUXLINK / GATEWAY
            </span>
            <span className="flex items-center gap-1.5 font-mono text-xs text-faint">
              <span className="film-live-dot" />
              DEMO IN MOTION
            </span>
          </div>

          <div className="film-scan-card">
            <div className="flex items-center gap-3">
              <div className="film-scan-icon">
                {frame === 0 ? (
                  <ScanSearch className="size-5" />
                ) : (
                  <ShieldCheck className="size-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs uppercase tracking-wider text-faint">
                  {active.status}
                </p>
                <p className="mt-1 truncate text-sm font-medium text-fg">{active.address}</p>
              </div>
              {frame > 0 ? <Check className="size-4 shrink-0 text-safe" /> : null}
            </div>
            <div
              className="film-progress-track mt-4"
              role="progressbar"
              aria-label="Walkthrough progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={active.progress}
            >
              <span style={{ width: `${active.progress}%` }} />
            </div>
          </div>

          <div className="film-result-grid">
            <div className="film-result-card">
              <p className="font-mono text-xs text-faint">REDIRECT CHAIN</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="film-chain-node">lux.link</span>
                <span className="film-chain-line" />
                <span className="film-chain-node">drive.google.com</span>
              </div>
            </div>
            <div className="film-result-card film-trust-card">
              <p className="font-mono text-xs text-faint">PRIVACY CHECK</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-safe">
                <ShieldCheck className="size-4" />
                No IP log
              </p>
            </div>
          </div>

          <div className="film-gateway-card">
            <div className="min-w-0">
              <p className="font-mono text-xs tracking-wider text-faint">YOUR GATEWAY</p>
              <h3 className="mt-1 truncate text-sm font-semibold text-fg">{active.title}</h3>
            </div>
            <span className="film-open-icon" aria-hidden="true">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </div>

      <div className="film-controls">
        <div className="flex items-center gap-1.5" aria-label="Walkthrough scenes">
          {FRAMES.map((item, index) => (
            <button
              key={item.label}
              type="button"
              aria-label={`Show scene ${item.label}`}
              aria-pressed={frame === index}
              onClick={() => selectFrame(index)}
              className={`film-scene ${frame === index ? "film-scene-active" : ""}`}
            />
          ))}
        </div>
        <span className="min-w-24 text-right font-mono text-xs text-faint">{active.label}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
            onClick={() => setPlaying((value) => !value)}
            className="film-control-button"
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            type="button"
            aria-label="Replay walkthrough"
            onClick={() => {
              setFrame(0);
              setPlaying(true);
            }}
            className="film-control-button"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>
      <p className="film-caption">Illustrative product animation · no scan is running</p>
    </div>
  );
}
