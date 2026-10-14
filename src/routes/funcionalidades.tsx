import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage } from "@/components/content-page";
import { features } from "@/lib/features";
export const Route = createFileRoute("/funcionalidades")({ component: FeaturesPage, head: () => ({ meta: [{ title: "O que ela faz — Bella Nyelle" }, { name: "description", content: "Conversa, assistência executiva, aprendizado, atendimento e recursos administrativos da Bella." }] }) });
function FeaturesPage() {
  return <ContentPage tag="O que ela faz" title="Cada recurso tem" emphasis="um cuidado por trás." intro="Da conversa aos bastidores, conheça as funções documentadas da Bella. A disponibilidade e o acesso dependem do espaço e das permissões no servidor.">
    <section className="features detail-features content-width" aria-label="Funcionalidades da Bella"><div className="feature-grid">{features.map(({ icon: Icon, title, description, label }, index) => <article className="feature-item" id={`cuidado-${index + 1}`} key={title}><Icon className="feature-icon" aria-hidden="true" /><div><div className="feature-index"><span className="feature-number">0{index + 1}</span>{label}</div><h2 className="feature-title">{title}</h2><p className="feature-description">{description}</p></div></article>)}</div></section>
    <section className="detail-editorial content-width" aria-label="Acesso e limites dos recursos"><article><span className="eyebrow">Acesso e responsabilidade</span><h2>O recurso certo, <em>para cada pessoa.</em></h2><p>Inglês e atendimento possuem painéis públicos para a comunidade. Gestão de cargos, moderação e configurações ficam restritas às pessoas autorizadas.</p><p>A auditoria de segurança analisa o servidor sem alterá-lo. O backup preserva a estrutura e os recursos suportados; não copia conversas comuns. Uma restauração exige prévia e confirmação em duas etapas.</p><Link className="bella-action" to="/sistemas">Ver os painéis dos sistemas</Link></article></section>
  </ContentPage>;
}
