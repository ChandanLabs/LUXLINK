import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandCard, downloadBrandCard } from "@/components/brand-card";
import { Meter, RiskPill } from "@/components/bits";
import { CountUp } from "@/components/count-up";
import { QrMark } from "@/components/qr-mark";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { destroyLink, linkAnalytics } from "@/lib/gateway.functions";
import { EXPIRY_OPTIONS, type AnalyticsPayload, type VaultLink } from "@/lib/model";
import { downloadVault, loadVault, parseVaultImport, removeVault, resetVault, saveVault } from "@/lib/vault";
import { cn, formatWhen } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Vault · Luxlink" }] }),
  component: DashboardPage,
});

function expiryLabel(id: VaultLink["expiry"]) {
  return EXPIRY_OPTIONS.find((option) => option.id === id)?.label ?? "7 days";
}

function DashboardPage() {
  const [ready, setReady] = useState(false);
  const [links, setLinks] = useState<VaultLink[]>([]);
  const [broken, setBroken] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [stats, setStats] = useState<AnalyticsPayload | null>(null);
  const [statsError, setStatsError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [href, setHref] = useState("");

  useEffect(() => {
    void loadVault()
      .then((items) => {
        setLinks(items);
        setSelected(items[0]?.code ?? null);
        setReady(true);
      })
      .catch(() => {
        setBroken(true);
        setReady(true);
      });
  }, []);

  const current = links.find((item) => item.code === selected) ?? null;

  useEffect(() => {
    if (!current) {
      setStats(null);
      setHref("");
      return;
    }
    setHref(`${window.location.origin}/${current.code}`);
    setConfirming(false);
    setStats(null);
    setStatsError("");
    let cancel = false;
    void linkAnalytics({ data: { code: current.code, ownerSecret: current.ownerSecret } })
      .then((result) => {
        if (cancel) return;
        if (!result.ok) {
          setStatsError(result.error);
          return;
        }
        setStats(result);
      })
      .catch(() => {
        if (!cancel) setStatsError("Counts couldn't be loaded.");
      });
    return () => {
      cancel = true;
    };
  }, [current?.code, current?.ownerSecret]);

  async function onImport(file: File) {
    try {
      const text = await file.text();
      const incoming = parseVaultImport(text);
      const merged = [...incoming, ...links.filter((item) => !incoming.some((row) => row.code === item.code))].slice(0, 200);
      await saveVault(merged);
      setLinks(merged);
      setSelected(merged[0]?.code ?? null);
      setBroken(false);
      setNotice(`Imported ${incoming.length} gateways.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Import failed.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-3xl border border-accent/40 bg-raised px-5 py-4">
          <p className="font-mono text-xs tracking-widest text-accent-soft">EARLY ACCESS</p>
          <p className="mt-2 text-sm text-muted">
            Premium is unlocked. Custom names, passwords, self-destruct, cards, and counts are free. This list never
            leaves the browser.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => downloadVault(links)} disabled={!links.length}>
            Export JSON
          </Button>
          <label className="inline-flex h-11 cursor-pointer items-center rounded-full border border-line px-5 text-sm font-semibold">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void onImport(file);
              }}
            />
          </label>
          {broken ? (
            <Button
              variant="ghost"
              onClick={() => {
                resetVault();
                setLinks([]);
                setBroken(false);
                setSelected(null);
              }}
            >
              Reset vault
            </Button>
          ) : null}
          {notice ? <p className="text-sm text-muted">{notice}</p> : null}
        </div>

        {!ready ? <p className="mt-10 text-sm text-faint">Opening the vault…</p> : null}

        {ready && broken ? (
          <p className="mt-10 max-w-md text-sm text-muted">
            The encrypted vault on this device could not be read. Reset it only if you have an export.
          </p>
        ) : null}

        {ready && !broken && links.length === 0 ? (
          <div className="mt-16 max-w-md">
            <div className="radar" aria-hidden />
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">Paste your first link</h1>
            <p className="mt-3 text-muted">Gateways you create show up here, on this browser only.</p>
            <Link
              to="/"
              className="mt-6 inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg"
            >
              Create a gateway
            </Link>
          </div>
        ) : null}

        {ready && links.length > 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <ul className="grid gap-3">
              {links.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => setSelected(item.code)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-left transition-colors",
                      item.code === current?.code ? "border-accent bg-raised" : "border-line bg-bg hover:bg-raised",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium">{item.title || item.hostname}</span>
                      <RiskPill risk={item.risk} />
                    </div>
                    <p className="mt-2 truncate font-mono text-xs text-faint">/{item.code}</p>
                    <p className="mt-2 text-xs text-muted">
                      {item.hostname} · {expiryLabel(item.expiry)}
                      {item.hasPassword ? " · locked" : ""}
                      {item.oneTime ? " · one opening" : ""}
                    </p>
                  </button>
                </li>
              ))}
            </ul>

            {current ? (
              <section className="h-fit rounded-3xl border border-line bg-raised p-5 lg:sticky lg:top-24">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{current.title || current.hostname}</h1>
                    <p className="mt-1 font-mono text-sm text-muted">{current.hostname}</p>
                  </div>
                  <QrMark value={href || `/${current.code}`} />
                </div>
                <p className="mt-4 break-all font-mono text-sm">{href || `/${current.code}`}</p>
                <p className="mt-2 text-xs text-faint">Deletes {formatWhen(current.expiryAt)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      const text = href || `/${current.code}`;
                      void navigator.clipboard.writeText(text).then(() => setNotice("Copied.")).catch(() => setNotice("Copy failed."));
                    }}
                  >
                    Copy
                  </Button>
                  <Link
                    to="/p/$code"
                    params={{ code: current.code }}
                    className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-semibold"
                  >
                    Open
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      downloadBrandCard({
                        title: current.title,
                        hostname: current.hostname,
                        risk: current.risk,
                        hideBrand: current.hideBrand,
                      })
                    }
                  >
                    Card
                  </Button>
                </div>
                <div className="mt-6">
                  <BrandCard title={current.title} hostname={current.hostname} hideBrand={current.hideBrand} />
                </div>
                <div className="mt-6 grid gap-5">
                  <div>
                    <p className="font-mono text-xs tracking-widest text-faint">OPENS</p>
                    <p className="mt-2 text-3xl font-semibold">
                      <CountUp value={stats?.clicks ?? 0} />
                    </p>
                    {statsError ? <p className="mt-2 text-sm text-danger">{statsError}</p> : null}
                  </div>
                  <div>
                    <p className="mb-3 font-mono text-xs tracking-widest text-faint">COUNTRY</p>
                    <Meter rows={stats?.countries ?? []} empty="No opens recorded yet." />
                  </div>
                  <div>
                    <p className="mb-3 font-mono text-xs tracking-widest text-faint">DEVICE</p>
                    <Meter rows={stats?.devices ?? []} empty="No opens recorded yet." />
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      void removeVault(current.code).then((next) => {
                        setLinks(next);
                        setSelected(next[0]?.code ?? null);
                        setNotice("Removed from this device. The gateway still works until it expires.");
                      });
                    }}
                  >
                    Remove from vault
                  </Button>
                  {confirming ? (
                    <Button
                      onClick={() => {
                        void destroyLink({ data: { code: current.code, ownerSecret: current.ownerSecret } }).then(
                          async (result) => {
                            if (!result.ok) {
                              setNotice(result.error);
                              return;
                            }
                            const next = await removeVault(current.code);
                            setLinks(next);
                            setSelected(next[0]?.code ?? null);
                            setNotice("Gateway deleted.");
                            setConfirming(false);
                          },
                        );
                      }}
                    >
                      Confirm delete
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setConfirming(true)}>
                      Delete gateway
                    </Button>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </main>
    </>
  );
}
