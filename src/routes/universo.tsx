import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage } from "@/components/content-page";
import { FaqAccordion } from "@/components/ui/faq-chat-accordion";
export const Route = createFileRoute("/universo")({ component: UniversePage, head: () => ({ meta: [{ title: "O universo Bella — Bella Nyelle" }, { name: "description", content: "Conheça a assistente privada de Talisson Souza, sua presença no Discord e o cuidado com a plataforma." }] }) });
function UniversePage() {
  return <ContentPage tag="Prazer, Bella" title="Uma presença próxima." emphasis="Um universo particular." intro="Bella Nyelle combina assistência conversacional, organização e acompanhamento da plataforma de Talisson Souza.">
    <section className="detail-editorial content-width" aria-label="Sobre a Bella">
      <article><span className="eyebrow">01 / Sua identidade</span><h2>Assistência com <em>contexto.</em></h2><p>No Discord, a Bella conversa sobre tecnologia, programação, negócios e dúvidas do dia a dia. Ela utiliza o conhecimento oficial do site e do servidor para orientar suas respostas.</p><p>As conversas públicas acontecem por menção ou resposta à Bella, evitando interromper o chat sem ser chamada.</p></article>
      <article><span className="eyebrow">02 / A rotina</span><h2>Organizar também é <em>cuidar.</em></h2><p>Recados, lembretes, compromissos e anúncios fazem parte da assistência executiva. Ela também acompanha feedbacks, disponibilidade e alterações da plataforma.</p><p>As ações executivas são reservadas ao proprietário. O acesso aos painéis administrativos depende das permissões configuradas.</p></article>
      <article><span className="eyebrow">03 / Seu espaço</span><h2>Privada. Única. <em>Bella.</em></h2><p>A Bella é uma bot privada, dedicada ao universo de Talisson Souza. Não existe um fluxo público para adicioná-la a outros servidores.</p><p>Quem faz parte da comunidade pode conhecer os recursos disponibilizados por lá, como aprendizado de inglês e atendimento.</p><Link className="bella-action" to="/comunidade">Conhecer a comunidade</Link></article>
    </section>
    <FaqAccordion />
  </ContentPage>;
}
