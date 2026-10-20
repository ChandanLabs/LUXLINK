import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export function SiteHeader({
  stage = false,
  hideBrand = false,
  code,
}: {
  stage?: boolean;
  hideBrand?: boolean;
  code?: string;
}) {
  if (stage && hideBrand) {
    return (
      <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="text-sm text-muted">
            Close
          </Link>
          {code ? <span className="font-mono text-xs text-faint">{code}</span> : null}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          {stage ? (
            <span className="font-mono text-xs text-faint">{code}</span>
          ) : (
            <>
              <a href="#method" className="hidden h-11 items-center px-3 text-sm text-muted sm:inline-flex">
                Method
              </a>
              <a href="#pricing" className="hidden h-11 items-center px-3 text-sm text-muted sm:inline-flex">
                Pricing
              </a>
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center rounded-full bg-fg px-4 text-sm font-semibold text-bg"
              >
                Vault
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
