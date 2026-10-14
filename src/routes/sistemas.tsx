import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import wordmark from "@/assets/bella-wordmark.png.asset.json";
import Footer01 from "@/components/ui/footer-01";
import { SystemsGallery } from "@/components/ui/systems-gallery";
import { systems } from "@/lib/systems";

export const Route = createFileRoute("/sistemas")({
  component: SystemsPage,
  head: () => ({ meta: [{ title: "Sistemas — Bella Nyelle" }, { name: "description", content: "Conheça os recursos públicos e alguns painéis administrativos da Bella Nyelle no Escritório do Talisson." }] }),
});

function SystemsPage() {
  return <div className="systems-page" id="inicio">
    <header className="systems-header content-width"><Link to="/" aria-label="Bella — início"><img className="nav-logo" src={wordmark.url} alt="Bella" /></Link><nav aria-label="Navegação dos sistemas"><Link to="/">Início</Link><a href="#publicos">Comunidade</a><a href="#administrativos">Administração</a></nav></header>
    <main>
      <div className="systems-page-intro content-width"><Link to="/" className="panel-enlarge"><ArrowLeft aria-hidden="true" /> Voltar para a Bella</Link><h1>Por dentro dos<br /><em>sistemas da Bella.</em></h1><p>Conheça os espaços que a comunidade utiliza e alguns dos painéis que ajudam a administração a organizar o dia a dia.</p></div>
      <section className="systems-page-section content-width" id="publicos" aria-labelledby="public-title"><span className="eyebrow">Para quem faz parte</span><h2 className="section-title" id="public-title">Recursos da <em>comunidade.</em></h2><SystemsGallery items={systems.filter(system => system.kind === "public")} /></section>
      <section className="systems-page-section systems-admin content-width" id="administrativos" aria-labelledby="admin-title"><span className="eyebrow">Nos bastidores</span><h2 className="section-title" id="admin-title">Algumas ferramentas <em>administrativas.</em></h2><p className="systems-notice">Estas são apenas algumas das funcionalidades administrativas da Bella. As demais não podem ser mostradas aqui. O acesso a esses painéis é restrito à administração autorizada.</p><SystemsGallery items={systems.filter(system => system.kind === "admin")} /></section>
    </main>
    <Footer01 homePath="/" />
  </div>;
}
