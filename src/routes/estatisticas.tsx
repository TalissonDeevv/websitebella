import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
export const Route = createFileRoute("/estatisticas")({ component: () => <ResourcePage slug="estatisticas" />, head: () => ({ meta: [{ title: "Estatísticas | Bella Nyelle" }, { name: "description", content: "A Bella reúne indicadores da plataforma e da comunidade em painéis e relatórios, para que Talisson acompanhe a evolução com mais contexto." }] }) });
