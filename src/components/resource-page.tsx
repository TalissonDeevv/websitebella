import { ContentPage } from "@/components/content-page";
import { NumberedCards } from "@/components/ui/numbered-cards";
import { publicResources } from "@/lib/public-resources";
import { ArrowUpRight } from "lucide-react";
export function ResourcePage({ slug }: { slug: typeof publicResources[number]["slug"] }) {
  const resource = publicResources.find(item => item.slug === slug)!;
  return <ContentPage tag={resource.label} title={resource.title} emphasis={resource.emphasis} intro={resource.intro}>
    <section className="resource-overview content-width" aria-labelledby="resource-overview-title">
      <figure className="resource-figure"><img draggable={false} src={resource.image} alt={resource.alt} width="1000" height="700" /><figcaption>{resource.caption}</figcaption></figure>
      <div className="resource-overview-copy"><span className="eyebrow">Como funciona</span><h2 className="section-title" id="resource-overview-title">{resource.summary}</h2><p>{resource.body}</p></div>
    </section>
    <section className="resource-steps content-width" aria-label={`Como funciona: ${resource.label}`}><NumberedCards items={resource.steps.map(([title, content]) => ({ title, content: <p>{content}</p> }))} /><p className="resource-note">{resource.note}</p></section>
    <nav className="resource-navigation content-width" aria-label="Outras possibilidades da Bella">{publicResources.map(item => <a key={item.slug} href={`/${item.slug}`} aria-current={item.slug === slug ? "page" : undefined}>{item.label}</a>)}</nav>
    <div className="resource-cta content-width"><p>Os recursos da Bella fazem parte do universo de Talisson Souza no Discord.</p><a className="bella-action" href="https://discord.gg/qR59937ECk" target="_blank" rel="noopener noreferrer">Conhecer a comunidade <ArrowUpRight aria-hidden="true" /></a></div>
  </ContentPage>;
}
