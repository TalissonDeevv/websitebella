import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
export const Route = createFileRoute("/atendimento")({ component: () => <ResourcePage slug="atendimento" />, head: () => ({ meta: [{ title: "Atendimento | Bella Nyelle" }, { name: "description", content: "Um espaço para dúvidas, solicitações, denúncias e propostas que precisam de acompanhamento individual no Discord." }] }) });
