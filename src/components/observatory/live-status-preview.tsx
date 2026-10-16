import { ArrowUpRight, MoonStar, Radio, SunMedium } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PublicDashboard } from "@/lib/public-platform";

const operationalLabels = {
  online: "Operacional",
  away: "Baixa atividade",
  offline: "Offline",
  maintenance: "Em manutenção",
  unknown: "Aguardando dados",
} as const;

export function LiveStatusPreview({ dashboard }: { dashboard: PublicDashboard }) {
  const character = dashboard.status.character;
  return (
    <section className="live-preview content-width" aria-labelledby="live-preview-title">
      <div className="live-preview-copy">
        <span className="eyebrow">Bella Live Status</span>
        <h2 className="section-title" id="live-preview-title">
          Dois estados.
          <br />
          <em>Uma visão honesta.</em>
        </h2>
        <p>
          O estado operacional mostra se o serviço está respondendo. A rotina da Bella mostra se ela
          está acordada ou descansando, sem esconder indisponibilidades.
        </p>
        <Link to="/observatorio" search={{ period: "7d" }} className="bella-action">
          Abrir o Observatório <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
      <div className="live-preview-panel">
        <article>
          <Radio aria-hidden="true" />
          <span>Estado operacional</span>
          <strong data-state={dashboard.status.operational.state}>
            {operationalLabels[dashboard.status.operational.state]}
          </strong>
          <p>{dashboard.status.operational.message}</p>
        </article>
        <article>
          {character.state === "sleeping" ? (
            <MoonStar aria-hidden="true" />
          ) : (
            <SunMedium aria-hidden="true" />
          )}
          <span>Rotina da Bella</span>
          <strong>{character.state === "sleeping" ? "Descansando" : "Acordada"}</strong>
          <p>{character.message}</p>
        </article>
      </div>
    </section>
  );
}
