import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
export const Route = createFileRoute("/seguranca")({ component: () => <ResourcePage slug="seguranca" />, head: () => ({ meta: [{ title: "Segurança | Bella Nyelle" }, { name: "description", content: "A Bella apoia a administração na moderação e no acompanhamento da segurança do servidor, com auditoria, registros e backups estruturais." }] }) });
