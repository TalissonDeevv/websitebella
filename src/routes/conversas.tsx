import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
export const Route = createFileRoute("/conversas")({ component: () => <ResourcePage slug="conversas" />, head: () => ({ meta: [{ title: "Conversas | Bella Nyelle" }, { name: "description", content: "No Discord, a Bella ajuda com dúvidas e acompanha conversas sobre tecnologia, programação, negócios e assuntos do dia a dia." }] }) });
