import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  Eye,
  Fingerprint,
  Image,
  KeyRound,
  Lock,
  ShieldCheck,
  Timer,
} from "lucide-react";
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
  address: string;
  verdict: string;
}[] = [
  {
    id: "blind",
    kicker: "The suspicious forward",
    title: "Six characters. A very different destination.",
    body: "The message says invoice. The short link hides the address. The page asks for a bank OTP. You never saw any of that coming.",
    hops: ["wa.me", "bit.ly/inv-204", "paypa1-secure-login.example/verify"],
    risk: "danger",
    address: "bit.ly/inv-204",
    verdict: "The URL does not tell the whole story.",
  },
  {
    id: "portfolio",
    kicker: "The messy portfolio link",
    title: "Great work. A link that looks like a leak.",
    body: "A long drive URL can look accidental, even when the file is exactly what you want to share. Context makes it feel intentional.",
    hops: ["drive.google.com/file/d/1a8f…"],
    risk: "caution",
    address: "drive.google.com/file/d/1a8f93c…",
    verdict: "The destination needs a better first impression.",
  },
  {
    id: "gateway",
    kicker: "The Luxlink difference",
    title: "Let people see where they are going.",
    body: "A clear destination preview, a readable redirect path, and a choice to continue. Replace the blind hop with a moment of clarity.",
    hops: ["lux.link/maya-portfolio", "drive.google.com"],
    risk: "safe",
    address: "lux.link/maya-portfolio",
    verdict: "Destination preview. Their choice.",
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "See the signals",
    body: "Read available page details, redirect hops, tracker matches, and heuristic risk signals before you share.",
  },
  {
    icon: Eye,
    title: "A gateway, not a blind hop",
    body: "Give the next person useful context and let them decide whether to continue to the destination.",
  },
  {
    icon: KeyRound,
    title: "Add a password",
    body: "Keep a gateway preview behind a password. The stored verifier is a hash, not the password itself.",
  },
  {
    icon: Timer,
    title: "Set it to expire",
    body: "Choose a time limit or a one-time opening for links that should not stay around forever.",
  },
  {
    icon: Image,
    title: "Share with style",
    body: "Create a QR code or download a branded share card when the original page has no useful artwork.",
  },
  {
    icon: Lock,
    title: "Keep your own vault",
    body: "Your gateway list is encrypted in this browser. Export it when you need a backup or a device move.",
  },
];

