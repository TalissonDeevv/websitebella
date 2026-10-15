import { features } from "@/lib/features";
import { NumberedCards } from "@/components/ui/numbered-cards";
const paths = ["conversas", "rotina", "seguranca", "estatisticas", "parcerias", "aprendizado", "atendimento", "comunidade"];
export function FeatureCards({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  return <NumberedCards headingLevel={headingLevel} items={features.map((feature, index) => ({ id: `cuidado-${index + 1}`, title: feature.title, content: <><p>{feature.description}</p><a className="numbered-card-link" href={`/${paths[index]}`}>Entenda como funciona</a></> }))} />;
}
