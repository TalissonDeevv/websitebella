import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Heart, LockKeyhole, MessageCircle, CalendarHeart, ShieldCheck, ChartNoAxesCombined, Handshake, BookOpen, Headphones, Bell } from "lucide-react";
import room from "@/assets/bella-room.png.asset.json";
import wordmark from "@/assets/bella-wordmark.png.asset.json";
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
  return (
    <div className="bella-page" id="inicio">
      <header className="bella-nav">
        <a href="#inicio" aria-label="Bella — início"><img className="nav-logo" src={wordmark.url} alt="Bella" /></a>
        <nav className="nav-links" aria-label="Navegação principal">
          <a href="#sobre">O universo Bella</a>
          <a href="#funcionalidades">O que ela faz</a>
          <a href="#essencia">Sua essência</a>
        </nav>
        <span className="private-note"><LockKeyhole aria-hidden="true" /> Bot privada</span>
      </header>

      <main>
        <section className="hero" aria-labelledby="bella-name">
          <img className="hero-scene" src={room.url} alt="Bella, de cabelos vermelhos e laços, em seu quarto acolhedor" fetchPriority="high" />
          <div className="hero-copy">
            <h1 className="hero-brand" id="bella-name"><img src={brand.url} alt="Bella Nyelle" /></h1>
            <p className="hero-description">Mais que uma assistente, uma presença que cuida. Bella organiza, protege e conecta o universo de Talisson Souza, com inteligência, carinho e um charme só dela.</p>
            <div className="hero-signature"><Heart aria-hidden="true" /> Feita de cuidado, em cada detalhe.</div>
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
            <p>Bella Nyelle nasceu para tornar a rotina mais leve e a comunidade mais acolhedora. No Discord, ela une a organização de uma assistente executiva à delicadeza de quem realmente presta atenção.</p>
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
              <article className="feature-item" key={title}>
                <Icon className="feature-icon" aria-hidden="true" />
                <div><h3 className="feature-title">{title}</h3><p className="feature-description">{description}</p><div className="feature-index">0{index + 1} / {label}</div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="essence" id="essencia" aria-labelledby="essence-title">
          <div className="content-width">
            <Heart className="essence-heart" aria-hidden="true" />
            <span className="eyebrow">A essência da Bella</span>
            <h2 id="essence-title">Inteligência para resolver.<br /><em>Delicadeza para estar presente.</em></h2>
            <p>Entre uma conversa e um lembrete, entre acolher e proteger, existe o que faz a Bella ser Bella: seu jeito único de cuidar.</p>
            <div className="essence-signature">Com carinho, Bella Nyelle.</div>
          </div>
        </section>
      </main>

      <footer className="bella-footer content-width">
        <div className="footer-upper"><span>UM UNIVERSO DE TALISSON SOUZA</span><span className="private-note"><LockKeyhole aria-hidden="true" /> Privada. Única. Bella.</span></div>
        <a href="#inicio" aria-label="Voltar ao início"><img className="footer-wordmark" src={wordmark.url} alt="Bella" loading="lazy" /></a>
        <div className="footer-bottom"><span>© 2026 Bella Nyelle</span><span className="footer-love">Um pouquinho de inteligência. Muito <Heart aria-label="carinho" />.</span><a className="back-top" href="#inicio">Voltar ao topo <ArrowUp aria-hidden="true" /></a></div>
      </footer>
    </div>
  );
}
