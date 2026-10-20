import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { resolveCode } from "@/lib/gateway.functions";

export const Route = createFileRoute("/$code")({
  loader: async ({ params }) => {
    if (params.code.includes(".")) throw notFound();
    const result = await resolveCode({ data: { code: params.code } });
    if (!result.ok) throw notFound();
    throw redirect({ to: "/p/$code", params: { code: params.code.toLowerCase() } });
  },
  component: () => <p className="px-6 py-16 text-sm text-muted">Opening gateway…</p>,
});
