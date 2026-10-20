import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrandCard } from "@/components/brand-card";
import { Chain, Radar, RiskPill } from "@/components/bits";
import { CountUp } from "@/components/count-up";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { continueGateway, unlockGateway } from "@/lib/gateway.functions";
import type { GatewayReady, GatewayResult } from "@/lib/model";
import { cn, formatWhen } from "@/lib/utils";

export function GatewayScreen({ initial }: { initial: GatewayResult }) {
  const [data, setData] = useState(initial);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!data.ok) {
    return (
      <>
        <SiteHeader stage />
        <MissingCopy
          title="This gateway doesn't exist"
          body="The code is wrong, or it was deleted."
        />
      </>
    );
  }

  if (data.status === "gone") {
    return (
      <>
        <SiteHeader stage />
        <MissingCopy
          title={data.reason === "opened" ? "This gateway already burned" : "This gateway expired"}
          body={
            data.reason === "opened"
              ? "It was set to open once. The destination has been wiped."
              : "The expiry passed, and the destination was deleted."
          }
        />
      </>
    );
  }

  if (data.status === "locked") {
    return (
      <>
        <SiteHeader stage hideBrand={data.hideBrand} code={data.code} />
        <main className="mx-auto grid min-h-[70vh] max-w-lg place-items-center px-4 py-16">
          <form
            className="w-full rounded-3xl border border-line bg-raised p-6"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              void unlockGateway({ data: { code: data.code, password } })
                .then((result) => {
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  setData(result.view);
                })
                .catch(() => setError("The lock didn't open."))
                .finally(() => setBusy(false));
            }}
          >
            <p className="font-mono text-xs tracking-widest text-faint">LOCKED</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{data.hostname}</h1>
            <p className="mt-3 text-sm text-muted">
              The preview stays hidden until the password matches.{" "}
              {data.oneTime ? "It can be opened once." : ""}
            </p>
            <label className="mt-6 block text-sm text-muted" htmlFor="gate-password">
              Password
              <input
                id="gate-password"
                type="password"
                autoComplete="off"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-line bg-bg px-3 text-fg outline-none focus-visible:outline-2 focus-visible:outline-accent"
              />
            </label>
            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
            <Button type="submit" className="mt-5 w-full" disabled={busy || password.length < 4}>
              {busy ? "Checking" : "Unlock preview"}
            </Button>
          </form>
        </main>
      </>
    );
  }

  return <ReadyStage view={data} password={password} onContinueError={setError} error={error} />;
}

function MissingCopy({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-lg place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted">{body}</p>
      </div>
    </main>
  );
}

