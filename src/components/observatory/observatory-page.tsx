import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Command,
  Database,
  HeartHandshake,
  History,
  MoonStar,
  Radio,
  ServerCog,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SiteNavigation } from "@/components/site-navigation";
import Footer01 from "@/components/ui/footer-01";
import type { PublicDashboard, PublicEditorialItem, PublicPeriod } from "@/lib/public-platform";
import { formatPublicMetric } from "@/lib/public-platform";
import { CommandsCatalog } from "./commands-catalog";
import { ObservatoryChart } from "./observatory-chart";

const periodOptions: { value: PublicPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "12m", label: "12 meses" },
];

const statusLabels = {
  online: "Operacional",
  away: "Baixa atividade",
  offline: "Offline",
  maintenance: "Em manutenção",
  unknown: "Desconhecido",
} as const;

const serviceLabels = {
  operational: "Operacional",
  degraded: "Degradação",
  partial_outage: "Indisponibilidade parcial",
  offline: "Indisponível",
  maintenance: "Manutenção",
  unknown: "Desconhecido",
} as const;

function formatDate(value: string | null, includeTime = false) {
  if (!value) return "Ainda não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "America/Recife",
  }).format(new Date(value));
}

function EmptyState({ title, children }: { title: string; children: string }) {
  return (
    <div className="observatory-empty">
      <span>{title}</span>
      <p>{children}</p>
    </div>
  );
}

function EditorialList({ items, empty }: { items: PublicEditorialItem[]; empty: string }) {
  if (!items.length) return <EmptyState title="Nada publicado por enquanto">{empty}</EmptyState>;
  return (
    <div className="editorial-list">
      {items.slice(0, 6).map((item) => (
        <article key={item.id}>
          <div>
            <span>{item.category ?? item.status.replaceAll("_", " ")}</span>
            {item.version && <b>{item.version}</b>}
          </div>
          <h3>{item.title}</h3>
          <p>{item.summary}</p>
          {(item.publishedAt || item.targetDate) && (
            <time dateTime={item.publishedAt ?? item.targetDate ?? undefined}>
              {formatDate(item.publishedAt ?? item.targetDate)}
            </time>
          )}
        </article>
      ))}
    </div>
  );
}

