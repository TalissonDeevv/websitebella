import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { SiteNavigation, destinations } from "@/components/site-navigation";
import Footer01 from "@/components/ui/footer-01";

export function ContentPage({ tag, title, emphasis, intro, children }: { tag: string; title: string; emphasis: string; intro: string; children: ReactNode }) {
  const { pathname } = useLocation();
  return <div className="bella-page detail-page" id="inicio">
    <a className="bella-skip" href="#conteudo">Ir para o conteúdo</a>
    <SiteNavigation />
    <main id="conteudo" tabIndex={-1}>
      <div className="detail-intro content-width"><span className="eyebrow">{tag}</span><h1>{title}<br /><em>{emphasis}</em></h1><p>{intro}</p>
        <nav className="detail-tabs" aria-label="Páginas da Bella">{destinations.map(({ to, label }) => <Link key={to} to={to} aria-current={pathname === to ? "page" : undefined}>{label}</Link>)}</nav>
      </div>
      {children}
    </main>
    <Footer01 homePath="/" />
  </div>;
}
