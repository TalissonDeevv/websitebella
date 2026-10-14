import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, MessageCircle, CalendarHeart, ShieldCheck, ChartNoAxesCombined, Handshake, BookOpen, Headphones, Bell } from "lucide-react";
import room from "@/assets/bella-room.png.asset.json";
import wordmark from "@/assets/bella-wordmark.png.asset.json";
import { SystemsPreview } from "@/components/ui/systems-gallery";
import InkOrbitFeatures from "@/components/ui/ink-orbit-features";
import { FaqAccordion } from "@/components/ui/faq-chat-accordion";
import Footer01 from "@/components/ui/footer-01";
import brand from "@/assets/bella-nyelle.png.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Bella Nyelle — Uma presença que cuida" },
      { name: "description", content: "Conheça Bella Nyelle: a bot privada de Talisson Souza que une assistência, cuidado com a comunidade, segurança e aprendizado no Discord." },
      { property: "og:title", content: "Bella Nyelle — Uma presença que cuida" },
      { property: "og:description", content: "Um jeitinho doce. Um mundo de possibilidades. Conheça a assistente privada Bella e tudo o que ela faz pela comunidade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const features = [
  { icon: MessageCircle, title: "Uma boa conversa, sempre", description: "Das dúvidas do dia a dia aos assuntos de tecnologia e negócios, Bella acompanha o contexto e conversa de um jeito natural, próximo e cheio de personalidade.", label: "CONVERSAS & CONHECIMENTO" },
  { icon: CalendarHeart, title: "Cada detalhe no seu lugar", description: "Recados organizados, compromissos na agenda e lembretes na hora certa. Como assistente executiva de Talisson Souza, ela cuida para que nada importante passe despercebido.", label: "ASSISTÊNCIA EXECUTIVA" },
  { icon: ShieldCheck, title: "Cuidado que protege", description: "Moderação contra spam, golpes e links suspeitos, auditorias de segurança e backups da estrutura do servidor. Uma comunidade mais tranquila, com atenção aos detalhes.", label: "SEGURANÇA & MODERAÇÃO" },
  { icon: ChartNoAxesCombined, title: "Os números contam histórias", description: "Estatísticas do site e da comunidade, gráficos, comparativos e relatórios periódicos. Bella acompanha a evolução e transforma os resultados em uma visão mais clara.", label: "ESTATÍSTICAS & RELATÓRIOS" },
  { icon: Handshake, title: "Crescer é melhor juntos", description: "Parceiros e afiliados acompanham indicações, pontos, níveis e conquistas. Oportunidades, simuladores de ganhos e materiais personalizados dão apoio a cada nova etapa.", label: "PARCEIROS & AFILIADOS" },
  { icon: BookOpen, title: "Um novo idioma, um novo mundo", description: "Inglês com foco em tecnologia, do nivelamento à conversação. Quizzes, correção de textos, entrevistas simuladas e missões diárias tornam cada conquista parte da jornada.", label: "APRENDIZADO DE INGLÊS" },
  { icon: Headphones, title: "Pode deixar seu recado", description: "Atendimento em conversas privadas, com organização por assunto e um resumo ao encerrar. Seja uma dúvida, um pedido de suporte ou um orçamento, cada contato recebe atenção.", label: "TICKETS & ATENDIMENTO" },
  { icon: Bell, title: "Uma presença que acolhe", description: "Boas-vindas personalizadas, anúncios e presença nos canais de voz. Bella recebe quem chega e mantém a comunidade por perto, informada e conectada.", label: "COMUNIDADE & PRESENÇA" },
];

