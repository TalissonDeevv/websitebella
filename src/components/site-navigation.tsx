import { Link, useLocation } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import wordmark from "@/assets/bella-wordmark.png.asset.json";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export const destinations = [
  { to: "/", label: "Início" },
  { to: "/universo", label: "O universo Bella" },
  { to: "/funcionalidades", label: "O que ela faz" },
  { to: "/comunidade", label: "Comunidade" },
  { to: "/monitoramento", label: "Monitoramento do site" },
] as const;

export function SiteNavigation() {
  const { pathname } = useLocation();
  return <header className="bella-nav">
    <Link className="nav-home" to="/" aria-label="Bella — início"><img draggable={false} className="nav-logo" src={wordmark.url} alt="Bella" /></Link>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><button className="nav-menu-button" aria-label="Abrir menu de navegação"><Menu aria-hidden="true" /></button></DropdownMenuTrigger>
      <DropdownMenuContent className="nav-menu-content" align="end" sideOffset={12}>
        {destinations.map(({ to, label }) => <DropdownMenuItem key={to} asChild><Link to={to} aria-current={pathname === to ? "page" : undefined}>{label}</Link></DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  </header>;
}
