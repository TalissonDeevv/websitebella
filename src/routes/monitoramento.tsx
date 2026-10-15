import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
export const Route = createFileRoute("/monitoramento")({ component: () => <ResourcePage slug="monitoramento" />, head: () => ({ meta: [{ title: "Monitoramento do site | Bella Nyelle" }, { name: "description", content: "Conheça como a Bella acompanha disponibilidade, desempenho, mudanças e feedbacks do site de Talisson Souza." }] }) });
