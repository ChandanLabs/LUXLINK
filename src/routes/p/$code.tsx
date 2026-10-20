import { createFileRoute, notFound } from "@tanstack/react-router";
import { GatewayScreen } from "@/components/gateway-stage";
import { getGateway } from "@/lib/gateway.functions";

export const Route = createFileRoute("/p/$code")({
  loader: async ({ params }) => {
    const data = await getGateway({ data: { code: params.code } });
    if (!data.ok) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.status === "ready"
            ? `${loaderData.title || loaderData.hostname} · Luxlink`
            : "Gateway · Luxlink",
      },
    ],
  }),
  component: function GatewayPage() {
    const data = Route.useLoaderData();
    return <GatewayScreen initial={data} />;
  },
});
