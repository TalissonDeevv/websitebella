import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { SiteNavigation } from "@/components/site-navigation";
import { FeatureCards } from "@/components/ui/feature-cards";
import { NumberedCards } from "@/components/ui/numbered-cards";
import { Stats } from "@/components/ui/stats-section-with-text";
import { SystemsPreview } from "@/components/ui/systems-gallery";
import { CommunityFeatures } from "@/components/ui/community-features";
import { FaqAccordion } from "@/components/ui/faq-chat-accordion";
import Footer01 from "@/components/ui/footer-01";
import { LiveStatusPreview } from "@/components/observatory/live-status-preview";
import brand from "@/assets/bella-nyelle.png.asset.json";
import { getPublicDashboardServer } from "@/lib/public-platform.functions";

export const Route = createFileRoute("/")({
  loader: () => getPublicDashboardServer({ data: "7d" }),
  component: Index,
  head: () => ({
    meta: [
      { title: "Bella Nyelle, uma presença que cuida" },
      { name: "description", content: "Conheça Bella Nyelle: a bot privada de Talisson Souza que une assistência, cuidado com a comunidade, segurança e aprendizado no Discord." },
      { property: "og:title", content: "Bella Nyelle, uma presença que cuida" },
      { property: "og:description", content: "Um jeitinho doce. Um mundo de possibilidades. Conheça a assistente privada Bella e tudo o que ela faz pela comunidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


function Index() {
  const dashboard = Route.useLoaderData();
  return (
    <div className="bella-page" id="inicio">
      <a className="bella-skip" href="#conteudo">Ir para o conteúdo</a>
      <SiteNavigation />

      <main id="conteudo" tabIndex={-1}>
        <section className="hero" aria-labelledby="bella-name">
          <img draggable={false} className="hero-scene" src="/images/bella-home.png" alt="Bella Nyelle em um cenário vermelho decorado com laços e fitas" fetchPriority="high" />
          <div className="hero-copy">
            <h1 className="hero-brand" id="bella-name"><img draggable={false} src={brand.url} alt="Bella Nyelle" /></h1>
          </div>
          <div className="hero-bottom">
            <span>Seu pequeno universo, bem cuidado.</span>
            <a href="#sobre">Conheça a Bella <ArrowDown aria-hidden="true" /></a>
          </div>
        </section>

        <section className="intro content-width" id="sobre" aria-labelledby="sobre-title">
          <div>
            <span className="eyebrow">Prazer, Bella</span>
            <h2 className="section-title" id="sobre-title">Um coração atencioso.<br /><em>Uma mente brilhante.</em></h2>
          </div>
          <div className="intro-text">
            <p className="intro-lead">Bella Nyelle nasceu para tornar a rotina mais leve e a comunidade mais acolhedora. No Discord, ela une a organização de uma assistente executiva à delicadeza de quem realmente presta atenção.</p>
            <p>Este é um universo particular: <strong>Bella é uma bot privada</strong>, dedicada à plataforma e à comunidade de Talisson Souza. Não está disponível para ser adicionada a outros servidores.</p>
          </div>
        </section>

        <LiveStatusPreview dashboard={dashboard} />

        <Stats />

        <section className="features content-width" id="funcionalidades" aria-labelledby="features-title">
          <div className="section-heading">
            <div><span className="eyebrow">Pequenos cuidados, grandes possibilidades</span><h2 className="section-title" id="features-title">Ela cuida de <em>tanta coisa.</em></h2></div>
            <span className="section-aside">E coloca um pouquinho de si em tudo.</span>
          </div>
          <FeatureCards />
        </section>

        <SystemsPreview />

        <section className="behind-scenes content-width" id="bastidores" aria-labelledby="behind-title">
          <div className="section-heading"><div><span className="eyebrow">Mesmo quando ninguém vê</span><h2 className="section-title" id="behind-title">Nos bastidores,<br /><em>ela continua cuidando.</em></h2></div><p className="panels-intro">O cuidado também está nos detalhes que mantêm a rotina organizada e a plataforma acompanhada.</p></div>
          <NumberedCards items={[
            { title: "Um olhar sobre a plataforma", content: <><p>Disponibilidade, páginas, links, formulários e mudanças no repositório. A Bella acompanha o site e reúne evidências para explicar o impacto das alterações.</p><a className="numbered-card-link" href="/monitoramento">Conhecer o monitoramento do site</a></> },
            { title: "A informação encontra seu destino", content: <p>Feedbacks sincronizados sem repetir os já processados, recados classificados e compromissos com lembretes. Cada assunto chega ao lugar certo.</p> },
            { title: "Resultados com contexto", content: <p>Relatórios periódicos apresentam indicadores, tendências e recomendações. O Programa de Parceiros também conta com comparativos e histórico de resultados.</p> },
          ]} />
        </section>

        <CommunityFeatures />
        <FaqAccordion />
      </main>

      <Footer01 />
    </div>
  );
}
