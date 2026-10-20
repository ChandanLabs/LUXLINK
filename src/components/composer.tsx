import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandCard, downloadBrandCard } from "@/components/brand-card";
import { Chain, Radar, RiskPill } from "@/components/bits";
import { QrMark } from "@/components/qr-mark";
import { Button } from "@/components/ui/button";
import { createLink, scanLink } from "@/lib/gateway.functions";
import { EXPIRY_OPTIONS, type CreatePayload, type Expiry, type ScanPayload } from "@/lib/model";
import { upsertVault } from "@/lib/vault";
import { cn } from "@/lib/utils";

const field =
  "h-12 w-full rounded-xl border border-line bg-bg px-3 text-sm text-fg outline-none placeholder:text-faint focus-visible:outline-2 focus-visible:outline-accent";

export function Composer() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [password, setPassword] = useState("");
  const [expiry, setExpiry] = useState<Expiry>("SEVEN_DAYS");
  const [hideBrand, setHideBrand] = useState(false);
  const [busy, setBusy] = useState<"scan" | "create" | null>(null);
  const [error, setError] = useState("");
  const [scan, setScan] = useState<ScanPayload | null>(null);
  const [created, setCreated] = useState<CreatePayload | null>(null);
  const [href, setHref] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!created) return;
    setHref(`${window.location.origin}/${created.code}`);
  }, [created]);

  async function runScan(nextUrl = url) {
    const target = nextUrl.trim();
    if (!target) {
      setError("Paste a link first.");
      return;
    }
    setBusy("scan");
    setError("");
    setCreated(null);
    const started = Date.now();
    try {
      const result = await scanLink({ data: { url: target } });
      const wait = Math.max(0, 700 - (Date.now() - started));
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      if (!result.ok) {
        setScan(null);
        setError(result.error);
        return;
      }
      setScan(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The scan didn't finish.");
    } finally {
      setBusy(null);
    }
  }

  async function runCreate() {
    if (!url.trim()) {
      setError("Paste a link first.");
      return;
    }
    setBusy("create");
    setError("");
    try {
      const result = await createLink({
        data: { url, customCode, password, expiry, hideBrand },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCreated(result);
      await upsertVault({
        code: result.code,
        ownerSecret: result.ownerSecret,
        title: result.title,
        hostname: result.hostname,
        createdAt: new Date().toISOString(),
        expiryAt: result.expiryAt,
        expiry: result.expiry,
        hasPassword: result.hasPassword,
        oneTime: result.oneTime,
        hideBrand: result.hideBrand,
        risk: result.risk,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The gateway wasn't created.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div id="composer" className="rounded-3xl border border-line bg-raised/80 p-4 sm:p-6">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void runScan();
        }}
      >
        <label className="block text-sm text-muted" htmlFor="link-url">
          Link to inspect
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="link-url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setCreated(null);
            }}
            onPaste={(event) => {
              const text = event.clipboardData.getData("text").trim();
              if (!text.includes(".")) return;
              event.preventDefault();
              setUrl(text);
              setCreated(null);
              void runScan(text);
            }}
            placeholder="https://"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className={field}
          />
          <Button type="submit" disabled={busy !== null} className="sm:min-w-28">
            {busy === "scan" ? "Scanning" : "Scan"}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "example.com", url: "https://example.com" },
            { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/URL" },
          ].map((sample) => (
            <button
              key={sample.url}
              type="button"
              className="h-9 rounded-full border border-line px-3 text-xs text-muted hover:text-fg"
              onClick={() => {
                setUrl(sample.url);
                setCreated(null);
                void runScan(sample.url);
              }}
            >
              Try {sample.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-muted">
            Custom name
            <input
              value={customCode}
              onChange={(event) => setCustomCode(event.target.value)}
              placeholder="maya-portfolio"
              className={cn(field, "mt-2")}
              autoCapitalize="off"
              spellCheck={false}
            />
          </label>
          <label className="block text-sm text-muted">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Optional"
              type="password"
              autoComplete="off"
              className={cn(field, "mt-2")}
            />
          </label>
          <label className="block text-sm text-muted">
            Lifetime
            <select
              value={expiry}
              onChange={(event) => setExpiry(event.target.value as Expiry)}
              className={cn(field, "mt-2")}
            >
              {EXPIRY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} — {option.hint}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              role="switch"
              aria-checked={hideBrand}
              onClick={() => setHideBrand((value) => !value)}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-line bg-bg px-3 text-left text-sm"
            >
              <span>
                <span className="block text-fg">Hide Luxlink</span>
                <span className="text-faint">On the shared gateway</span>
              </span>
              <span className={cn("h-7 w-12 rounded-full p-1", hideBrand ? "bg-accent" : "bg-surface")}>
                <span className={cn("block size-5 rounded-full bg-fg transition-transform", hideBrand && "translate-x-5")} />
              </span>
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => void runCreate()} disabled={busy !== null}>
            {busy === "create" ? "Creating" : "Create gateway"}
          </Button>
          <p className="text-xs text-faint">Early access features are included. Nothing here requires an account.</p>
        </div>
      </form>

      {busy ? (
        <div className="mt-6 flex items-center gap-4" aria-live="polite">
          <Radar />
          <p className="font-mono text-sm text-muted">
            {busy === "scan" ? "Reading the page, redirects, and tracker signals." : "Saving a gateway that can expire."}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {scan && !busy ? (
        <article className="mt-6 rounded-2xl border border-line bg-bg p-4 sm:p-5" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3">
            <RiskPill risk={scan.risk} />
            <span className="font-mono text-xs text-faint">
              {scan.trackerCount} tracker {scan.trackerCount === 1 ? "family" : "families"}
            </span>
            {scan.unverified ? <span className="font-mono text-xs text-warn">Unverified preview</span> : null}
          </div>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight">{scan.title}</h3>
          <p className="mt-1 font-mono text-sm text-accent-soft">{scan.finalUrl}</p>
          {scan.description ? <p className="mt-3 text-sm text-muted">{scan.description}</p> : null}
          {scan.reasons.length ? (
            <ul className="mt-4 grid gap-1 text-sm text-muted">
              {scan.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4">
            <Chain hops={scan.chain} />
          </div>
          <p className="mt-4 border-t border-line pt-4 text-sm leading-6">{scan.summary}</p>
          {scan.image ? (
            <img
              src={scan.image}
              alt=""
              referrerPolicy="no-referrer"
              className="mt-4 aspect-video w-full rounded-xl object-cover"
            />
          ) : null}
        </article>
      ) : null}

      {created ? (
        <article className="mt-6 grid gap-5 rounded-2xl border border-line bg-bg p-4 sm:grid-cols-[auto_1fr] sm:p-5">
          <QrMark value={href || `/${created.code}`} />
          <div>
            <p className="font-mono text-xs tracking-widest text-safe">GATEWAY READY</p>
            <p className="mt-2 break-all font-mono text-lg text-fg">{href || `/${created.code}`}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  const text = href || `/${created.code}`;
                  void navigator.clipboard.writeText(text).then(
                    () => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1600);
                    },
                    () => setCopied(false),
                  );
                }}
              >
                {copied ? "Copied" : "Copy link"}
              </Button>
              <Link
                to="/p/$code"
                params={{ code: created.code }}
                className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-semibold"
              >
                Open gateway
              </Link>
              <Button
                variant="ghost"
                onClick={() =>
                  downloadBrandCard({
                    title: created.title,
                    hostname: created.hostname,
                    risk: created.risk,
                    hideBrand: created.hideBrand,
                  })
                }
              >
                Download card
              </Button>
            </div>
            <p className="mt-3 text-xs text-faint">Saved in the encrypted vault on this device.</p>
          </div>
          <div className="sm:col-span-2">
            <BrandCard title={created.title} hostname={created.hostname} hideBrand={created.hideBrand} />
          </div>
        </article>
      ) : null}
    </div>
  );
}
