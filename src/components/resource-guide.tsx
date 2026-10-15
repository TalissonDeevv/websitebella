import { resourceGuides } from "@/lib/resource-guides";
import { NumberedCards } from "@/components/ui/numbered-cards";
import { ChevronDown } from "lucide-react";
export function ResourceGuide({ slug }: { slug: keyof typeof resourceGuides }) {
  const guide = resourceGuides[slug];
  return <div className="resource-guide content-width">
    <section className="resource-guide-sections" aria-label="Entenda os detalhes">{guide.sections.map(([title, paragraphs]) => <article key={title}><h2>{title}</h2><div>{paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></article>)}</section>
    <section className="resource-examples" aria-labelledby={`examples-${slug}`}><span className="eyebrow">Na prática</span><h2 className="section-title" id={`examples-${slug}`}>Como isso faz parte <em>do dia a dia.</em></h2><NumberedCards items={guide.examples.map(([title, content]) => ({ title, content: <p>{content}</p> }))} /></section>
    <section className="resource-questions" aria-labelledby={`questions-${slug}`}><span className="eyebrow">Antes de começar</span><h2 className="section-title" id={`questions-${slug}`}>Dúvidas sobre <em>esse recurso.</em></h2><div>{guide.questions.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>
  </div>;
}
