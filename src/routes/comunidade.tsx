import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ContentPage } from "@/components/content-page";
import { CommunityFeatures } from "@/components/ui/community-features";
export const Route = createFileRoute("/comunidade")({ component: CommunityPage, head: () => ({ meta: [{ title: "Comunidade — Bella Nyelle" }, { name: "description", content: "Conheça o Escritório do Talisson no Discord e os espaços de aprendizado, parceria e atendimento." }] }) });
function CommunityPage() {
  return <ContentPage tag="Escritório do Talisson" title="Um espaço para trocar." emphasis="E construir junto." intro="O servidor oficial de Talisson Souza no Discord reúne a comunidade e os recursos da Bella em um mesmo lugar.">
        <CommunityFeatures />
    <section className="detail-editorial content-width" aria-label="Como participar"><article><span className="eyebrow">Por onde começar</span><h2>Aprender, descobrir e <em>encontrar apoio.</em></h2><p>O painel de inglês permite iniciar estudos em uma thread privada, fazer nivelamento e acompanhar o progresso. A central de atendimento organiza solicitações individuais com a equipe configurada.</p><p>O Programa de Parceiros reúne inscrição, materiais, suporte e acompanhamento privado das indicações e dos resultados.</p><Link className="bella-action" to="/sistemas">Conhecer os sistemas disponíveis</Link></article></section>
  </ContentPage>;
}
