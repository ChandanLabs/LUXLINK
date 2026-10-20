import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Code2, RotateCcw, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { fixCode } from "@/lib/code-fix.functions";

const EXAMPLE = "function median(a){a.sort();return a[a.length/2]}";

export const Route = createFileRoute("/code-fix")({
  head: () => ({ meta: [{ title: "Grok Code Fix · Luxlink" }] }),
  component: CodeFixPage,
});

function CodeFixPage() {
  const [code, setCode] = useState(EXAMPLE);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setAnswer("");
    try {
      const result = await fixCode({ data: { code } });
      if (result.ok) setAnswer(result.text);
      else setError(result.error);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request failed. Try again shortly.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <header className="max-w-2xl">
          <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-accent-soft">
            <Sparkles className="size-4" />
            GROK · CODE FIX
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Fix the bug. Understand why.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            Share a small JavaScript snippet with Grok for a corrected version and a concise
            explanation. Nothing you submit is saved by Luxlink.
          </p>
        </header>

        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          <form
            onSubmit={(event) => void onSubmit(event)}
            className="rounded-3xl border border-line bg-raised p-5 sm:p-6"
          >
            <div className="flex items-center gap-2">
              <Code2 className="size-4 text-accent-soft" />
              <label htmlFor="code-input" className="text-sm font-semibold">
                Code to inspect
              </label>
            </div>
            <textarea
              id="code-input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={10_000}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="mt-4 min-h-64 w-full resize-y rounded-2xl border border-line bg-bg px-4 py-3 font-mono text-sm leading-6 text-fg outline-none transition-colors placeholder:text-faint focus:border-accent"
              placeholder="Paste a JavaScript function…"
              aria-describedby="code-privacy code-length"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-faint">
              <span id="code-privacy">Sent to xAI for processing; don’t include secrets.</span>
              <span id="code-length">{code.length.toLocaleString()} / 10,000</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="submit" disabled={busy || !code.trim()}>
                {busy ? "Asking Grok…" : "Fix with Grok"}
                {!busy ? <ArrowRight className="size-4" /> : null}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCode(EXAMPLE);
                  setAnswer("");
                  setError("");
                }}
              >
                <RotateCcw className="size-4" />
                Reset example
              </Button>
            </div>
            <p className="mt-4 text-xs text-faint">
              grok-4.7 · max 3 requests per minute · no code execution
            </p>
          </form>

          <section
            aria-live="polite"
            aria-busy={busy}
            className="min-h-80 rounded-3xl border border-line bg-surface p-5 sm:p-6"
          >
            <p className="font-mono text-xs tracking-widest text-faint">GROK RESPONSE</p>
            {busy ? (
              <div className="mt-8 flex items-center gap-3 text-muted">
                <span className="radar" aria-hidden="true" />
                <span>Reviewing your snippet…</span>
              </div>
            ) : null}
            {error ? (
              <p
                role="alert"
                className="mt-6 rounded-2xl border border-danger/40 bg-bg p-4 text-sm leading-6 text-danger"
              >
                {error}
              </p>
            ) : null}
            {answer ? (
              <pre className="mt-5 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-6 text-fg">
                {answer}
              </pre>
            ) : null}
            {!busy && !error && !answer ? (
              <div className="mt-10">
                <h2 className="text-lg font-medium">Your fix will appear here</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                  Submit the example or paste your own short function. Grok only runs when you press
                  the button.
                </p>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </>
  );
}
