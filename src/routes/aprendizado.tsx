import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
export const Route = createFileRoute("/aprendizado")({ component: () => <ResourcePage slug="aprendizado" />, head: () => ({ meta: [{ title: "Aprendizado | Bella Nyelle" }, { name: "description", content: "Aprenda inglês com a Bella em um espaço de estudo individual, com foco também em tecnologia e situações da vida profissional." }] }) });
