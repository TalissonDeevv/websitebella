import { createFileRoute } from "@tanstack/react-router";
import { ResourcePage } from "@/components/resource-page";
export const Route = createFileRoute("/parcerias")({ component: () => <ResourcePage slug="parcerias" />, head: () => ({ meta: [{ title: "Parcerias | Bella Nyelle" }, { name: "description", content: "O Programa de Parceiros oferece um espaço para inscrições, materiais, indicações e acompanhamento dos resultados de cada participante." }] }) });
