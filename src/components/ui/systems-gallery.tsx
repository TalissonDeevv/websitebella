import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, X } from "lucide-react";
import { systems, type BellaSystem } from "@/lib/systems";

export function SystemsGallery({ items }: { items: BellaSystem[] }) {
  const [selected, setSelected] = useState<BellaSystem | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  return (
    <Dialog.Root open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <div className="systems-list">{items.map(system => (
        <article className="system-row" key={system.id}>
          <Dialog.Trigger asChild><button className="system-preview" onClick={event => { trigger.current = event.currentTarget; setSelected(system); }} aria-label={`Conhecer ${system.title}`}>
            <div className="system-image"><img draggable={false} src={`/images/paineis/${system.id}.png`} alt={`Painel ${system.title} no Discord`} loading="lazy" width="560" height="540" /></div>
            <span className="system-image-action">Ampliar painel <ArrowUpRight aria-hidden="true" /></span>
          </button></Dialog.Trigger>
          <div className="system-description">
            <span className="eyebrow">{system.kind === "public" ? "Para a comunidade" : "Administração"}</span>
            <h3>{system.title}</h3>
            <p>{system.summary}</p>
            <ul>{system.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
          </div>
        </article>
      ))}</div>
      <Dialog.Portal><Dialog.Overlay className="panel-dialog-overlay" /><Dialog.Content className="panel-dialog-content" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus(); }}>
        {selected && <><span className="eyebrow">{selected.kind === "public" ? "Para a comunidade" : "Painel administrativo"}</span><Dialog.Title className="panel-dialog-title">{selected.title}</Dialog.Title><Dialog.Description className="panel-dialog-description">{selected.summary}</Dialog.Description><ul>{selected.details.map(detail => <li key={detail}>{detail}</li>)}</ul><img draggable={false} className="panel-dialog-image" src={`/images/paineis/${selected.id}.png`} alt={`Captura completa do painel ${selected.title}`} /><a className="panel-enlarge" href={`/images/paineis/${selected.id}.png`} target="_blank" rel="noopener noreferrer">Ver imagem ampliada <ArrowUpRight aria-hidden="true" /></a><p className="panel-context">Captura ilustrativa de uma configuração do servidor. Os estados e informações podem mudar.</p></>}
        <Dialog.Close className="panel-dialog-close" aria-label="Fechar resumo"><X aria-hidden="true" /></Dialog.Close>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  );
}

export function SystemsPreview() {
  return <section className="systems-preview content-width" id="paineis" aria-labelledby="systems-preview-title">
    <div className="section-heading"><div><span className="eyebrow">Bella, em ação</span><h2 className="section-title" id="systems-preview-title">Um pouco do que<br /><em>ela faz por aqui.</em></h2></div><p className="panels-intro">Aprender, descobrir e encontrar apoio. Três espaços da Bella para a comunidade.</p></div>
    <SystemsGallery items={systems.filter(system => system.kind === "public")} />
    <div className="systems-preview-bottom"><p>Conheça também alguns dos painéis que organizam os bastidores.</p><Link to="/sistemas" className="bella-action">Conhecer os sistemas <ArrowRight aria-hidden="true" /></Link></div>
  </section>;
}