function Index() {
  const [activeSection, setActiveSection] = useState("inicio");
  return (
    <div className="bella-page" id="inicio">
      <a className="bella-skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="bella-nav">
        <a className="nav-home" href="#inicio" aria-label="Bella — início"><img className="nav-logo" src={wordmark.url} alt="Bella" /></a>
        <nav className="nav-links" aria-label="Navegação principal">
          {[{ id: "inicio", label: "Início" }, { id: "sobre", label: "O universo Bella" }, { id: "funcionalidades", label: "O que ela faz" }, { id: "essencia", label: "Comunidade" }].map(({ id, label }) => (
            <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined} onClick={() => setActiveSection(id)}>{label}</a>
          ))}
        </nav>
        <a className="nav-discover" href="#sobre" onClick={() => setActiveSection("sobre")}>Conheça a Bella <span><ArrowUpRight aria-hidden="true" /></span></a>
        <details className="nav-mobile">
          <summary>Explorar <span aria-hidden="true">+</span></summary>
          <nav aria-label="Navegação para celular">
            <a href="#sobre">01 <span>O universo Bella</span></a>
            <a href="#funcionalidades">02 <span>O que ela faz</span></a>
            <a href="#essencia">03 <span>Comunidade</span></a>
          </nav>
        </details>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className="hero" aria-labelledby="bella-name">
          <img className="hero-scene" src={room.url} alt="Bella, de cabelos vermelhos e laços, em seu quarto acolhedor" fetchPriority="high" />
          <div className="hero-copy">
            <h1 className="hero-brand" id="bella-name"><img src={brand.url} alt="Bella Nyelle" /></h1>
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

        <section className="features content-width" id="funcionalidades" aria-labelledby="features-title">
          <div className="section-heading">
            <div><span className="eyebrow">Pequenos cuidados, grandes possibilidades</span><h2 className="section-title" id="features-title">Ela cuida de <em>tanta coisa.</em></h2></div>
            <span className="section-aside">E coloca um pouquinho de si em tudo.</span>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, description, label }, index) => (
              <article className="feature-item" id={`cuidado-${index + 1}`} key={title}>
                <Icon className="feature-icon" aria-hidden="true" />
                <div><div className="feature-index"><span className="feature-number">0{index + 1}</span>{label}</div><h3 className="feature-title">{title}</h3><p className="feature-description">{description}</p></div>
              </article>
            ))}
          </div>
        </section>

        <SystemsPreview />

        <section className="behind-scenes content-width" id="bastidores" aria-labelledby="behind-title">
          <div className="section-heading"><div><span className="eyebrow">Mesmo quando ninguém vê</span><h2 className="section-title" id="behind-title">Nos bastidores,<br /><em>ela continua cuidando.</em></h2></div><p className="panels-intro">O cuidado também está nos detalhes que mantêm a rotina organizada e a plataforma acompanhada.</p></div>
          <div className="behind-list">
            <article><span className="behind-number">01 / OBSERVAR</span><h3>Um olhar sobre a plataforma</h3><p>Disponibilidade, páginas, links, formulários e mudanças no repositório. A Bella acompanha o site e reúne evidências para explicar o impacto das alterações.</p></article>
            <article><span className="behind-number">02 / ORGANIZAR</span><h3>A informação encontra seu destino</h3><p>Feedbacks sincronizados sem repetir os já processados, recados classificados e compromissos com lembretes. Cada assunto chega ao lugar certo.</p></article>
            <article><span className="behind-number">03 / COMPREENDER</span><h3>Resultados com contexto</h3><p>Relatórios periódicos apresentam indicadores, tendências e recomendações. O Programa de Parceiros também conta com comparativos e histórico de resultados.</p></article>
          </div>
        </section>

        <section className="community-section content-width" id="essencia" aria-label="Escritório do Talisson no Discord">
          <InkOrbitFeatures theme="dark" brand="Bella" tag="Escritório do Talisson" title="Um lugar para criar,\n*aprender e se conectar.*"
            collaboration={{ title: "A comunidade por perto", description: "Conversas sobre tecnologia, troca de experiências e um espaço para aprender, criar e evoluir junto." }}
            reports={{ title: "Bella acompanha o dia a dia", description: "Recepção, comunicados e organização para que cada assunto encontre seu lugar no servidor." }}
            integrations={{ title: "Encontre o seu espaço", description: "Aprendizado, parcerias e atendimento convivem em uma comunidade com recursos dedicados.", tools: ["Conversas", "Inglês", "Parcerias", "Suporte"] }}
            insights={{ title: "Cada troca abre possibilidades", description: "Conhecimento compartilhado, projetos e conexões. Uma jornada construída com a participação da comunidade.", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], forecastFrom: 8 }} />
          <div className="community-invite"><p>Escritório do Talisson: o espaço oficial de Talisson Souza no Discord. Os diagramas acima são ilustrativos, sem métricas ao vivo.</p><a className="bella-action" href="https://discord.gg/qR59937ECk" target="_blank" rel="noopener noreferrer">Entrar na comunidade <ArrowUpRight aria-hidden="true" /></a></div>
        </section>
        <FaqAccordion />
      </main>

      <Footer01 />
    </div>
  );
}