export function ObservatoryPage({ dashboard }: { dashboard: PublicDashboard }) {
  const primaryMetricKeys = [
    "interactions_processed",
    "commands_executed",
    "tickets_completed",
    "operation_seconds",
  ];
  const primaryMetrics = primaryMetricKeys
    .map((key) => dashboard.metrics.find((metric) => metric.key === key))
    .filter(Boolean);
  const securityMetrics = dashboard.metrics.filter((metric) =>
    ["security_events", "messages_blocked", "automod_actions", "analyses_completed"].includes(
      metric.key,
    ),
  );
  const character = dashboard.status.character;
  return (
    <div className="bella-page observatory-page" id="inicio">
      <a className="bella-skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <SiteNavigation />
      <main id="conteudo" tabIndex={-1}>
        <header className="observatory-hero content-width">
          <div className="observatory-intro">
            <span className="eyebrow">Bella Observatory</span>
            <h1>
              O universo da Bella,
              <br />
              <em>acompanhado com clareza.</em>
            </h1>
            <p>
              Status, atividade, proteção, infraestrutura e evolução em uma leitura pública feita
              apenas com dados autorizados.
            </p>
          </div>
          <div className="observatory-live-grid">
            <article className="live-state-card live-state-primary">
              <div className="live-state-heading">
                <Radio aria-hidden="true" />
                <span>Estado operacional</span>
              </div>
              <strong data-state={dashboard.status.operational.state}>
                {statusLabels[dashboard.status.operational.state]}
              </strong>
              <p>{dashboard.status.operational.message}</p>
              <small>
                Última atualização: {formatDate(dashboard.status.operational.observedAt, true)}
              </small>
            </article>
            <article className="live-state-card">
              <div className="live-state-heading">
                {character.state === "sleeping" ? (
                  <MoonStar aria-hidden="true" />
                ) : (
                  <SunMedium aria-hidden="true" />
                )}
                <span>Estado da personagem</span>
              </div>
              <strong>{character.state === "sleeping" ? "Descansando" : "Acordada"}</strong>
              <p>{character.message}</p>
              <small>Próxima mudança: {formatDate(character.nextChangeAt, true)}</small>
            </article>
          </div>
          <nav className="observatory-sections" aria-label="Seções do Observatório">
            <a href="#visao-geral">Visão geral</a>
            <a href="#atividade">Atividade</a>
            <a href="#seguranca-publica">Segurança</a>
            <a href="#infraestrutura">Infraestrutura</a>
            <a href="#evolucao">Evolução</a>
            <a href="#comunidade-publica">Comunidade</a>
            <a href="#comandos">Comandos</a>
          </nav>
        </header>

        <section
          className="observatory-section content-width"
          id="visao-geral"
          aria-labelledby="overview-title"
        >
          <div className="observatory-section-heading">
            <div>
              <span className="eyebrow">Visão geral</span>
              <h2 id="overview-title">
                O que aconteceu
                <br />
                <em>neste período.</em>
              </h2>
            </div>
            <div className="period-filter" aria-label="Filtrar período">
              {periodOptions.map((option) => (
                <Link
                  key={option.value}
                  to="/observatorio"
                  search={{ period: option.value }}
                  aria-current={dashboard.period.period === option.value ? "page" : undefined}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="observatory-metrics">
            {primaryMetrics.map(
              (metric) =>
                metric && (
                  <article key={metric.key}>
                    <Activity aria-hidden="true" />
                    <span>{metric.label}</span>
                    <strong>{formatPublicMetric(metric)}</strong>
                    <small>
                      {metric.updatedAt
                        ? `Atualizado ${formatDate(metric.updatedAt)}`
                        : "Aguardando dados reais"}
                    </small>
                  </article>
                ),
            )}
          </div>
          <div className="observatory-graph-panel">
            <div className="graph-copy">
              <span>Evolução agregada</span>
              <h3>{dashboard.period.label}</h3>
              <p>
                Interações, comandos e ações de proteção são apresentados apenas quando existem
                pontos consolidados para comparação.
              </p>
              <div>
                <span>
                  <i className="legend-rose" /> Interações
                </span>
                <span>
                  <i className="legend-gold" /> Comandos
                </span>
                <span>
                  <i className="legend-green" /> Proteção
                </span>
              </div>
            </div>
            <ObservatoryChart data={dashboard.series} />
          </div>
        </section>

        <section
          className="observatory-section observatory-split content-width"
          id="atividade"
          aria-labelledby="activity-title"
        >
          <div className="observatory-section-heading">
            <div>
              <span className="eyebrow">Bella Activity Feed</span>
              <h2 id="activity-title">
                Uma linha do tempo
                <br />
                <em>sem abrir os bastidores.</em>
              </h2>
            </div>
            <p>
              Somente eventos classificados como públicos entram aqui. Logs administrativos,
              mensagens e dados pessoais permanecem fora.
            </p>
          </div>
          {dashboard.activities.length ? (
            <ol className="activity-feed">
              {dashboard.activities.map((item) => (
                <li key={item.id}>
                  <span className="activity-marker" />
                  <div>
                    <span>{item.category}</span>
                    <time dateTime={item.occurredAt}>{formatDate(item.occurredAt, true)}</time>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.href && (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      Ver publicação <ArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="A linha do tempo está tranquila">
              As atividades públicas aparecerão após a primeira sincronização autorizada.
            </EmptyState>
          )}
        </section>

        <section
          className="observatory-section security-public content-width"
          id="seguranca-publica"
          aria-labelledby="security-title"
        >
          <div className="observatory-section-heading">
            <div>
              <span className="eyebrow">Bella Security Center</span>
              <h2 id="security-title">
                Proteção mostrada
                <br />
                <em>sem expor ninguém.</em>
              </h2>
            </div>
            <ShieldCheck aria-hidden="true" className="section-symbol" />
          </div>
          <div className="security-metric-grid">
            {securityMetrics.map((metric) => (
              <article key={metric.key}>
                <span>{metric.label}</span>
                <strong>{formatPublicMetric(metric)}</strong>
                <small>
                  {metric.value === null ? "Sem base pública disponível" : dashboard.period.label}
                </small>
              </article>
            ))}
          </div>
          <div className="privacy-note">
            <ShieldCheck aria-hidden="true" />
            <p>
              Estes indicadores nunca incluem usuários, servidores privados, conteúdo moderado,
              regras confidenciais ou identificadores indiretos. Um evento processado não é
              apresentado automaticamente como ameaça neutralizada.
            </p>
          </div>
          <div className="reports-grid">
            <div>
              <h3>Relatórios de moderação</h3>
              <EditorialList
                items={dashboard.moderationReports}
                empty="Relatórios agregados serão exibidos quando forem publicados com amostras adequadas."
              />
            </div>
            <div>
              <h3>Resumos diários</h3>
              <EditorialList
                items={dashboard.dailySummaries}
                empty="O resumo diário será publicado após receber dados suficientes e autorizados."
              />
            </div>
          </div>
        </section>

        <section
          className="observatory-section infrastructure content-width"
          id="infraestrutura"
          aria-labelledby="infra-title"
        >
          <div className="observatory-section-heading">
            <div>
              <span className="eyebrow">Bella Infrastructure</span>
              <h2 id="infra-title">
                Serviços observados.
                <br />
                <em>Detalhes preservados.</em>
              </h2>
            </div>
            <ServerCog aria-hidden="true" className="section-symbol" />
          </div>
          {dashboard.services.length ? (
            <div className="service-grid">
              {dashboard.services.map((service) => (
                <article key={service.key}>
                  <div>
                    <span className="service-dot" data-state={service.state} />
                    <h3>{service.label}</h3>
                  </div>
                  <strong>{serviceLabels[service.state]}</strong>
                  <p>
                    {service.latencyMs === null
                      ? "Latência não publicada"
                      : `${service.latencyMs} ms observados`}
                  </p>
                  <small>{formatDate(service.observedAt, true)}</small>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="Serviços ainda não sincronizados">
              A infraestrutura pública aparecerá sem endpoints, topologia privada ou detalhes que
              ampliem a superfície de ataque.
            </EmptyState>
          )}
          <div className="availability-strip">
            <Database aria-hidden="true" />
            <div>
              <span>Disponibilidade observada</span>
              <strong>
                {dashboard.availabilityPercent === null
                  ? "Indisponível"
                  : `${dashboard.availabilityPercent.toFixed(2).replace(".", ",")}%`}
              </strong>
              <p>
                {dashboard.availabilityPercent === null
                  ? "Ainda não existem heartbeats suficientes no período."
                  : `Calculada com os heartbeats recebidos em ${dashboard.period.label.toLocaleLowerCase("pt-BR")}.`}
              </p>
            </div>
          </div>
          <div className="incidents">
            <h3>Incidentes e manutenções</h3>
            {dashboard.incidents.length ? (
              dashboard.incidents.map((incident) => (
                <article key={incident.id}>
                  <div>
                    <span data-impact={incident.impact}>{incident.impact}</span>
                    <time dateTime={incident.updatedAt}>
                      {formatDate(incident.updatedAt, true)}
                    </time>
                  </div>
                  <h4>{incident.title}</h4>
                  <p>{incident.summary}</p>
                  <small>{incident.state.replaceAll("_", " ")}</small>
                </article>
              ))
            ) : (
              <EmptyState title="Nenhum incidente público no período">
                A ausência de registros significa apenas que nenhum incidente público foi informado
                para este recorte.
              </EmptyState>
            )}
          </div>
        </section>

        <section
          className="observatory-section evolution content-width"
          id="evolucao"
          aria-labelledby="evolution-title"
        >
          <div className="observatory-section-heading">
            <div>
              <span className="eyebrow">Evolução</span>
              <h2 id="evolution-title">
                Versões, planos
                <br />
                <em>e momentos importantes.</em>
              </h2>
            </div>
            <Sparkles aria-hidden="true" className="section-symbol" />
          </div>
          <div className="evolution-grid">
            <div>
              <div className="subsection-title">
                <History aria-hidden="true" />
                <div>
                  <span>Changelog & Release Notes</span>
                  <h3>Atualizações publicadas</h3>
                </div>
              </div>
              <EditorialList
                items={dashboard.releases}
                empty="As versões serão publicadas por uma fonte editorial protegida."
              />
            </div>
            <div>
              <div className="subsection-title">
                <CalendarClock aria-hidden="true" />
                <div>
                  <span>Bella Roadmap</span>
                  <h3>Próximos passos</h3>
                </div>
              </div>
              <EditorialList
                items={dashboard.roadmap}
                empty="Nenhuma previsão pública foi cadastrada — datas internas não são tratadas como compromisso."
              />
            </div>
          </div>
          <div className="evolution-grid secondary">
            <div>
              <div className="subsection-title">
                <CheckCircle2 aria-hidden="true" />
                <div>
                  <span>Milestones</span>
                  <h3>Linha do tempo institucional</h3>
                </div>
              </div>
              <EditorialList
                items={dashboard.milestones}
                empty="Marcos históricos aparecerão somente com datas confirmadas."
              />
            </div>
            <div>
              <div className="subsection-title">
                <BookOpenCheck aria-hidden="true" />
                <div>
                  <span>Achievements</span>
                  <h3>Conquistas registradas</h3>
                </div>
              </div>
              <EditorialList
                items={dashboard.achievements}
                empty="Conquistas futuras dependerão de fatos registrados, nunca de valores inventados."
              />
            </div>
          </div>
        </section>

        <section
          className="observatory-section community-public content-width"
          id="comunidade-publica"
          aria-labelledby="community-title"
        >
          <div className="observatory-section-heading">
            <div>
              <span className="eyebrow">Bella Community Insights</span>
              <h2 id="community-title">
                Comunidade em movimento.
                <br />
                <em>Sempre com autorização.</em>
              </h2>
            </div>
            <HeartHandshake aria-hidden="true" className="section-symbol" />
          </div>
          <div className="community-public-grid">
            <article>
              <Bot aria-hidden="true" />
              <span>Membros na comunidade participante</span>
              <strong>
                {dashboard.community.members === null
                  ? "Indisponível"
                  : new Intl.NumberFormat("pt-BR").format(dashboard.community.members)}
              </strong>
            </article>
            <article>
              <ArrowUpRight aria-hidden="true" />
              <span>Interações agregadas</span>
              <strong>
                {dashboard.community.interactions === null
                  ? "Indisponível"
                  : new Intl.NumberFormat("pt-BR").format(dashboard.community.interactions)}
              </strong>
            </article>
            <article>
              <ArrowDownRight aria-hidden="true" />
              <span>Atividades comunitárias</span>
              <strong>
                {dashboard.community.events === null
                  ? "Indisponível"
                  : new Intl.NumberFormat("pt-BR").format(dashboard.community.events)}
              </strong>
            </article>
          </div>
          <p className="community-methodology">
            Somente comunidades explicitamente autorizadas participam destes indicadores. A contagem
            não presume usuários únicos entre servidores diferentes.
          </p>
        </section>

        <section
          className="observatory-section commands-public content-width"
          id="comandos"
          aria-labelledby="commands-title"
        >
          <div className="observatory-section-heading">
            <div>
              <span className="eyebrow">Bella Commands Catalog</span>
              <h2 id="commands-title">
                O que é público.
                <br />
                <em>E somente o que é público.</em>
              </h2>
            </div>
            <Command aria-hidden="true" className="section-symbol" />
          </div>
          <CommandsCatalog commands={dashboard.commands} />
        </section>

        <section className="observatory-method content-width" aria-label="Metodologia dos dados">
          <Clock3 aria-hidden="true" />
          <div>
            <h2>Sobre estes dados</h2>
            <p>
              O Observatório consulta dados persistidos; ele não acessa o Discord a cada visita.
              Informações desatualizadas são identificadas, valores ausentes não viram zero e o
              horário de descanso nunca substitui o estado operacional.
            </p>
            <small>
              Resposta gerada em{" "}
              <time dateTime={dashboard.generatedAt}>
                {formatDate(dashboard.generatedAt, true)}
              </time>{" "}
              • Fuso público: America/Recife
            </small>
          </div>
        </section>
      </main>
      <Footer01 homePath="/" />
    </div>
  );
}