export function HomePage() {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setScene((value) => (value + 1) % SCENES.length), 5200);
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
      <SiteHeader home />
      <div ref={progressRef} className="reading-progress" aria-hidden="true" />
      <main ref={mainRef}>
        <section className="story-hero">
          <div className="story-hero-inner">
            <div className="story-hero-copy">
              <p className="story-eyebrow">
                <span className="story-status-dot" />A BETTER WAY TO SHARE LINKS
              </p>
              <h1>
                A link should
                <br />
                <span>show you</span>
                <br />
                where it goes.
              </h1>
              <p className="story-hero-description">
                Short links hide the destination. Luxlink turns a blind click into a clear
                preview—with context, signals, and the choice to continue.
              </p>
              <div className="story-hero-actions">
                <a className="story-primary-action" href="#tour">
                  See how it works
                  <ArrowDown className="size-4" />
                </a>
                <span className="story-duration">A 20-second tour</span>
              </div>
              <div className="story-proof-line">
                <Fingerprint className="size-4" />
                <span>Built around transparency, not blind trust.</span>
              </div>
            </div>

            <div className="story-hero-visual">
              <span className="story-orbit story-orbit-one" aria-hidden="true" />
              <span className="story-orbit story-orbit-two" aria-hidden="true" />
              <div className="story-film-label">
                <span className="story-status-dot" />
                THE LUXLINK EXPERIENCE
              </div>
              <ProductWalkthrough />
              <div className="story-floating-note story-floating-note-top">
                <ShieldCheck className="size-4 text-safe" />
                <span>Context before click</span>
              </div>
              <div className="story-floating-note story-floating-note-bottom">
                <Lock className="size-4 text-accent-soft" />
                <span>Private by design</span>
              </div>
            </div>
          </div>

          <a className="story-scroll-cue" href="#tour">
            <span>SCROLL TO EXPLORE</span>
            <span className="story-scroll-line" />
          </a>
        </section>

        <section className="story-signal-rail" aria-label="The Luxlink approach">
          <div>
            <span>01</span>
            <p>Inspect the destination</p>
          </div>
          <span className="story-rail-connector" aria-hidden="true" />
          <div>
            <span>02</span>
            <p>Understand the signals</p>
          </div>
          <span className="story-rail-connector" aria-hidden="true" />
          <div>
            <span>03</span>
            <p>Choose whether to continue</p>
          </div>
        </section>

        <section id="tour" className="story-section story-intro reveal-on-scroll">
          <div className="story-section-heading">
            <p className="story-eyebrow">THE PROBLEM IS THE MOMENT BEFORE THE CLICK</p>
            <h2>
              You got the link.
              <br />
              <span>What did you actually get?</span>
            </h2>
            <p className="story-section-lead">
              A message can look familiar. The destination behind it can be anything. Here is the
              difference a little context makes.
            </p>
          </div>

          <div
            id="story-scenes"
            className="story-scene-explorer"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="story-scene-sidebar">
              <p className="story-side-kicker">CHOOSE A MOMENT</p>
              <div className="story-scene-tabs" role="tablist" aria-label="Link-sharing scenarios">
                {SCENES.map((item, index) => (
                  <button
                    key={item.id}
                    id={`story-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={index === scene}
                    aria-controls="story-scene-panel"
                    onClick={() => {
                      setScene(index);
                      setPaused(true);
                    }}
                    className={`story-scene-tab ${index === scene ? "story-scene-tab-active" : ""}`}
                  >
                    <span className="story-tab-index">0{index + 1}</span>
                    <span>{item.kicker}</span>
                    <ArrowRight className="story-tab-arrow size-4" />
                  </button>
                ))}
              </div>
              <p className="story-scene-hint">
                A different link. The same question: where does it really go?
              </p>
            </div>

            <article
              key={active.id}
              id="story-scene-panel"
              role="tabpanel"
              aria-labelledby={`story-tab-${active.id}`}
              className="story-scene-panel"
            >
              <div className="story-browser-chrome">
                <div className="story-browser-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="story-url-bar">
                  <Lock className="size-3" />
                  <span>{active.address}</span>
                </div>
                <span className="story-browser-mark">L</span>
              </div>
              <div className="story-scene-body">
                <div className="flex items-center justify-between gap-3">
                  <span className="story-side-kicker">WHAT THE LINK TELLS YOU</span>
                  <RiskPill risk={active.risk} />
                </div>
                <h3>{active.title}</h3>
                <p>{active.body}</p>
                <div className="story-chain-box">
                  <span className="story-side-kicker">DESTINATION PATH</span>
                  <div className="mt-3">
                    <Chain hops={active.hops} />
                  </div>
                </div>
                <div className={`story-verdict story-verdict-${active.risk}`}>
                  <ShieldCheck className="size-4" />
                  <span>{active.verdict}</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="story-process-section reveal-on-scroll">
          <div className="story-process-grid">
            <div className="story-process-heading">
              <p className="story-eyebrow">THREE STEPS. NO MYSTERY.</p>
              <h2>
                Make the
                <br />
                <span>invisible visible.</span>
              </h2>
              <p>
                Luxlink adds a clear, human-readable pause between a link and the place it leads.
              </p>
              <a className="story-text-link" href="#features">
                Explore the safeguards
                <ArrowRight className="size-4" />
              </a>
            </div>

            <div className="story-steps">
              {[
                [
                  "01",
                  "Inspect",
                  "Read the page metadata, redirect path, and known tracker signals.",
                ],
                [
                  "02",
                  "Frame",
                  "Create a gateway with an optional password, custom name, or expiry.",
                ],
                [
                  "03",
                  "Choose",
                  "Let the person opening your gateway see the context and decide for themselves.",
                ],
              ].map(([number, title, body]) => (
                <article key={number} className="story-step">
                  <span className="story-step-number">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                  <span className="story-step-line" aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="story-features-section reveal-on-scroll">
          <div className="story-section-heading story-features-heading">
            <p className="story-eyebrow">MORE THAN A PRETTY SHORT LINK</p>
            <h2>
              Thoughtful details.
              <br />
              <span>Useful controls.</span>
            </h2>
            <p className="story-section-lead">
              Built for the small but important moments between “here’s a link” and “I trust where
              it goes.”
            </p>
          </div>
          <div className="story-feature-grid">
            {FEATURES.map((feature, index) => (
              <article key={feature.title} className="story-feature-card">
                <div className="story-feature-topline">
                  <span>0{index + 1}</span>
                  <feature.icon className="size-5" strokeWidth={1.65} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="trust" className="story-trust-section reveal-on-scroll">
          <div className="story-trust-visual" aria-hidden="true">
            <div className="story-trust-orbit story-trust-orbit-one" />
            <div className="story-trust-orbit story-trust-orbit-two" />
            <div className="story-trust-core">
              <Fingerprint className="size-10" strokeWidth={1.25} />
            </div>
            <span className="story-trust-label story-trust-label-top">NO PROFILE</span>
            <span className="story-trust-label story-trust-label-right">LOCAL VAULT</span>
            <span className="story-trust-label story-trust-label-bottom">CLEAR CHOICE</span>
          </div>
          <div className="story-trust-copy">
            <p className="story-eyebrow">PRIVACY IS A PRODUCT DECISION</p>
            <h2>
              Less about
              <br />
              <span>watching you.</span>
            </h2>
            <p>
              Your vault is encrypted in this browser. Gateway analytics show aggregate counts, not
              a browsing profile. No automated risk check can guarantee a site is safe—Luxlink is
              here to help people make a more informed choice.
            </p>
            <a className="story-text-link" href="#method">
              Read the privacy approach
              <ArrowRight className="size-4" />
            </a>
          </div>
        </section>

        <section className="story-ready-section reveal-on-scroll">
          <div>
            <p className="story-eyebrow">YOU’VE SEEN THE STORY</p>
            <h2>Ready to see a link differently?</h2>
            <p>Watch a sample gateway, or scroll on to inspect a link of your own.</p>
          </div>
          <div className="story-ready-actions">
            <Link to="/p/$code" params={{ code: "demo-safe" }} className="story-primary-action">
              Explore a sample gateway
              <ArrowRight className="size-4" />
            </Link>
            <a href="#try" className="story-secondary-action">
              I’m ready to try Luxlink
              <ArrowDown className="size-4" />
            </a>
          </div>
        </section>

        <section id="try" className="story-try-section">
          <div className="story-try-heading">
            <p className="story-eyebrow">YOUR TURN</p>
            <h2>Now, bring a link.</h2>
            <p>
              Everything you just saw—now in your hands. Scan a public URL, review the signals, then
              decide if you want to create a gateway.
            </p>
          </div>
          <div className="story-try-demo">
            <p className="story-side-kicker">OR START WITH A DEMO</p>
            <div className="story-try-demo-actions">
              <Link to="/p/$code" params={{ code: "demo-safe" }} className="story-demo-link">
                See a safe example
                <ArrowRight className="size-4" />
              </Link>
              <Link to="/p/$code" params={{ code: "demo-risk" }} className="story-demo-link">
                See a risky example
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="story-composer-wrap">
            <div className="story-composer-heading">
              <span className="story-step-number">01</span>
              <div>
                <h3>Inspect a destination</h3>
                <p>The scanner checks a public link. It does not open it in your browser.</p>
              </div>
            </div>
            <Composer />
          </div>
        </section>

        <section id="method" className="story-method-section reveal-on-scroll">
          <div>
            <p className="story-eyebrow">THE HONEST VERSION</p>
            <h2>Useful signals, not a promise.</h2>
          </div>
          <p>
            Page previews can fail. Tracker detection is based on known patterns. Risk labels are
            heuristic and can be wrong in either direction. Check a destination carefully before you
            enter credentials, download a file, or send money.
          </p>
        </section>
      </main>
      <footer className="story-footer">
        <div className="story-footer-inner">
          <span className="font-mono text-xs tracking-widest">LUXLINK</span>
          <p>See the page before you trust the link.</p>
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "auto"
                  : "smooth",
              });
            }}
          >
            Back to the beginning ↑
          </a>
        </div>
      </footer>
    </>
  );
}
