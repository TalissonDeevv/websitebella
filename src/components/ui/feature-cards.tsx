import { features } from "@/lib/features";
import { NumberedCards } from "@/components/ui/numbered-cards";
export function FeatureCards({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  return <NumberedCards headingLevel={headingLevel} items={features.map((feature, index) => ({ id: `cuidado-${index + 1}`, title: feature.title, content: <p>{feature.description}</p> }))} />;
}
