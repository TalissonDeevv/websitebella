import { ArrowUpRight } from "lucide-react";
import { DiscordMark } from "@/components/ui/discord-mark";
import { NumberedCards } from "@/components/ui/numbered-cards";
const communityItems = [
  { title: "Bella na comunidade", content: <p>Recepção, comunicados e organização para acompanhar o dia a dia do servidor.</p> },
  { title: "Encontre seu espaço", content: <p>Conversas, aprendizado de inglês, parcerias e atendimento em espaços dedicados.</p> },
  { title: "Cuidado que protege", content: <p>Moderação, auditoria e backups ajudam a administração. O backup preserva a estrutura, sem copiar conversas comuns.</p> },
  { title: "Aprender e encontrar apoio", content: <p>Estude inglês no seu ritmo e abra um atendimento privado quando precisar de acompanhamento.</p> },
];
export function CommunityFeatures() {
  return <section className="discord-features content-width" id="essencia" aria-labelledby="discord-features-title">
    <div className="section-heading"><div><span className="eyebrow"><DiscordMark className="community-discord-mark" /> Escritório do Talisson</span><h2 className="section-title" id="discord-features-title">Um lugar para criar,<br /><em>aprender e se conectar.</em></h2></div></div>
    <NumberedCards items={communityItems} />
    <div className="community-invite"><p>Conheça o Escritório do Talisson no Discord e os recursos disponíveis para a comunidade.</p><a className="bella-action" href="https://discord.gg/qR59937ECk" target="_blank" rel="noopener noreferrer">Entrar na comunidade <ArrowUpRight aria-hidden="true" /></a></div>
  </section>;
}
