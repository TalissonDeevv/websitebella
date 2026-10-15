import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
export const Route = createFileRoute("/rotina")({ component: () => <ResourcePage slug="rotina" />, head: () => ({ meta: [{ title: "Sua rotina | Bella Nyelle" }, { name: "description", content: "Recados, lembretes, compromissos e comunicados fazem parte da assistência executiva que a Bella oferece a Talisson Souza." }] }) });
