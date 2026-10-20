import { Link } from "@tanstack/react-router";
import { Eye, Image, KeyRound, Lock, ShieldCheck, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Chain, RiskPill } from "@/components/bits";
import { Composer } from "@/components/composer";
import { ProductWalkthrough } from "@/components/product-walkthrough";
import { SiteHeader } from "@/components/site-header";
import type { Risk } from "@/lib/model";

const SCENES: {
  id: string;
  kicker: string;
  title: string;
  body: string;
  hops: string[];
  risk: Risk;
}[] = [
  {
    id: "blind",
    kicker: "WhatsApp forward",
    title: "Six characters, then a login wall",
    body: "The message says invoice. The address says bit.ly. The page asks for a bank OTP.",
    hops: ["wa.me", "bit.ly/inv-204", "paypa1-secure-login.example/verify"],
    risk: "danger",
  },
  {
    id: "ugly",
    kicker: "A real portfolio",
    title: "The work is good. The link looks leaked.",
    body: "A drive URL with a long id reads like an accident, even when the file is meant to be shared.",
    hops: ["drive.google.com/file/d/1a8f…"],
    risk: "caution",
  },
  {
    id: "gate",
    kicker: "Same file, as a gateway",
    title: "They see the page before they continue",
    body: "Title, preview, redirect chain, and a one-line read. Then a button, not a blind hop.",
    hops: ["lux.link/maya-portfolio", "drive.google.com"],
    risk: "safe",
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Scan before you share",
    body: "Title, description, image, redirect chain, and tracker families. Private networks are refused.",
  },
  {
    icon: Eye,
    title: "A gateway, not a hop",
    body: "The person opening your link sees where it lands, then chooses to continue.",
  },
  {
    icon: KeyRound,
    title: "Password gate",
    body: "The preview stays hidden until the password matches. Only a hash is stored.",
  },
  {
    icon: Timer,
    title: "Self-destruct",
    body: "One opening, one hour, one day, or seven days. After that, the destination is deleted.",
  },
  {
    icon: Image,
    title: "Card studio",
    body: "If a page has no image, download a branded card with the title and host.",
  },
  {
    icon: Lock,
    title: "Vault on this device",
    body: "Your list is encrypted in the browser. Export it. There is no account attached.",
  },
];

export function HomePage() {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setScene((value) => (value + 1) % SCENES.length), 4200);
    return () => window.clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const sections = main.querySelectorAll<HTMLElement>(".reveal-on-scroll");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    main.classList.add("motion-ready");
    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      main.classList.remove("motion-ready");
    };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const progress = progressRef.current;
      if (!progress) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const active = SCENES[scene] ?? SCENES[0]!;

  return (
    <>
      <SiteHeader />
      <div ref={progressRef} className="reading-progress" aria-hidden="true" />
      <main ref={mainRef}>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:py-20">
          <div>
            <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-accent-soft">
              <span className="size-1.5 rounded-full bg-accent" />
              PRIVACY-FIRST GATEWAY
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              Your links deserve better than a blind redirect.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Paste any URL. Luxlink reads the page, counts the trackers, and opens a cinematic gateway before anyone
              continues. No account. No IP log. The list of links you made stays on this device.
            </p>
            <a
              href="#composer"
              className="mt-7 inline-flex h-12 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg transition-transform duration-200 hover:-translate-y-0.5"
            >
              Try a live scan
            </a>
          </div>
          <ProductWalkthrough />
        </section>

        <section className="reveal-on-scroll mx-auto max-w-5xl px-4 pb-16">
          <Composer />
        </section>

        <section className="reveal-on-scroll mx-auto max-w-5xl px-4 pb-8">
          <div className="flex flex-col gap-3 rounded-3xl border border-line bg-raised px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm text-muted">
              Play the gateway without creating a link. One looks ordinary. One is a phishing pattern, and it does not
              open a real site.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/p/$code"
                params={{ code: "demo-safe" }}
                className="inline-flex h-11 items-center rounded-full bg-fg px-4 text-sm font-semibold text-bg"
              >
                Safe demo
              </Link>
              <Link
                to="/p/$code"
                params={{ code: "demo-risk" }}
                className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm font-semibold"
              >
                Risky demo
              </Link>
            </div>
          </div>
        </section>

        <section
          className="reveal-on-scroll mx-auto max-w-5xl px-4 py-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <p className="font-mono text-xs tracking-widest text-faint">WHAT A BLIND TAP HIDES</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SCENES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScene(index)}
                className={`h-10 rounded-full px-4 text-sm ${index === scene ? "bg-fg text-bg" : "border border-line text-muted"}`}
              >
                {item.kicker}
              </button>
            ))}
          </div>
          <article className="mt-4 rounded-3xl border border-line bg-raised p-6">
            <RiskPill risk={active.risk} />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">{active.title}</h2>
            <p className="mt-3 max-w-2xl text-muted">{active.body}</p>
            <div className="mt-5">
              <Chain hops={active.hops} />
            </div>
          </article>
        </section>

        <section className="reveal-on-scroll mx-auto max-w-5xl px-4 py-12">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">Built for the link you hesitate to tap.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-line bg-raised p-5 transition-transform duration-200 hover:-translate-y-1"
              >
                <feature.icon className="size-5 text-accent-soft" strokeWidth={1.75} />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="reveal-on-scroll mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Early access is the paid plan, without the bill.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-line bg-raised p-6">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-1 text-sm text-faint">Enough to stop sharing naked links.</p>
              <ul className="mt-5 grid gap-2 text-sm text-muted">
                <li>Scan any public link</li>
                <li>7-day gateways and QR codes</li>
                <li>Redirect chain and tracker read</li>
                <li>Encrypted vault on this device</li>
              </ul>
            </article>
            <article className="rounded-3xl border border-accent bg-raised p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Early access</h3>
                <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs text-accent-soft">
                  FREE
                </span>
              </div>
              <p className="mt-2 text-sm text-faint">
                <span className="line-through">₹99</span> included for early users
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-muted">
                <li>Custom names such as /maya-portfolio</li>
                <li>Password gate and self-destruct</li>
                <li>Card studio when a page has no image</li>
                <li>Country and device counts, no IP stored</li>
                <li>Hide the Luxlink mark on the gateway</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="method" className="reveal-on-scroll mx-auto max-w-5xl px-4 py-12 pb-20">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            We don't keep a profile of you.
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Scans are not saved. A gateway stores only the destination and an expiry — plus a password hash if you set
            one — and is deleted when that time runs out. No IP logs. No tracking cookies. Your vault never leaves this
            device. Early access is free.
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["01 Scan", "The page is fetched with a hard stop on private networks, files over 5 MB, and long redirect chains."],
              ["02 Gateway", "Sharing creates a short name. Country and device counts, if you want them, never include an IP."],
              ["03 Vault", "The dashboard reads an encrypted list in this browser. Export or import the JSON if you switch devices."],
            ].map(([title, body]) => (
              <li key={title} className="rounded-3xl border border-line p-5">
                <h3 className="font-mono text-sm text-accent-soft">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>Luxlink</p>
          <p>See the page before you trust the link.</p>
        </div>
      </footer>
    </>
  );
}
