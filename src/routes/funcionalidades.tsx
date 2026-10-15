import { NumberedCards } from "@/components/ui/numbered-cards";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage } from "@/components/content-page";
import { FeatureCards } from "@/components/ui/feature-cards";
export const Route = createFileRoute("/funcionalidades")({ component: FeaturesPage, head: () => ({ meta: [{ title: "O que ela faz — Bella Nyelle" }, { name: "description", content: "Conversa, assistência executiva, aprendizado, atendimento e recursos administrativos da Bella." }] }) });
function FeaturesPage() {
  return <ContentPage tag="O que ela faz" title="Cada recurso tem" emphasis="um cuidado por trás." intro="Da conversa aos bastidores, conheça as funções documentadas da Bella. A disponibilidade e o acesso dependem do espaço e das permissões no servidor.">
    <section className="features detail-features content-width" aria-label="Funcionalidades da Bella"><FeatureCards headingLevel={2} /></section>
    <section className="detail-editorial content-width" aria-label="Acesso e limites dos recursos"><NumberedCards headingLevel={2} items={[{ title: <>O recurso certo, <em>para cada pessoa.</em></>, content: <><p>Inglês e atendimento possuem painéis públicos para a comunidade. Gestão de cargos, moderação e configurações ficam restritas às pessoas autorizadas.</p><p>A auditoria de segurança analisa o servidor sem alterá-lo. O backup preserva a estrutura e os recursos suportados; não copia conversas comuns. Uma restauração exige prévia e confirmação em duas etapas.</p><Link className="bella-action" to="/sistemas">Ver os painéis dos sistemas</Link></> }]} /></section>
  </ContentPage>;
}
