import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ContentPage } from "@/components/content-page";
import InkOrbitFeatures from "@/components/ui/ink-orbit-features";
export const Route = createFileRoute("/comunidade")({ component: CommunityPage, head: () => ({ meta: [{ title: "Comunidade — Bella Nyelle" }, { name: "description", content: "Conheça o Escritório do Talisson no Discord e os espaços de aprendizado, parceria e atendimento." }] }) });
function CommunityPage() {
  return <ContentPage tag="Escritório do Talisson" title="Um espaço para trocar." emphasis="E construir junto." intro="O servidor oficial de Talisson Souza no Discord reúne a comunidade e os recursos da Bella em um mesmo lugar.">
        <section className="community-section content-width" id="essencia" aria-label="Escritório do Talisson no Discord">
          <InkOrbitFeatures theme="dark" brand="Bella" tag="Escritório do Talisson" title="Um lugar para criar,\n*aprender e se conectar.*"
            collaboration={{ title: "A comunidade por perto", description: "Conversas sobre tecnologia, troca de experiências e um espaço para aprender, criar e evoluir junto." }}
            reports={{ title: "Bella acompanha o dia a dia", description: "Recepção, comunicados e organização para que cada assunto encontre seu lugar no servidor." }}
            integrations={{ title: "Encontre o seu espaço", description: "Aprendizado, parcerias e atendimento convivem em uma comunidade com recursos dedicados.", tools: ["Conversas", "Inglês", "Parcerias", "Suporte"] }}
            insights={{ title: "Cuidado que protege a comunidade", description: "Moderação, auditoria e backups ajudam a manter o servidor organizado e a administração informada.", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], forecastFrom: 8 }} />
          <div className="community-invite"><p>Escritório do Talisson: o espaço oficial de Talisson Souza no Discord. Os diagramas apresentam os recursos da comunidade e as camadas de segurança, sem indicadores ao vivo.</p><a className="bella-action" href="https://discord.gg/qR59937ECk" target="_blank" rel="noopener noreferrer">Entrar na comunidade <ArrowUpRight aria-hidden="true" /></a></div>
        </section>
    <section className="detail-editorial content-width" aria-label="Como participar"><article><span className="eyebrow">Por onde começar</span><h2>Aprender, descobrir e <em>encontrar apoio.</em></h2><p>O painel de inglês permite iniciar estudos em uma thread privada, fazer nivelamento e acompanhar o progresso. A central de atendimento organiza solicitações individuais com a equipe configurada.</p><p>O Programa de Parceiros reúne inscrição, materiais, suporte e acompanhamento privado das indicações e dos resultados.</p><Link className="bella-action" to="/sistemas">Conhecer os sistemas disponíveis</Link></article></section>
  </ContentPage>;
}
