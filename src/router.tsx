import { createRouter, Link } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs tracking-widest text-faint">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">This gateway doesn't exist</h1>
        <p className="mt-3 max-w-sm text-muted">It expired, was destroyed, or the code is wrong.</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-semibold text-bg"
        >
          Create one
        </Link>
      </div>
    </main>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
  });
}