function ReadyStage({
  view,
  password,
  error,
  onContinueError,
}: {
  view: GatewayReady;
  password: string;
  error: string;
  onContinueError: (value: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const magnet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStep(3);
      return;
    }
    const timers = [1100, 1900, 2700].map((delay, index) =>
      window.setTimeout(() => setStep(index + 1), delay),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [view.code]);

  useEffect(() => {
    if (step < 3) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(view.summary);
      return;
    }
    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(view.summary.slice(0, index));
      if (index >= view.summary.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [step, view.summary]);

  async function go() {
    setBusy(true);
    onContinueError("");
    setNote("");
    try {
      const result = await continueGateway({ data: { code: view.code, password } });
      if (!result.ok) {
        onContinueError(result.error);
        return;
      }
      if (result.blocked || !result.url) {
        setNote("This is a demonstration. No destination is opened.");
        return;
      }
      const anchor = document.createElement("a");
      anchor.href = result.url;
      anchor.rel = "noreferrer";
      anchor.referrerPolicy = "no-referrer";
      anchor.click();
    } catch {
      onContinueError("The gateway couldn't open the destination.");
    } finally {
      setBusy(false);
    }
  }

  const label =
    step === 0 ? "Scanning destination" : step === 1 ? "Page" : step === 2 ? "Signals" : "Ready";

  return (
    <>
      <SiteHeader stage hideBrand={view.hideBrand} code={view.code} />
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-12">
        <section>
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs tracking-widest text-faint">{label.toUpperCase()}</p>
            {step < 3 ? (
              <button type="button" className="text-sm text-muted" onClick={() => setStep(3)}>
                Skip ahead
              </button>
            ) : null}
          </div>
          {step === 0 ? (
            <div className="mt-6 flex items-center gap-4">
              <Radar />
              <p className="text-sm text-muted">
                Checking redirects, trackers, and the final host.
              </p>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <RiskPill risk={view.risk} />
            {view.unverified ? (
              <span className="font-mono text-xs text-warn">Unverified</span>
            ) : null}
            {view.oneTime ? (
              <span className="font-mono text-xs text-warn">Burns after opening</span>
            ) : null}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {view.title || view.hostname}
          </h1>
          <p className="mt-3 font-mono text-sm text-accent-soft">
            {view.hostname}
            {view.path !== "/" ? view.path : ""}
          </p>
          {view.description ? <p className="mt-4 max-w-xl text-muted">{view.description}</p> : null}
          <div className={cn("mt-6", step >= 1 ? "step-in" : "hidden")}>
            {view.image ? (
              <img
                src={view.image}
                alt=""
                referrerPolicy="no-referrer"
                className="aspect-video w-full rounded-2xl object-cover"
              />
            ) : (
              <BrandCard title={view.title} hostname={view.hostname} hideBrand={view.hideBrand} />
            )}
          </div>
          <div className={cn("mt-6 grid gap-4", step >= 2 ? "step-in" : "hidden")}>
            {view.reasons.length ? (
              <ul className="grid gap-1 text-sm text-muted">
                {view.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                No phishing signals stood out in the address or the preview.
              </p>
            )}
            <Chain hops={view.chain} />
          </div>
          <div className={cn("mt-6", step >= 3 ? "step-in" : "hidden")}>
            <p className="border-t border-line pt-4 text-sm leading-6">
              <span aria-hidden>{typed}</span>
              <span className="sr-only">{view.summary}</span>
            </p>
            <p className="mt-2 font-mono text-xs text-faint">
              {view.summarySource === "ai"
                ? "AI-assisted summary"
                : view.unverified
                  ? "Rule-based summary · preview unavailable"
                  : "Rule-based summary · AI unavailable in this environment"}
            </p>
            <div
              ref={magnet}
              className="mt-6 inline-flex transition-transform duration-150"
              onMouseMove={(event) => {
                const node = magnet.current;
                if (!node || !window.matchMedia("(pointer: fine)").matches) return;
                const rect = node.getBoundingClientRect();
                const x = event.clientX - (rect.left + rect.width / 2);
                const y = event.clientY - (rect.top + rect.height / 2);
                node.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px)`;
              }}
              onMouseLeave={() => {
                if (magnet.current) magnet.current.style.transform = "";
              }}
            >
              <Button onClick={() => void go()} disabled={busy} className="h-12 px-6">
                {busy ? "Opening" : view.risk === "danger" ? "Continue anyway" : "Continue"}
              </Button>
            </div>
            {view.risk === "danger" ? (
              <p className="mt-3 max-w-md text-xs text-faint">
                Luxlink will not stop you. It also will not pretend this looks ordinary.
              </p>
            ) : null}
            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
            {note ? <p className="mt-3 text-sm text-warn">{note}</p> : null}
          </div>
        </section>
        <MockBrowser view={view} visible={step >= 1} />
      </main>
    </>
  );
}

function MockBrowser({ view, visible }: { view: GatewayReady; visible: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  return (
    <aside className={cn("lg:pt-8", visible ? "step-in" : "opacity-40")}>
      <div
        ref={frame}
        className="rounded-2xl border border-line bg-raised p-3 transition-transform duration-200"
        onMouseMove={(event) => {
          const node = frame.current;
          if (!node || !window.matchMedia("(pointer: fine)").matches) return;
          const rect = node.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          node.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
        }}
        onMouseLeave={() => {
          if (frame.current) frame.current.style.transform = "";
        }}
      >
        <div className="flex items-center gap-2 border-b border-line px-2 pb-3">
          <span className="size-2.5 rounded-full bg-danger/80" />
          <span className="size-2.5 rounded-full bg-warn/80" />
          <span className="size-2.5 rounded-full bg-safe/80" />
          <span className="ml-2 truncate font-mono text-xs text-faint">{view.hostname}</span>
        </div>
        <div className="space-y-3 px-3 py-5">
          <div className="h-3 w-24 rounded-full bg-surface" />
          <div className="h-8 w-4/5 rounded-lg bg-surface" />
          <div className="h-3 w-full rounded-full bg-surface" />
          <div className="h-3 w-11/12 rounded-full bg-surface" />
          <div className="h-28 rounded-xl bg-bg" />
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Opens" value={<CountUp value={view.clicks} />} />
        <Stat label="Trackers" value={view.trackerCount} />
        <Stat label="Until" value={formatWhen(view.expiryAt).replace(" UTC", "")} />
      </dl>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-raised px-2 py-3">
      <dt className="font-mono text-xs text-faint">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
