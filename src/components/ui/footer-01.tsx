import { ArrowUp, ArrowUpRight, Heart, LockKeyhole } from "lucide-react";
import wordmark from "@/assets/bella-wordmark.png.asset.json";

const columns = [
  { title: "O universo", links: [
    { label: "Conheça a Bella", href: "#sobre" },
    { label: "O que ela faz", href: "#funcionalidades" },
    { label: "Comunidade", href: "#essencia" },
  ] },
  { title: "Ela cuida", links: [
    { label: "Conversas", href: "#cuidado-1" },
    { label: "Sua rotina", href: "#cuidado-2" },
    { label: "Segurança", href: "#cuidado-3" },
    { label: "Comunidade", href: "#cuidado-8" },
  ] },
  { title: "Mais possibilidades", links: [
    { label: "Estatísticas", href: "#cuidado-4" },
    { label: "Parcerias", href: "#cuidado-5" },
    { label: "Aprendizado", href: "#cuidado-6" },
    { label: "Atendimento", href: "#cuidado-7" },
  ] },
];

export default function Footer01({ homePath = "" }: { homePath?: string }) {
  return (
    <footer className="bella-footer">
      <div className="content-width">
        <div className="footer-main">
          <div className="footer-about">
            <a href={`${homePath}#inicio`} aria-label="Bella — voltar ao início"><img draggable={false} className="footer-wordmark" src={wordmark.url} alt="Bella" loading="lazy" /></a>
            <p>Um pequeno universo de inteligência, delicadeza e cuidado. Feito para estar por perto.</p>
            <span className="footer-owner">Um universo de Talisson Souza</span>
            <span className="footer-private"><LockKeyhole aria-hidden="true" /> Privada. Única. Bella.</span>
          </div>
          <nav className="footer-columns" aria-label="Navegação do rodapé">
            {columns.map(column => (
              <div key={column.title}>
                <h3>{column.title}</h3>
                <ul>{column.links.map(link => <li key={link.href}><a href={`${homePath}${link.href}`}>{link.label}</a></li>)}</ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <div className="footer-credits"><span>© {new Date().getFullYear()} Bella Nyelle</span><span className="footer-love"><Heart aria-hidden="true" /> Cuidado em cada detalhe</span></div>
          <div className="footer-actions"><a href="https://github.com/TalissonDeevv/websitebella" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a><a href={`${homePath}#inicio`}>Voltar ao topo <ArrowUp aria-hidden="true" /></a></div>
        </div>
        <div className="footer-watermark" aria-hidden="true"><img draggable={false} src={wordmark.url} alt="" loading="lazy" /></div>
      </div>
    </footer>
  );
}
