import { createFileRoute } from "@tanstack/react-router";
import { ObservatoryPage } from "@/components/observatory/observatory-page";
import { PUBLIC_PERIODS, type PublicPeriod } from "@/lib/public-platform";
import { getPublicDashboardServer } from "@/lib/public-platform.functions";

function validateSearch(search: Record<string, unknown>): { period: PublicPeriod } {
  const candidate = typeof search["period"] === "string" ? search["period"] : "7d";
  return {
    period: PUBLIC_PERIODS.includes(candidate as PublicPeriod) ? (candidate as PublicPeriod) : "7d",
  };
}

export const Route = createFileRoute("/observatorio")({
  validateSearch,
  loaderDeps: ({ search }) => ({ period: search.period }),
  loader: ({ deps }) => getPublicDashboardServer({ data: deps.period }),
  component: ObservatoryRoute,
  head: () => ({
    meta: [
      { title: "Bella Observatory — Status, atividade e evolução" },
      {
        name: "description",
        content:
          "Acompanhe o estado público, as estatísticas autorizadas, a infraestrutura e a evolução da Bella Nyelle.",
      },
      { property: "og:title", content: "Bella Observatory" },
      {
        property: "og:description",
        content:
          "Uma visão pública e cuidadosa sobre o funcionamento e a evolução da Bella Nyelle.",
      },
    ],
  }),
});

function ObservatoryRoute() {
  return <ObservatoryPage dashboard={Route.useLoaderData()} />;
}
