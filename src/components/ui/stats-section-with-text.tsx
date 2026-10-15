import { BookOpen, MessageCircle, ShieldCheck, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DiscordMark } from "@/components/ui/discord-mark";
import { features } from "@/lib/features";

const highlights = [
  { icon: Layers, value: String(features.length).padStart(2, "0"), label: "Áreas de atuação", detail: "Conversa, organização, segurança, relatórios e outros cuidados no Discord." },
  { icon: BookOpen, value: "A1 a C2", label: "Nivelamento de inglês", detail: "Teste de nível para orientar os estudos, com foco também em tecnologia." },
  { icon: MessageCircle, value: "Privado", label: "Atendimento em threads", detail: "Solicitações acompanhadas com o usuário e a equipe configurada." },
  { icon: ShieldCheck, value: "2 etapas", label: "Confirmação de restauração", detail: "Prévia e confirmação antes de aplicar um backup estrutural do servidor." },
];
export function Stats() {
  return <section className="discord-stats content-width" id="discord-em-foco" aria-labelledby="discord-stats-title">
    <div className="discord-stats-intro"><Badge className="discord-stats-badge"><DiscordMark /> No Discord</Badge>
      <h2 className="section-title" id="discord-stats-title">Pequenos detalhes.<br /><em>Recursos de verdade.</em></h2>
      <p>Na comunidade de Talisson Souza, a Bella reúne conversa, aprendizado e atendimento, com ferramentas administrativas para cuidar dos bastidores.</p>
      <small>Um retrato dos recursos documentados da Bella. Estes dados não representam métricas de uso ao vivo.</small>
    </div>
    <div className="discord-stats-grid">{highlights.map(({ icon: Icon, value, label, detail }) => <article className="discord-stat" key={label}>
      <Icon aria-hidden="true" /><p className="discord-stat-value">{value}</p><h3>{label}</h3><p className="discord-stat-detail">{detail}</p>
    </article>)}</div>
  </section>;
}
