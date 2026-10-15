import { ResourceGuide } from "@/components/resource-guide";
import { NumberedCards } from "@/components/ui/numbered-cards";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ContentPage } from "@/components/content-page";
import { CommunityFeatures } from "@/components/ui/community-features";
export const Route = createFileRoute("/comunidade")({ component: CommunityPage, head: () => ({ meta: [{ title: "Comunidade — Bella Nyelle" }, { name: "description", content: "Conheça o Escritório do Talisson no Discord e os espaços de aprendizado, parceria e atendimento." }] }) });
function CommunityPage() {
  return <ContentPage tag="Escritório do Talisson" title="Um espaço para trocar." emphasis="E construir junto." intro="O servidor oficial de Talisson Souza no Discord reúne a comunidade e os recursos da Bella em um mesmo lugar.">
    <section className="resource-overview content-width" aria-labelledby="community-overview-title">
      <figure className="resource-figure"><img draggable={false} src="/images/paineis/comunidade-escritorio.png" alt="Apresentação do Escritório Oficial do Talisson Souza no Discord" width="536" height="592" /><figcaption>Apresentação do Escritório Oficial do Talisson Souza no Discord. <a href="/images/paineis/comunidade-escritorio.png" target="_blank" rel="noopener noreferrer">Ver imagem em tamanho real <ArrowUpRight aria-hidden="true" /></a></figcaption></figure>
      <div className="resource-overview-copy"><span className="eyebrow">Nossa comunidade</span><h2 className="section-title" id="community-overview-title">Um espaço para compartilhar e construir.</h2><p>O Escritório do Talisson reúne conversas sobre tecnologia, desenvolvimento de software, projetos e negócios. É o espaço oficial para acompanhar o trabalho de Talisson Souza, trocar experiências e participar da comunidade.</p><p className="community-overview-paragraph">A Bella acompanha esse dia a dia com recepção, comunicados e recursos dedicados a aprendizado, parcerias e atendimento.</p><a className="bella-action resource-site-link" href="https://discord.gg/qR59937ECk" target="_blank" rel="noopener noreferrer">Entrar na comunidade <ArrowUpRight aria-hidden="true" /></a></div>
    </section>
        <CommunityFeatures />
    <section className="detail-editorial content-width" aria-label="Como participar"><NumberedCards headingLevel={2} items={[{ title: <>Aprender, descobrir e <em>encontrar apoio.</em></>, content: <><p>O painel de inglês permite iniciar estudos em uma thread privada, fazer nivelamento e acompanhar o progresso. A central de atendimento organiza solicitações individuais com a equipe configurada.</p><p>O Programa de Parceiros reúne inscrição, materiais, suporte e acompanhamento privado das indicações e dos resultados.</p><Link className="bella-action" to="/sistemas">Conhecer os sistemas disponíveis</Link></> }]} /></section>
    <ResourceGuide slug="comunidade" />
  </ContentPage>;
}
